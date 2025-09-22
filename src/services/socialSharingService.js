// src/services/enhancedSocialSharingService.js
import html2canvas from 'html2canvas';
import { useState } from 'react';

export class socialSharingService {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  // Generate beautiful share content with rich visuals
  generateDonationShareContent(donation) {
    const shareUrl = `${this.baseUrl}/donation/${donation.id}`;
    
    return {
      url: shareUrl,
      title: `🍽️ ${donation.title} - Available on FoodShare`,
      description: `Fresh ${donation.category.toLowerCase()} available for pickup! Join our mission to reduce food waste and feed the community.`,
      image: donation.images?.[0] || this.generateDefaultImage(donation),
      hashtags: ['FoodShare', 'ZeroWaste', 'CommunitySupport', 'FoodDonation', donation.category],
      donation: donation,
      type: 'donation'
    };
  }

  generateImpactShareContent(impactData, userName) {
    return {
      url: this.baseUrl,
      title: `🌟 ${userName}'s Food Sharing Impact`,
      description: `I've helped ${impactData.peopleHelped || 0} people and saved ${impactData.foodSaved || 0}kg of food through FoodShare! Join me in making a difference.`,
      hashtags: ['FoodShare', 'CommunityImpact', 'ZeroWaste', 'MakingADifference'],
      impactData: impactData,
      userName: userName,
      type: 'impact'
    };
  }

  generateMilestoneShareContent(milestone, userName) {
    return {
      url: this.baseUrl,
      title: `🏆 Achievement Unlocked: ${milestone.name}`,
      description: `I just earned the "${milestone.name}" badge on FoodShare! ${milestone.description}`,
      hashtags: ['FoodShare', 'Achievement', 'CommunityHero', milestone.category],
      milestone: milestone,
      userName: userName,
      type: 'milestone'
    };
  }

  // Create beautiful visual share cards
  async generateShareCard(data, elementId = 'share-card-container') {
    // Create a temporary container for the share card
    const container = document.createElement('div');
    container.id = elementId;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1200px';
    container.style.height = '630px';
    document.body.appendChild(container);

    // Generate the appropriate card based on type
    let cardHTML = '';
    
    switch (data.type) {
      case 'donation':
        cardHTML = this.generateDonationCard(data);
        break;
      case 'impact':
        cardHTML = this.generateImpactCard(data);
        break;
      case 'milestone':
        cardHTML = this.generateMilestoneCard(data);
        break;
      default:
        cardHTML = this.generateDefaultCard(data);
    }

    container.innerHTML = cardHTML;

    try {
      // Generate image using html2canvas
      const canvas = await html2canvas(container, {
        width: 1200,
        height: 630,
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false
      });

      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      
      // Clean up
      document.body.removeChild(container);
      
      return imageDataUrl;
    } catch (error) {
      console.error('Error generating share card:', error);
      document.body.removeChild(container);
      return null;
    }
  }

  generateDonationCard(data) {
    const { donation } = data;
    const timeLeft = donation.expiryDate ? this.getTimeRemaining(donation.expiryDate) : null;
    
    return `
      <div style="
        width: 1200px;
        height: 630px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        position: relative;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border-radius: 24px;
      ">
        <!-- Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
          z-index: 1;
        "></div>

        <!-- Content Container -->
        <div style="
          position: relative;
          z-index: 2;
          padding: 60px;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 60px;
        ">
          <!-- Left Content -->
          <div style="flex: 1; color: white;">
            <!-- Logo & Brand -->
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 40px;">
              <div style="
                width: 80px;
                height: 80px;
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255,255,255,0.3);
              ">🍽️</div>
              <div>
                <div style="font-size: 28px; font-weight: 800; margin-bottom: 4px;">FoodShare</div>
                <div style="font-size: 16px; opacity: 0.9;">Reducing Food Waste Together</div>
              </div>
            </div>

            <!-- Donation Title -->
            <h1 style="
              font-size: 48px;
              font-weight: 900;
              margin: 0 0 24px 0;
              line-height: 1.1;
              background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">${donation.title}</h1>

            <!-- Donation Details -->
            <div style="margin-bottom: 32px;">
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.25);
                padding: 12px 24px;
                border-radius: 16px;
                font-size: 18px;
                font-weight: 600;
                margin-right: 16px;
                margin-bottom: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.3);
              ">${donation.category}</div>
              
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.25);
                padding: 12px 24px;
                border-radius: 16px;
                font-size: 18px;
                font-weight: 600;
                margin-right: 16px;
                margin-bottom: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.3);
              ">${donation.quantity} ${donation.unit}</div>
              
              ${timeLeft ? `
                <div style="
                  display: inline-block;
                  background: ${timeLeft.urgent ? 'rgba(239, 68, 68, 0.9)' : 'rgba(251, 191, 36, 0.9)'};
                  padding: 12px 24px;
                  border-radius: 16px;
                  font-size: 18px;
                  font-weight: 700;
                  margin-bottom: 12px;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255,255,255,0.3);
                ">⏰ ${timeLeft.text} left</div>
              ` : ''}
            </div>

            <!-- Call to Action -->
            <div style="
              font-size: 24px;
              font-weight: 600;
              opacity: 0.95;
              line-height: 1.4;
            ">Available for pickup now!<br/>Join our mission to reduce food waste.</div>

            <!-- Website -->
            <div style="
              position: absolute;
              bottom: 60px;
              left: 60px;
              font-size: 18px;
              opacity: 0.9;
              font-weight: 500;
            ">🌐 ${window.location.hostname}</div>
          </div>

          <!-- Right Image -->
          <div style="width: 400px; height: 500px; position: relative;">
            ${donation.images && donation.images[0] ? `
              <img src="${donation.images[0]}" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 24px;
                border: 4px solid rgba(255,255,255,0.3);
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              " />
            ` : `
              <div style="
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.2);
                border-radius: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 120px;
                backdrop-filter: blur(10px);
                border: 4px solid rgba(255,255,255,0.3);
              ">🥘</div>
            `}
            
            <!-- Floating Elements -->
            <div style="
              position: absolute;
              top: -20px;
              right: -20px;
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #00C853 0%, #4CAF50 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              box-shadow: 0 12px 40px rgba(0,200,83,0.4);
              border: 4px solid rgba(255,255,255,0.3);
            ">✨</div>
          </div>
        </div>
      </div>
    `;
  }

  generateImpactCard(data) {
    const { impactData, userName } = data;
    
    return `
      <div style="
        width: 1200px;
        height: 630px;
        background: linear-gradient(135deg, #00C853 0%, #4CAF50 100%);
        position: relative;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border-radius: 24px;
      ">
        <!-- Background Pattern -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15) 0%, transparent 50%);
          z-index: 1;
        "></div>

        <!-- Floating Elements -->
        <div style="
          position: absolute;
          top: 100px;
          right: 150px;
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,255,255,0.3);
        "></div>
        
        <div style="
          position: absolute;
          bottom: 100px;
          right: 100px;
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,255,255,0.3);
        "></div>

        <!-- Content -->
        <div style="
          position: relative;
          z-index: 2;
          padding: 60px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
        ">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 50px;">
            <div style="
              font-size: 80px;
              margin-bottom: 20px;
              text-shadow: 0 4px 20px rgba(0,0,0,0.2);
            ">🌟</div>
            <h1 style="
              font-size: 56px;
              font-weight: 900;
              margin: 0 0 16px 0;
              line-height: 1.1;
              text-shadow: 0 4px 20px rgba(0,0,0,0.2);
            ">${userName}'s Impact</h1>
            <p style="
              font-size: 24px;
              opacity: 0.95;
              font-weight: 500;
              margin: 0;
            ">Making a difference through food sharing</p>
          </div>

          <!-- Stats Grid -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 40px;
            margin-bottom: 50px;
          ">
            <div style="text-align: center;">
              <div style="
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                padding: 32px 24px;
                backdrop-filter: blur(20px);
                border: 2px solid rgba(255,255,255,0.3);
                box-shadow: 0 12px 40px rgba(0,0,0,0.1);
              ">
                <div style="
                  font-size: 64px;
                  font-weight: 900;
                  margin-bottom: 12px;
                  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                ">${impactData.totalDonations || 0}</div>
                <div style="
                  font-size: 18px;
                  font-weight: 600;
                  opacity: 0.9;
                ">Donations Shared</div>
              </div>
            </div>

            <div style="text-align: center;">
              <div style="
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                padding: 32px 24px;
                backdrop-filter: blur(20px);
                border: 2px solid rgba(255,255,255,0.3);
                box-shadow: 0 12px 40px rgba(0,0,0,0.1);
              ">
                <div style="
                  font-size: 64px;
                  font-weight: 900;
                  margin-bottom: 12px;
                  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                ">${impactData.peopleHelped || 0}</div>
                <div style="
                  font-size: 18px;
                  font-weight: 600;
                  opacity: 0.9;
                ">People Helped</div>
              </div>
            </div>

            <div style="text-align: center;">
              <div style="
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                padding: 32px 24px;
                backdrop-filter: blur(20px);
                border: 2px solid rgba(255,255,255,0.3);
                box-shadow: 0 12px 40px rgba(0,0,0,0.1);
              ">
                <div style="
                  font-size: 64px;
                  font-weight: 900;
                  margin-bottom: 12px;
                  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                ">${(impactData.foodSaved || 0).toFixed(1)}kg</div>
                <div style="
                  font-size: 18px;
                  font-weight: 600;
                  opacity: 0.9;
                ">Food Saved</div>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center;">
            <div style="
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 16px;
              background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">Join the movement!</div>
            <div style="
              font-size: 20px;
              opacity: 0.9;
              font-weight: 500;
            ">🌐 ${window.location.hostname}</div>
          </div>
        </div>
      </div>
    `;
  }

  generateMilestoneCard(data) {
    const { milestone, userName } = data;
    
    return `
      <div style="
        width: 1200px;
        height: 630px;
        background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
        position: relative;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border-radius: 24px;
      ">
        <!-- Background Elements -->
        <div style="
          position: absolute;
          top: -50px;
          right: -50px;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          backdrop-filter: blur(20px);
        "></div>
        
        <div style="
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
        "></div>

        <!-- Content -->
        <div style="
          position: relative;
          z-index: 2;
          padding: 60px;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 60px;
          color: white;
        ">
          <!-- Left: Badge -->
          <div style="text-align: center; flex-shrink: 0;">
            <div style="
              width: 300px;
              height: 300px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              backdrop-filter: blur(20px);
              border: 6px solid rgba(255,255,255,0.3);
              box-shadow: 0 20px 60px rgba(0,0,0,0.2);
              margin-bottom: 24px;
            ">
              <div style="
                font-size: 120px;
                text-shadow: 0 4px 20px rgba(0,0,0,0.2);
              ">${milestone.icon || '🏆'}</div>
            </div>
            <div style="
              font-size: 24px;
              font-weight: 700;
              opacity: 0.9;
            ">${milestone.category || 'Achievement'}</div>
          </div>

          <!-- Right: Content -->
          <div style="flex: 1;">
            <div style="
              font-size: 28px;
              font-weight: 600;
              opacity: 0.9;
              margin-bottom: 16px;
            ">${userName} just earned:</div>
            
            <h1 style="
              font-size: 56px;
              font-weight: 900;
              margin: 0 0 24px 0;
              line-height: 1.1;
              background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">${milestone.name}</h1>

            <p style="
              font-size: 24px;
              line-height: 1.4;
              opacity: 0.95;
              margin-bottom: 40px;
              font-weight: 500;
            ">${milestone.description}</p>

            <!-- Achievement Stats -->
            ${milestone.requirements ? `
              <div style="
                background: rgba(255,255,255,0.2);
                border-radius: 16px;
                padding: 24px;
                backdrop-filter: blur(20px);
                border: 2px solid rgba(255,255,255,0.3);
                margin-bottom: 32px;
              ">
                <div style="
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: 12px;
                ">Achievement Requirements:</div>
                <div style="
                  font-size: 16px;
                  opacity: 0.9;
                ">${milestone.requirements}</div>
              </div>
            ` : ''}

            <!-- Call to Action -->
            <div style="
              font-size: 20px;
              font-weight: 600;
              opacity: 0.9;
            ">Join FoodShare and earn your own achievements!</div>
            <div style="
              font-size: 18px;
              opacity: 0.8;
              margin-top: 8px;
            ">🌐 ${window.location.hostname}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Enhanced sharing methods with visual cards
  async shareWithVisualCard(type, data, platform = null) {
    try {
      // Generate share content
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
      }

      // Generate visual card
      const imageDataUrl = await this.generateShareCard(shareContent);
      
      if (platform) {
        return this.shareToSpecificPlatform(platform, shareContent, imageDataUrl);
      } else {
        return this.shareViaWebAPI(shareContent, imageDataUrl);
      }
    } catch (error) {
      console.error('Error sharing with visual card:', error);
      throw error;
    }
  }

  async shareViaWebAPI(shareContent, imageDataUrl = null) {
    try {
      if (navigator.share) {
        const shareData = {
          title: shareContent.title,
          text: shareContent.description,
          url: shareContent.url
        };

        // Try to include image if supported
        if (imageDataUrl && navigator.canShare) {
          try {
            const blob = await this.dataURLToBlob(imageDataUrl);
            const file = new File([blob], 'foodshare-image.png', { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (error) {
            console.log('Image sharing not supported, falling back to text');
          }
        }

        await navigator.share(shareData);
        return { success: true, method: 'native' };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Share cancelled by user' };
      }
    }

    // Fallback to clipboard
    return this.copyToClipboard(shareContent);
  }

  shareToSpecificPlatform(platform, shareContent, imageDataUrl = null) {
    const encodedText = encodeURIComponent(shareContent.description);
    const encodedUrl = encodeURIComponent(shareContent.url);
    const hashtags = shareContent.hashtags ? shareContent.hashtags.join(',') : '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${hashtags}`, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'width=600,height=400');
        break;
      case 'download':
        if (imageDataUrl) {
          this.downloadImage(imageDataUrl, `foodshare-${shareContent.type}-${Date.now()}.png`);
        }
        break;
      default:
        return this.copyToClipboard(shareContent);
    }

    return { success: true, method: platform };
  }

  async copyToClipboard(shareContent) {
    try {
      const shareText = `${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.url}`;
      
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

  downloadImage(imageDataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async dataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    return response.blob();
  }

  getTimeRemaining(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const hoursRemaining = (expiry - now) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return { text: 'Expired', urgent: true, expired: true };
    } else if (hoursRemaining < 1) {
      return { text: 'Less than 1 hour', urgent: true };
    } else if (hoursRemaining < 6) {
      return { text: `${Math.round(hoursRemaining)} hours`, urgent: true };
    } else if (hoursRemaining < 24) {
      return { text: `${Math.round(hoursRemaining)} hours`, urgent: false };
    } else {
      const daysRemaining = Math.round(hoursRemaining / 24);
      return { text: `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`, urgent: false };
    }
  }
}

// Enhanced React Hook
export const useEnhancedSocialSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const service = new socialSharingService();

  const shareWithCard = async (type, data, platform = null) => {
    setIsSharing(true);
    setIsGeneratingCard(true);
    
    try {
      const result = await service.shareWithVisualCard(type, data, platform);
      return result;
    } catch (error) {
      console.error('Share error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSharing(false);
      setIsGeneratingCard(false);
    }
  };

  const generatePreviewCard = async (type, data) => {
    setIsGeneratingCard(true);
    
    try {
      let shareContent;
      switch (type) {
        case 'donation':
          shareContent = service.generateDonationShareContent(data);
          break;
        case 'impact':
          shareContent = service.generateImpactShareContent(data.impactData, data.userName);
          break;
        case 'milestone':
          shareContent = service.generateMilestoneShareContent(data.milestone, data.userName);
          break;
      }

      const imageDataUrl = await service.generateShareCard(shareContent);
      return imageDataUrl;
    } catch (error) {
      console.error('Preview generation error:', error);
      return null;
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return {
    shareWithCard,
    generatePreviewCard,
    isSharing,
    isGeneratingCard,
    service
  };
};

export default socialSharingService;