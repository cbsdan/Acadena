import { AuthClient } from '@dfinity/auth-client';

class InternetIdentityRegistrationService {
  constructor() {
    this.isLocalNetwork = process.env.DFX_NETWORK !== 'ic';
  }

  getInternetIdentityUrl() {
    if (this.isLocalNetwork) {
      const canisterId = process.env.CANISTER_ID_INTERNET_IDENTITY || 'uzt4z-lp777-77774-qaabq-cai';
      return `http://${canisterId}.localhost:4943`;
    } else {
      return 'https://identity.ic0.app';
    }
  }

  /**
   * Simplified Internet Identity creation that redirects to II registration
   */
  async createNewInternetIdentity(displayName = 'Institution Admin', formData = null) {
    try {
      // Store form data if provided (for institution registration)
      if (formData) {
        localStorage.setItem('pendingInstitutionRegistration', JSON.stringify({
          formData,
          timestamp: Date.now()
        }));
      }
      
      // Store that we're expecting a new registration
      localStorage.setItem('expectingNewII', 'true');
      
      // Create AuthClient and initiate login flow (which will redirect to II)
      const authClient = await AuthClient.create();
      
      // Get current application URL for redirect
      const currentUrl = window.location.origin;
      
      // Login with Internet Identity - this will redirect to II and back
      await authClient.login({
        identityProvider: this.getInternetIdentityUrl(),
        onSuccess: () => {
          console.log('Internet Identity authentication successful');
          // Set a flag to indicate successful authentication
          localStorage.setItem('iiAuthSuccess', 'true');
          // Trigger a page refresh to handle the new authentication state
          window.location.reload();
        },
        onError: (error) => {
          console.error('Internet Identity authentication failed:', error);
          localStorage.removeItem('expectingNewII');
          localStorage.removeItem('pendingInstitutionRegistration');
        },
        // Add derivationOrigin for local development
        derivationOrigin: this.isLocalNetwork ? undefined : currentUrl,
        // Redirect back to current page
        windowOpenerFeatures: 'width=500,height=500,left=' + 
          (window.screen.width / 2 - 250) + ',top=' + 
          (window.screen.height / 2 - 250)
      });
      
      return {
        success: true,
        requiresRedirect: true,
        message: 'Redirecting to Internet Identity...'
      };
      
    } catch (error) {
      console.error('Error creating Internet Identity:', error);
      // Clean up on error
      localStorage.removeItem('expectingNewII');
      localStorage.removeItem('pendingInstitutionRegistration');
      return {
        success: false,
        error: 'Failed to create Internet Identity: ' + error.message
      };
    }
  }

  /**
   * Check if user just completed Internet Identity registration
   */
  checkForPendingRegistration() {
    try {
      const pendingData = localStorage.getItem('pendingInstitutionRegistration');
      const expectingNew = localStorage.getItem('expectingNewII');
      
      if (pendingData && expectingNew === 'true') {
        const data = JSON.parse(pendingData);
        // Check if data is not too old (max 30 minutes)
        if (Date.now() - data.timestamp < 30 * 60 * 1000) {
          return data.formData;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for pending registration:', error);
      return null;
    }
  }

  /**
   * Clear pending registration data
   */
  clearPendingRegistration() {
    try {
      localStorage.removeItem('pendingInstitutionRegistration');
      localStorage.removeItem('expectingNewII');
    } catch (error) {
      console.warn('Failed to clear pending registration:', error);
    }
  }

  /**
   * Check if the service is supported in current environment
   */
  isSupported() {
    return typeof localStorage !== 'undefined';
  }
}

// Export singleton instance
export const internetIdentityRegistrationService = new InternetIdentityRegistrationService();
