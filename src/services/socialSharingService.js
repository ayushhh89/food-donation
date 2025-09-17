// src/services/socialSharingService.js
import html2canvas from 'html2canvas';
import { useState } from 'react';


/**
 * Social Sharing Service
 * Handles sharing of donations, achievements, and impact metrics
 */
export class SocialSharingService {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  // Generate share content for donations
  generateDonationShareContent(donation) {
    const title = `🍽️ ${donation.title} - Available on FoodShare`;
    const text = `I'm sharing ${donation.quantity} ${donation.unit} of ${donation.category.toLowerCase()} with the community. Help reduce food waste and support those in need!`;
    const url = `${this.baseUrl}/donation/${donation.id}`;
    const hashtags = ['FoodShare', 'ZeroWaste', 'CommunitySupport', 'FoodDonation'];

    return {
      title,
      text,
      url,
      hashtags,
      image: donation.images?.[0] || null
    };
  }

  // Generate share content for impact achievements
  generateImpactShareContent(impactData, userName) {
    const title = `🌟 My Food Sharing Impact - ${userName}`;
    const text = `I've helped ${impactData.peopleHelped} people and saved ${impactData.foodSaved}kg of food through @FoodShare! Join me in reducing food waste and supporting our community. #FoodShare #CommunityImpact #ZeroWaste`;
    const url = `${this.baseUrl}`;

    return {
      title,
      text,
      url,
      hashtags: ['FoodShare', 'CommunityImpact', 'ZeroWaste', 'FoodDonation'],
      impactStats: {
        donations: impactData.totalDonations,
        peopleHelped: impactData.peopleHelped,
        foodSaved: impactData.foodSaved,
        carbonReduced: impactData.carbonFootprintReduced
      }
    };
  }

  // Generate share content for milestones
  generateMilestoneShareContent(milestone, userName) {
    const title = `🏆 Achievement Unlocked - ${milestone.name}`;
    const text = `I just earned the "${milestone.name}" badge on FoodShare! ${milestone.description} Join me in making a difference in our community! #FoodShare #CommunityHero`;
    const url = `${this.baseUrl}`;

    return {
      title,
      text,
      url,
      hashtags: ['FoodShare', 'Achievement', 'CommunityHero', 'MakingADifference'],
      milestone
    };
  }

  // Share via Web Share API
  async shareViaWebAPI(shareData) {
    try {
      if (navigator.share && navigator.canShare) {
        const canShare = navigator.canShare({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url
        });

        if (canShare) {
          await navigator.share({
            title: shareData.title,
            text: shareData.text,
            url: shareData.url
          });
          return { success: true, method: 'native' };
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Share cancelled by user' };
      }
      console.error('Native sharing failed:', error);
    }

    // Fallback to other methods
    return this.shareViaFallback(shareData);
  }

  // Copy to clipboard as fallback
  async shareViaFallback(shareData) {
    try {
      const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
        return { success: true, method: 'clipboard' };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (copied) {
          return { success: true, method: 'clipboard_legacy' };
        }
      }
    } catch (error) {
      console.error('Clipboard sharing failed:', error);
    }

    return { success: false, error: 'Sharing not supported' };
  }

  // Share to specific platforms
  shareToFacebook(shareData) {
    const url = new URL('https://www.facebook.com/sharer/sharer.php');
    url.searchParams.set('u', shareData.url);
    url.searchParams.set('quote', shareData.text);
    
    window.open(url.toString(), '_blank', 'width=600,height=400');
    return { success: true, method: 'facebook' };
  }

  shareToTwitter(shareData) {
    const url = new URL('https://twitter.com/intent/tweet');
    url.searchParams.set('text', shareData.text);
    url.searchParams.set('url', shareData.url);
    if (shareData.hashtags) {
      url.searchParams.set('hashtags', shareData.hashtags.join(','));
    }
    
    window.open(url.toString(), '_blank', 'width=600,height=400');
    return { success: true, method: 'twitter' };
  }

  shareToLinkedIn(shareData) {
    const url = new URL('https://www.linkedin.com/sharing/share-offsite/');
    url.searchParams.set('url', shareData.url);
    
    window.open(url.toString(), '_blank', 'width=600,height=400');
    return { success: true, method: 'linkedin' };
  }

  shareToWhatsApp(shareData) {
    const text = `${shareData.text}\n\n${shareData.url}`;
    const url = new URL('https://wa.me/');
    url.searchParams.set('text', text);
    
    window.open(url.toString(), '_blank');
    return { success: true, method: 'whatsapp' };
  }

  shareToTelegram(shareData) {
    const text = `${shareData.text}\n\n${shareData.url}`;
    const url = new URL('https://t.me/share/url');
    url.searchParams.set('url', shareData.url);
    url.searchParams.set('text', shareData.text);
    
    window.open(url.toString(), '_blank', 'width=600,height=400');
    return { success: true, method: 'telegram' };
  }

  // Generate image for sharing (for impact cards)
  async generateShareImage(elementId, options = {}) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        ...options
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating share image:', error);
      return null;
    }
  }

  // Save image for sharing
  downloadShareImage(imageDataUrl, filename = 'foodshare-impact.png') {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    } catch (error) {
      console.error('Error downloading share image:', error);
      return { success: false, error: error.message };
    }
  }

  // Check platform availability
  getPlatformAvailability() {
    return {
      webShare: navigator.share && navigator.canShare,
      clipboard: navigator.clipboard || document.queryCommandSupported?.('copy'),
      facebook: true,
      twitter: true,
      linkedin: true,
      whatsapp: true,
      telegram: true
    };
  }

  // Main share function that tries multiple methods
  async share(type, data, options = {}) {
    let shareContent;
    
    switch (type) {
      case 'donation':
        shareContent = this.generateDonationShareContent(data);
        break;
      case 'impact':
        shareContent = this.generateImpactShareContent(data.impactData, data.userName);
        break;
      case 'milestone':
        shareContent = this.generateMilestoneShareContent(data.milestone, data.userName);
        break;
      default:
        throw new Error('Invalid share type');
    }

    // Try specific platform if requested
    if (options.platform) {
      switch (options.platform) {
        case 'facebook':
          return this.shareToFacebook(shareContent);
        case 'twitter':
          return this.shareToTwitter(shareContent);
        case 'linkedin':
          return this.shareToLinkedIn(shareContent);
        case 'whatsapp':
          return this.shareToWhatsApp(shareContent);
        case 'telegram':
          return this.shareToTelegram(shareContent);
        case 'clipboard':
          return this.shareViaFallback(shareContent);
        default:
          throw new Error('Invalid platform');
      }
    }

    // Try Web Share API first, then fallback
    return this.shareViaWebAPI(shareContent);
  }

  // Analytics tracking for shares (integrate with your analytics service)
  trackShare(type, platform, success) {
    // This would integrate with your analytics service (Google Analytics, etc.)
    console.log('Share tracked:', { type, platform, success, timestamp: new Date().toISOString() });
    
    // Example integration:
    // if (window.gtag) {
    //   window.gtag('event', 'share', {
    //     content_type: type,
    //     item_id: platform,
    //     custom_parameter: success ? 'success' : 'failed'
    //   });
    // }
  }

  // Generate QR code for donation (for offline sharing)
  generateQRCode(donationUrl) {
    // This would integrate with a QR code library
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(donationUrl)}`;
    return qrCodeUrl;
  }
}

// Export singleton instance
export const socialSharingService = new SocialSharingService();

// React hook for social sharing
export const useSocialSharing = () => {
  const [isSharing, setIsSharing] = useState(false);

  const share = async (type, data, options = {}) => {
    setIsSharing(true);
    try {
      const result = await socialSharingService.share(type, data, options);
      
      // Track the share
      socialSharingService.trackShare(type, result.method, result.success);
      
      return result;
    } catch (error) {
      console.error('Share error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSharing(false);
    }
  };

  const generateImage = async (elementId, options) => {
    return socialSharingService.generateShareImage(elementId, options);
  };

  const downloadImage = (imageDataUrl, filename) => {
    return socialSharingService.downloadShareImage(imageDataUrl, filename);
  };

  const platformAvailability = socialSharingService.getPlatformAvailability();

  return {
    share,
    generateImage,
    downloadImage,
    isSharing,
    platformAvailability
  };
};

export default socialSharingService;