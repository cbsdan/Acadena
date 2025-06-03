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
      console.log('💾 InternetIdentityRegistrationService: Creating new Internet Identity...');
      console.log('💾 InternetIdentityRegistrationService: Form data received:', formData);
      
      // Validate form data
      if (formData) {
        const requiredFields = [
          'name', 'institutionType', 'address', 'contactEmail', 
          'contactPhone', 'accreditationNumber', 'adminFirstName', 
          'adminLastName', 'adminEmail'
        ];
        
        const missingFields = requiredFields.filter(field => 
          !formData[field] || 
          (typeof formData[field] === 'string' && formData[field].trim() === '')
        );
        
        if (missingFields.length > 0) {
          console.error('❌ InternetIdentityRegistrationService: Missing required fields:', missingFields);
          return {
            success: false,
            error: `Form data is missing required fields: ${missingFields.join(', ')}`
          };
        }
        
        // Make a backup copy of the form data
        const formDataCopy = JSON.parse(JSON.stringify(formData));
        
        // Store form data if provided (for institution registration)
        console.log('💾 InternetIdentityRegistrationService: Storing form data in localStorage');
        localStorage.setItem('pendingInstitutionRegistration', JSON.stringify({
          formData: formDataCopy,
          timestamp: Date.now()
        }));
      }
      
      // Store that we're expecting a new registration
      localStorage.setItem('expectingNewII', 'true');
      localStorage.setItem('registrationInProgress', 'true');
      
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
      console.log('🔍 RegistrationService: Checking localStorage for pending data...');
      
      const pendingData = localStorage.getItem('pendingInstitutionRegistration');
      const expectingNew = localStorage.getItem('expectingNewII');
      
      console.log('📋 RegistrationService: Raw pending data:', pendingData);
      console.log('🆔 RegistrationService: Expecting new II:', expectingNew);
      
      if (pendingData) {
        console.log('✅ RegistrationService: Pending data found, parsing...');
        const data = JSON.parse(pendingData);
        console.log('✅ RegistrationService: Parsed data:', data);
        
        // Ensure formData exists and is not empty
        if (!data.formData) {
          console.error('❌ RegistrationService: formData missing in parsed data');
          return null;
        }
        
        const currentTime = Date.now();
        const age = currentTime - data.timestamp;
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        console.log('⏰ RegistrationService: Data age:', Math.round(age / 1000), 'seconds');
        console.log('⏰ RegistrationService: Max age:', Math.round(maxAge / 1000), 'seconds');
        console.log('⏰ RegistrationService: Is valid:', age < maxAge);
        
        // Check if data is not too old (max 30 minutes)
        if (age < maxAge) {
          // If expectingNewII is not set but we have recent valid data, allow it
          // This handles cases where the flag was cleared but the registration should continue
          if (expectingNew === 'true' || age < 5 * 60 * 1000) { // Allow if expecting OR data is less than 5 minutes old
            console.log('✅ RegistrationService: Valid form data found:', JSON.stringify(data.formData));
            
            // Validate form data has required fields
            const requiredFields = [
              'name', 'institutionType', 'address', 'contactEmail', 
              'contactPhone', 'accreditationNumber', 'adminFirstName', 
              'adminLastName', 'adminEmail'
            ];
            
            const missingFields = requiredFields.filter(field => 
              !data.formData[field] || 
              (typeof data.formData[field] === 'string' && data.formData[field].trim() === '')
            );
            
            if (missingFields.length > 0) {
              console.error('❌ RegistrationService: Missing required fields in form data:', missingFields);
              console.error('Form data:', data.formData);
            } else {
              console.log('✅ RegistrationService: All required fields present in form data');
            }
            
            return data.formData;
          } else {
            console.log('❌ RegistrationService: Conditions not met for pending data');
            console.log('  - ExpectingNew:', expectingNew);
            console.log('  - Data age:', Math.round(age / 1000), 'seconds (threshold: 300 seconds)');
          }
        } else {
          console.log('❌ RegistrationService: Data is too old, removing from storage');
          localStorage.removeItem('pendingInstitutionRegistration');
          localStorage.removeItem('expectingNewII');
        }
      } else {
        console.log('❌ RegistrationService: Conditions not met for pending data');
        if (!pendingData) console.log('  - No pending data found');
        if (expectingNew !== 'true') console.log('  - Not expecting new II');
      }
      
      return null;
    } catch (error) {
      console.error('❌ RegistrationService: Error checking for pending registration:', error);
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
