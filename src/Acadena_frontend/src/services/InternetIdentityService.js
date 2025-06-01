import { AuthClient } from '@dfinity/auth-client';
import { createActor, Acadena_backend } from 'declarations/Acadena_backend';
import { HttpAgent } from '@dfinity/agent';
import { internetIdentityRegistrationService } from './InternetIdentityRegistrationService';

class InternetIdentityService {
  constructor() {
    this.authClient = null;
    this.actor = null;
    this.isLocalNetwork = process.env.DFX_NETWORK !== 'ic';
    this.identity = null;
    this.sessions = new Map(); // Store multiple user sessions
  }

  async init() {
    this.authClient = await AuthClient.create({
      idleOptions: {
        idleTimeout: 1000 * 60 * 30, // 30 minutes
        disableDefaultIdleCallback: false
      }
    });

    if (await this.authClient.isAuthenticated()) {
      this.identity = this.authClient.getIdentity();
      this.actor = this.createAuthenticatedActor();
    }

    return this.authClient;
  }

  createAuthenticatedActor() {
    const agent = new HttpAgent({
      identity: this.identity,
      ...(this.isLocalNetwork && { host: 'http://localhost:4943' })
    });

    if (this.isLocalNetwork) {
      agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      });
    }

    return createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
      agent,
    });
  }

  async login() {
    if (!this.authClient) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.authClient.login({
        identityProvider: this.isLocalNetwork 
          ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'uzt4z-lp777-77774-qaabq-cai'}.localhost:4943`
          : 'https://identity.ic0.app',
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
        onSuccess: async () => {
          this.identity = this.authClient.getIdentity();
          this.actor = this.createAuthenticatedActor();
          
          // Get user info from backend
          try {
            const userInfo = await this.getCurrentUser();
            const principal = this.identity.getPrincipal().toString();
            
            // Store this session
            const sessionInfo = {
              principal,
              userInfo,
              identity: this.identity,
              actor: this.actor,
              loginTime: new Date(),
              anchor: await this.getIdentityAnchor()
            };

            this.sessions.set(principal, sessionInfo);
            
            resolve(sessionInfo);
          } catch (error) {
            console.error('Error getting user info:', error);
            resolve({
              principal: this.identity.getPrincipal().toString(),
              identity: this.identity,
              actor: this.actor,
              loginTime: new Date(),
              anchor: await this.getIdentityAnchor()
            });
          }
        },
        onError: (error) => {
          console.error('Login failed:', error);
          reject(error);
        }
      });
    });
  }

  async logout() {
    if (!this.authClient) return;

    const principal = this.identity?.getPrincipal().toString();
    if (principal) {
      this.sessions.delete(principal);
    }

    await this.authClient.logout();
    this.identity = null;
    this.actor = null;
  }

  async getCurrentUser() {
    if (!this.actor) return null;
    
    try {
      const result = await this.actor.getCurrentUserInfo();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getIdentityAnchor() {
    // Try to get the actual anchor from the Internet Identity service first
    if (this.identity) {
      try {
        const principal = this.identity.getPrincipal().toString();
        // Check if we have registration info from our registration service
        const registrationInfo = internetIdentityRegistrationService.getStoredRegistrationInfo();
        if (registrationInfo && registrationInfo.anchor) {
          return registrationInfo.anchor;
        }
        
        // Otherwise, try to extract from Internet Identity delegations
        const delegations = this.identity.getDelegation();
        if (delegations && delegations.delegations && delegations.delegations.length > 0) {
          // The anchor might be encoded in the delegation
          const firstDelegation = delegations.delegations[0];
          if (firstDelegation.delegation && firstDelegation.delegation.pubkey) {
            // This is a simplified approach - in reality, anchor extraction is more complex
            const pubkeyBytes = new Uint8Array(firstDelegation.delegation.pubkey);
            let anchor = 0;
            for (let i = 0; i < Math.min(4, pubkeyBytes.length); i++) {
              anchor = (anchor << 8) | pubkeyBytes[i];
            }
            return Math.abs(anchor % 90000) + 10000;
          }
        }
      } catch (error) {
        console.warn('Could not extract anchor from identity:', error);
      }
    }
    
    // Fallback: generate a consistent anchor from the principal
    if (!this.identity) return null;
    
    const principal = this.identity.getPrincipal().toString();
    // Create a consistent anchor number from the principal
    const hash = principal.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return Math.abs(hash % 90000) + 10000; // Generate anchor between 10000-99999
  }

  isAuthenticated() {
    return this.authClient?.isAuthenticated() || false;
  }

  getIdentity() {
    return this.identity;
  }

  getActor() {
    return this.actor;
  }

  getPrincipal() {
    return this.identity?.getPrincipal().toString();
  }

  // Multi-user session management
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  getSession(principal) {
    return this.sessions.get(principal);
  }

  async switchToSession(principal) {
    const session = this.sessions.get(principal);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update current active session
    this.identity = session.identity;
    this.actor = session.actor;
    
    return session;
  }

  removeSession(principal) {
    this.sessions.delete(principal);
    
    // If we're removing the current session, clear it
    if (this.identity?.getPrincipal().toString() === principal) {
      this.identity = null;
      this.actor = null;
    }
  }

  hasMultipleSessions() {
    return this.sessions.size > 1;
  }

  getCurrentSession() {
    if (!this.identity) return null;
    
    const principal = this.identity.getPrincipal().toString();
    return this.sessions.get(principal);
  }

  // Integration with Internet Identity Registration
  async createNewInternetIdentity() {
    return await internetIdentityRegistrationService.createNewInternetIdentity();
  }

  async loginWithNewIdentity(identity, anchor) {
    // Store the new identity and create actor
    this.identity = identity;
    this.actor = this.createAuthenticatedActor();
    
    // Store session info
    const principal = identity.getPrincipal().toString();
    const sessionInfo = {
      principal,
      userInfo: null, // Will be populated after institution registration
      identity: identity,
      actor: this.actor,
      loginTime: new Date(),
      anchor: anchor
    };

    this.sessions.set(principal, sessionInfo);
    return sessionInfo;
  }

  // Helper method to check if registration flow is available
  isRegistrationFlowAvailable() {
    return internetIdentityRegistrationService.isSupported();
  }

  /**
   * Check if user just returned from Internet Identity registration
   * and handle pending institution registration
   */
  async checkForPendingInstitutionRegistration() {
    try {
      // Check if user is authenticated and has pending registration
      if (this.isAuthenticated()) {
        const pendingFormData = internetIdentityRegistrationService.checkForPendingRegistration();
        
        if (pendingFormData) {
          // Clear the pending data
          internetIdentityRegistrationService.clearPendingRegistration();
          
          return {
            success: true,
            formData: pendingFormData,
            identity: this.identity,
            principal: this.getPrincipal(),
            anchor: await this.getIdentityAnchor()
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for pending institution registration:', error);
      return null;
    }
  }
}

// Export singleton instance
export const internetIdentityService = new InternetIdentityService();
