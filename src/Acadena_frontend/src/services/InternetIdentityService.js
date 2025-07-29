import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/Acadena_backend';
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
      this.actor = await this.createAuthenticatedActor();
    }

    return this.authClient;
  }

  async createAuthenticatedActor() {
    if (!this.identity) {
      throw new Error('No authenticated identity available');
    }

    const agent = new HttpAgent({
      identity: this.identity,
      ...(this.isLocalNetwork && { host: 'http://localhost:4943' })
    });

    if (this.isLocalNetwork) {
      try {
        await agent.fetchRootKey();
        console.log('✅ Root key fetched successfully for local development');
      } catch (err) {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
        console.error(err);
      }
    }

    // Verify the principal being used
    const principal = this.identity.getPrincipal().toText();
    console.log('🔍 Actor created with principal:', principal)

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
        windowOpenerFeatures: 'toolbar=0,location=0,menubar=0,width=500,height=500,left=' + 
          (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 250),
        onSuccess: async () => {
          this.identity = this.authClient.getIdentity();
          this.actor = await this.createAuthenticatedActor();

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
    console.log('🚪 InternetIdentityService.logout: Starting logout process...');

    if (!this.authClient) {
      console.log('🚪 InternetIdentityService.logout: No authClient, logout skipped');
      return;
    }

    const principal = this.identity?.getPrincipal().toString();
    console.log('🚪 InternetIdentityService.logout: Current principal:', principal);

    if (principal) {
      console.log('🚪 InternetIdentityService.logout: Removing session for principal:', principal);
      this.sessions.delete(principal);
    }

    // Clear local state first
    console.log('🚪 InternetIdentityService.logout: Clearing local state...');
    this.identity = null;
    this.actor = null;

    // Clear all sessions
    console.log('🚪 InternetIdentityService.logout: Clearing all sessions...');
    this.sessions.clear();

    // Then logout from authClient
    console.log('🚪 InternetIdentityService.logout: Calling authClient.logout()...');
    await this.authClient.logout();
    console.log('🚪 InternetIdentityService.logout: authClient.logout() completed');

    // Verify logout
    const stillAuthenticated = await this.authClient.isAuthenticated();
    console.log('🚪 InternetIdentityService.logout: AuthClient still authenticated after logout:', stillAuthenticated);
  }

  async getCurrentUser() {
    if (!this.actor) {
      console.log('InternetIdentityService: No actor available for getCurrentUser');
      return null;
    }

    try {
      console.log('InternetIdentityService: Calling getCurrentUserInfo...');
      const result = await this.actor.getCurrentUserInfo();
      console.log('InternetIdentityService: getCurrentUserInfo result:', result);

      if (result.length > 0) {
        console.log('InternetIdentityService: User found:', result[0]);
        // Convert BigInt fields to regular numbers
        const user = result[0];
        const convertedUser = {
          ...user,
          createdDate: typeof user.createdDate === 'bigint' ? Number(user.createdDate) : user.createdDate,
          lastLoginDate: user.lastLoginDate && typeof user.lastLoginDate === 'bigint' ? Number(user.lastLoginDate) : user.lastLoginDate
        };
        return convertedUser;
      } else {
        console.log('InternetIdentityService: No user data found (new user)');
        return null;
      }
    } catch (error) {
      console.error('InternetIdentityService: Error getting current user:', error);
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

  async isAuthenticated() {
    // Check both authClient state and local identity state
    const authClientAuth = await this.authClient?.isAuthenticated();
    const hasIdentity = !!this.identity;
    const result = !!(authClientAuth && hasIdentity);

    // Add some debugging
    if (authClientAuth !== hasIdentity) {
      console.log('🔍 InternetIdentityService.isAuthenticated: Mismatch detected!');
      console.log('  - AuthClient authenticated:', authClientAuth);
      console.log('  - Has identity:', hasIdentity);
      console.log('  - Final result:', result);
    }

    return result;
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

  /**
   * Updates the current session with fresh user information
   * This method is used after registration or profile updates to ensure
   * all user data is current without requiring a full re-login
   */
  async updateSessionWithUserInfo() {
    try {
      console.log('🔄 InternetIdentityService: Updating session with fresh user info...');

      if (!(await this.isAuthenticated())) {
        console.log('⚠️ InternetIdentityService: Cannot update session - not authenticated');
        return null;
      }

      // Get fresh user data from backend
      const userInfo = await this.getCurrentUser();

      // Update the current session with the new user info
      if (this.identity) {
        const principal = this.identity.getPrincipal().toString();
        let currentSession = this.sessions.get(principal);

        if (currentSession) {
          // Update the session with new user info
          currentSession.userInfo = userInfo;
          this.sessions.set(principal, currentSession);

          console.log('✅ InternetIdentityService: Session updated with new user info:', userInfo);
        } else {
          console.log('⚠️ InternetIdentityService: No session found for current principal - creating new session');

          // Create a new session if none exists for this principal
          const anchor = await this.getIdentityAnchor();
          currentSession = {
            principal,
            userInfo: userInfo,
            identity: this.identity,
            actor: this.actor,
            loginTime: new Date(),
            anchor: anchor
          };

          this.sessions.set(principal, currentSession);
          console.log('✅ InternetIdentityService: Created new session for principal:', principal);
        }
      }

      return userInfo;
    } catch (error) {
      console.error('❌ InternetIdentityService: Error updating session with user info:', error);
      return null;
    }
  }

  // Integration with Internet Identity Registration
  async createNewInternetIdentity() {
    return await internetIdentityRegistrationService.createNewInternetIdentity();
  }

  async loginWithNewIdentity(identity, anchor) {
    // Store the new identity and create actor
    this.identity = identity;
    this.actor = await this.createAuthenticatedActor();

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
      console.log('🔍 InternetIdentityService: Checking for pending registration...');

      // Check if user is authenticated and has pending registration
      if (await this.isAuthenticated()) {
        console.log('✅ InternetIdentityService: User is authenticated');
        const pendingFormData = internetIdentityRegistrationService.checkForPendingRegistration();
        console.log('📋 InternetIdentityService: Pending form data retrieved:', pendingFormData ? 'yes' : 'no');

        if (pendingFormData) {
          // Log full form data for debugging
          console.log('🎯 InternetIdentityService: Full form data details:');
          Object.keys(pendingFormData).forEach(key => {
            console.log(`  - ${key}: ${pendingFormData[key]}`);
          });

          // Get additional identity information
          const principal = this.getPrincipal();
          const anchor = await this.getIdentityAnchor();

          console.log('🔑 InternetIdentityService: Principal:', principal);
          console.log('⚓ InternetIdentityService: Anchor:', anchor);

          // Ensure a session exists for this authentication
          if (!this.sessions.has(principal)) {
            console.log('🔄 InternetIdentityService: Creating missing session for authenticated user');
            const sessionInfo = {
              principal,
              userInfo: null, // Will be populated after institution registration
              identity: this.identity,
              actor: this.actor,
              loginTime: new Date(),
              anchor: anchor
            };
            this.sessions.set(principal, sessionInfo);
          }

          // DON'T clear the pending data yet - wait until successful submission
          // internetIdentityRegistrationService.clearPendingRegistration();

          return {
            success: true,
            formData: pendingFormData,
            identity: this.identity,
            principal: principal,
            anchor: anchor
          };
        } else {
          console.log('❌ InternetIdentityService: No pending form data found');
        }
      } else {
        console.log('❌ InternetIdentityService: User is not authenticated');
      }

      return null;
    } catch (error) {
      console.error('❌ InternetIdentityService: Error checking for pending institution registration:', error);
      return null;
    }
  }
}

// Export singleton instance
export const internetIdentityService = new InternetIdentityService();
