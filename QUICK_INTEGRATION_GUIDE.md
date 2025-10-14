# Quick Integration Guide - VolunteerInfoCard

## 🚀 3 Steps to Complete Integration

### Step 1: Deploy Firebase Rules

1. Open Firebase Console: https://console.firebase.google.com/
2. Navigate to your project
3. Go to **Firestore Database** → **Rules**
4. Copy the contents of `rules.txt` in this project
5. Paste and **Publish** the rules
6. Wait for deployment to complete (~30 seconds)

### Step 2: Integrate into Donor Dashboard (MyDonations.js)

Add this import at the top of `src/pages/MyDonations.js`:
```javascript
import VolunteerInfoCard from '../components/delivery/VolunteerInfoCard';
```

Find where you render donation cards and add this inside each donation card:
```javascript
{/* Show volunteer info if assigned */}
{donation.assignedVolunteerId && (
  <Box sx={{ mt: 3, mb: 2 }}>
    <VolunteerInfoCard
      donationId={donation.id}
      userRole="donor"
      currentUserId={currentUser.uid}
    />
  </Box>
)}
```

### Step 3: Integrate into Receiver Dashboard (BrowseDonations.js)

Add this import at the top of `src/pages/BrowseDonations.js`:
```javascript
import VolunteerInfoCard from '../components/delivery/VolunteerInfoCard';
```

Find where you render claimed donations and add:
```javascript
{/* Show volunteer info for claimed donations */}
{donation.claimedBy === currentUser.uid && donation.assignedVolunteerId && (
  <Box sx={{ mt: 3, mb: 2 }}>
    <VolunteerInfoCard
      donationId={donation.id}
      userRole="receiver"
      currentUserId={currentUser.uid}
    />
  </Box>
)}
```

---

## ✅ That's It!

The volunteer flow will now work automatically:
- ✅ Admins can assign volunteers
- ✅ Donors see volunteer details
- ✅ Receivers can confirm deliveries
- ✅ Volunteers earn 5 credits on confirmation
- ✅ Real-time status updates

---

## 📧 EmailJS Fix

**The email issue requires manual action:**

1. Go to https://dashboard.emailjs.com/
2. Sign in
3. Navigate to "Email Services"
4. Click your Gmail service
5. Click "Reconnect"
6. Authorize Gmail access
7. Test connection

This is a one-time fix that takes ~2 minutes.

---

## 🎯 Testing the Flow

1. **As Admin**: Go to AdminDashboard → Assign Delivery → Select volunteer & donation
2. **As Donor**: View your donation → See volunteer card appear
3. **As Volunteer**: See assignment in VolunteerDashboard → Start ride
4. **As Receiver**: See volunteer details → Confirm delivery → Volunteer gets 5 credits

---

## 🚨 Need Help?

Check `VOLUNTEER_FLOW_IMPLEMENTATION.md` for detailed documentation.

**Common Issues**:
- Card not showing? Check if `assignedVolunteerId` exists on donation
- Permission errors? Deploy updated Firebase rules
- Confirmation not working? Verify ride status is `in_progress`
