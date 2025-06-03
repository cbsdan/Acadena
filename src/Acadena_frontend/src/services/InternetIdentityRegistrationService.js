import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../declarations/Acadena_backend';
import { internetIdentityService } from './InternetIdentityService.js';

class InternetIdentityRegistrationService {
    constructor() {
        this.isLocalNetwork = process.env.DFX_NETWORK !== 'ic';
    }

    /**
     * Store form data and redirect to Internet Identity for registration
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

                // Store form data for later use
                console.log('💾 InternetIdentityRegistrationService: Storing form data in localStorage');
                localStorage.setItem('pendingInstitutionRegistration', JSON.stringify({
                    formData: formData,
                    timestamp: Date.now()
                }));
            }

            // Store that we're expecting a new registration
            localStorage.setItem('expectingNewII', 'true');
            localStorage.setItem('registrationInProgress', 'true');

            // Create AuthClient and initiate login flow (which will redirect to II)
            const authClient = await AuthClient.create();

            return new Promise((resolve, reject) => {
                authClient.login({
                    identityProvider: this.isLocalNetwork
                        ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}.localhost:4943`
                        : 'https://identity.ic0.app',
                    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
                    onSuccess: async () => {
                        const identity = authClient.getIdentity();
                        const principal = identity.getPrincipal().toText();

                        console.log('✅ Real II Principal:', principal);

                        // CRITICAL: Update the InternetIdentityService with this authenticated identity
                        await internetIdentityService.loginWithNewIdentity(identity, null);

                        // Store the principal for verification
                        localStorage.setItem('authenticatedPrincipal', principal);

                        resolve({
                            success: true,
                            identity: identity,
                            principal: principal
                        });
                    },
                    onError: (error) => {
                        console.error('❌ InternetIdentityRegistrationService: II registration/login failed:', error);
                        localStorage.setItem('expectingNewII', 'false');
                        localStorage.setItem('registrationInProgress', 'false');
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('❌ InternetIdentityRegistrationService: Error in createNewInternetIdentity:', error);
            localStorage.setItem('expectingNewII', 'false');
            localStorage.setItem('registrationInProgress', 'false');
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if there's pending institution registration data
     */
    checkForPendingRegistration() {
        try {
            const pendingData = localStorage.getItem('pendingInstitutionRegistration');
            if (pendingData) {
                const parsed = JSON.parse(pendingData);

                // Check if data is not too old (e.g., 1 hour)
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - parsed.timestamp < oneHour) {
                    return parsed.formData;
                } else {
                    // Clean up old data
                    localStorage.removeItem('pendingInstitutionRegistration');
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
        localStorage.removeItem('pendingInstitutionRegistration');
        localStorage.removeItem('expectingNewII');
        localStorage.removeItem('registrationInProgress');
    }

    /**
     * Get stored registration info
     */
    getStoredRegistrationInfo() {
        try {
            const data = localStorage.getItem('pendingInstitutionRegistration');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting stored registration info:', error);
            return null;
        }
    }

    /**
     * Check if registration flow is supported
     */
    isSupported() {
        return typeof window !== 'undefined' && window.localStorage;
    }

    /**
     * Check if we're currently in a registration flow
     */
    isRegistrationInProgress() {
        return localStorage.getItem('registrationInProgress') === 'true';
    }
}

// Export singleton instance
export const internetIdentityRegistrationService = new InternetIdentityRegistrationService();