import { internetIdentityService } from '../services/InternetIdentityService';
import { internetIdentityRegistrationService } from '../services/InternetIdentityRegistrationService';

// Helper function to claim invitation code with authenticated actor
async function claimInvitationCode(code) {
  try {
    // Get authenticated actor
    const actor = internetIdentityService.getActor();
    if (!actor) {
      throw new Error('No authenticated actor available');
    }

    // Verify principal before making the call
    const principal = internetIdentityService.getPrincipal();
    console.log('🔍 Making claim invitation code call with principal:', principal);

    const result = await actor.claimInvitationCode(code);
    
    if ('ok' in result) {
      alert('Account successfully claimed! You can now access your student account.');
      return { success: true, result: result.ok };
    } else {
      alert('Error claiming invitation code: ' + JSON.stringify(result.err));
      return { success: false, error: result.err };
    }
  } catch (error) {
    console.error('Error claiming invitation code:', error);
    alert('Error claiming invitation code: ' + error.message);
    return { success: false, error: error.message };
  }
}

export const invitationHandlers = {
  handleInvitationCodeSubmit: async (
    e,
    invitationCodeForm,
    setInvitationCodeForm,
    setLoading,
    setCurrentView
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Initialize Internet Identity service
      await internetIdentityService.init();

      // Check if user is authenticated
      if (!(await internetIdentityService.isAuthenticated())) {
        alert('Please authenticate with Internet Identity first.');
        setLoading(false);
        return;
      }

      // Get authenticated actor
      const actor = internetIdentityService.getActor();
      if (!actor) {
        throw new Error('No authenticated actor available');
      }

      // Verify principal before making the call
      const principal = internetIdentityService.getPrincipal();
      console.log('🔍 Making invitation code info call with principal:', principal);

      // First, check the invitation code info using authenticated actor
      const infoResult = await actor.getInvitationCodeInfo(invitationCodeForm.code);
      if ('err' in infoResult) {
        alert('Invalid invitation code or code not found.');
        setLoading(false);
        return;
      }

      const info = infoResult.ok;
      if (!info.isValid) {
        alert('This invitation code has expired or has already been used.');
        setLoading(false);
        return;
      }

      // Show confirmation
      const confirmClaim = confirm(`You are about to claim an account for:\n\nStudent: ${info.studentName}\nInstitution: ${info.institutionId}\n\nThis will link your Internet Identity to this student account. Continue?`);

      if (!confirmClaim) {
        setLoading(false);
        return;
      }

      // Claim the invitation code using authenticated actor
      console.log('🔍 Making claim invitation code call with principal:', principal);
      const claimResult = await claimInvitationCode(invitationCodeForm.code);
      
      if (claimResult.success) {
        setInvitationCodeForm({ code: '' });
        setCurrentView('login');
      }
    } catch (error) {
      console.error('Error claiming invitation code:', error);
      alert('Error claiming invitation code: ' + error.message);
    } finally {
      setLoading(false);
    }
  },

  handleCheckInvitationCode: async (
    invitationCodeForm,
    setInvitationCodeInfo,
    setLoading
  ) => {
    if (!invitationCodeForm.code) {
      alert('Please enter an invitation code.');
      return;
    }

    setLoading(true);
    try {
      const { Acadena_backend } = await import('declarations/Acadena_backend');

      console.log('🔍 Checking invitation code (anonymous):', invitationCodeForm.code);
      const result = await Acadena_backend.getInvitationCodeInfo(invitationCodeForm.code);

      if ('ok' in result) {
        const info = result.ok;
        setInvitationCodeInfo(info);

        if (info.isValid) {
          console.log('✅ Valid invitation code found:', info);

          // Show confirmation and prompt for Internet Identity authentication
          const confirmClaim = confirm(
            `Valid invitation code found!\n\n` +
            `Student: ${info.studentName}\n` +
            `Institution: ${info.institutionId}\n\n` +
            `Would you like to authenticate with Internet Identity to claim this account?`
          );

          if (confirmClaim) {
            try {
              // Initialize Internet Identity service
              await internetIdentityService.init();

              // Check if already authenticated
              if (await internetIdentityService.isAuthenticated()) {
                console.log('✅ User already authenticated, proceeding to claim...');
                await claimInvitationCode(invitationCodeForm.code);
              } else {
                console.log('🔑 Redirecting to Internet Identity for authentication...');

                // Store the invitation code for after authentication
                localStorage.setItem('pendingInvitationCode', invitationCodeForm.code);

                // Trigger Internet Identity login
                const sessionInfo = await internetIdentityService.login();

                if (sessionInfo) {
                  console.log('✅ Authentication successful, claiming invitation code...');
                  await claimInvitationCode(invitationCodeForm.code);
                  localStorage.removeItem('pendingInvitationCode');
                }
              }
            } catch (authError) {
              console.error('❌ Authentication failed:', authError);
              alert('Authentication failed: ' + authError.message);
            }
          }
        } else {
          alert('This invitation code has expired or has already been used.');
        }
      } else {
        alert('Invalid invitation code or code not found.');
        setInvitationCodeInfo(null);
      }
    } catch (error) {
      console.error('Error checking invitation code:', error);
      alert('Error checking invitation code: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};