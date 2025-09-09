// src/services/emailService.js
import emailjs from '@emailjs/browser';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Initialize EmailJS with your public key
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Track ongoing email processes to prevent duplicates
const emailProcesses = new Set();

// Get all receiver emails from Firestore
export const getAllReceivers = async () => {
  try {
    console.log('Fetching all receivers from Firestore...');
    
    // Query users collection for all receivers
    const usersRef = collection(db, 'users');
    const receiversQuery = query(usersRef, where('role', '==', 'receiver'));
    const querySnapshot = await getDocs(receiversQuery);
    
    const receivers = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email && userData.isActive !== false) {
        receivers.push({
          email: userData.email,
          name: userData.name || 'Food Receiver'
        });
      }
    });
    
    console.log(`Found ${receivers.length} active receivers:`, receivers.map(r => r.email));
    return receivers;
    
  } catch (error) {
    console.error('Error fetching receivers:', error);
    throw error;
  }
};

// Format date for email
const formatExpiryDate = (expiryDate) => {
  if (!expiryDate) return 'Not specified';
  
  const date = new Date(expiryDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Send email notification to a single receiver with retry logic
export const sendDonationEmail = async (receiverEmail, receiverName, donationData, retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    const emailParams = {
      to_name: receiverName,
      to_email: receiverEmail, // This is crucial - make sure your EmailJS template uses this variable
      donation_title: donationData.title,
      donation_description: donationData.description,
      donation_category: donationData.category,
      donation_quantity: donationData.quantity,
      donation_unit: donationData.unit,
      donation_serving_size: donationData.servingSize || 'Not specified',
      donation_expiry: formatExpiryDate(donationData.expiryDate),
      pickup_address: donationData.pickupAddress,
      pickup_instructions: donationData.pickupInstructions || 'Contact donor for details',
      donor_name: donationData.donorName,
      donor_contact: donationData.contactPhone,
      donation_id: donationData.id,
      app_url: BASE_URL
    };

    console.log(`Sending email to ${receiverEmail}...`, { emailParams });
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams
    );
    
    console.log(`Email sent successfully to ${receiverEmail}:`, response.status);
    return { success: true, email: receiverEmail, response };
    
  } catch (error) {
    console.error(`Failed to send email to ${receiverEmail}:`, error);
    
    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying email to ${receiverEmail} (attempt ${retryCount + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return sendDonationEmail(receiverEmail, receiverName, donationData, retryCount + 1);
    }
    
    return { success: false, email: receiverEmail, error: error.message };
  }
};

// Send notifications to all receivers with duplicate prevention
export const notifyAllReceivers = async (donationData) => {
  const processId = `${donationData.id}_${Date.now()}`;
  
  // Prevent duplicate processes
  if (emailProcesses.has(donationData.id)) {
    console.log('Email process already running for this donation, skipping...');
    return { success: false, message: 'Email process already running' };
  }
  
  emailProcesses.add(donationData.id);
  
  try {
    console.log('Starting email notification process for donation:', donationData.id);
    
    // Get all receivers
    const receivers = await getAllReceivers();
    
    if (receivers.length === 0) {
      console.log('No receivers found to notify');
      return { success: true, sent: 0, failed: 0, results: [] };
    }
    
    console.log(`Sending emails to ${receivers.length} receivers...`);
    
    // Send emails to all receivers with staggered timing to avoid rate limits
    const results = [];
    for (let i = 0; i < receivers.length; i++) {
      const receiver = receivers[i];
      
      // Add small delay between emails to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = await sendDonationEmail(receiver.email, receiver.name, donationData);
      results.push(result);
    }
    
    // Count successes and failures
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Email notification complete: ${sent} sent, ${failed} failed`);
    console.log('Detailed results:', results);
    
    return {
      success: true,
      sent,
      failed,
      total: receivers.length,
      results
    };
    
  } catch (error) {
    console.error('Error in email notification process:', error);
    throw error;
  } finally {
    // Remove from process tracking after completion
    setTimeout(() => {
      emailProcesses.delete(donationData.id);
    }, 5000); // Keep for 5 seconds to prevent immediate duplicates
  }
};