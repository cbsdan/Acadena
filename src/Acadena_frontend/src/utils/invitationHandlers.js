import { internetIdentityService } from '../services/InternetIdentityService';
import { internetIdentityRegistrationService } from '../services/InternetIdentityRegistrationService';
import Swal from 'sweetalert2';

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
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Account successfully claimed! You can now access your student account.',
        confirmButtonColor: '#10b981'
      });
      // Redirect to app after successful claim
      window.location.href = '/app';
      return { success: true, result: result.ok };
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error claiming invitation code: ' + JSON.stringify(result.err),
        confirmButtonColor: '#ef4444'
      });
      return { success: false, error: result.err };
    }
  } catch (error) {
    console.error('Error claiming invitation code:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error claiming invitation code: ' + error.message,
      confirmButtonColor: '#ef4444'
    });
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
        await Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Please authenticate with Internet Identity first.',
          confirmButtonColor: '#f59e0b'
        });
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
        await Swal.fire({
          icon: 'error',
          title: 'Invalid Code',
          text: 'Invalid invitation code or code not found.',
          confirmButtonColor: '#ef4444'
        });
        setLoading(false);
        return;
      }

      const info = infoResult.ok;
      if (!info.isValid) {
        await Swal.fire({
          icon: 'warning',
          title: 'Code Expired',
          text: 'This invitation code has expired or has already been used.',
          confirmButtonColor: '#f59e0b'
        });
        setLoading(false);
        return;
      }

      // Show confirmation
      const confirmResult = await Swal.fire({
        icon: 'question',
        title: 'Claim Account',
        html: `You are about to claim an account for:<br><br><strong>Student:</strong> ${info.studentName}<br><strong>Institution:</strong> ${info.institutionId}<br><br>This will link your Internet Identity to this student account.`,
        showCancelButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
      });

      if (!confirmResult.isConfirmed) {
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
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error claiming invitation code: ' + error.message,
        confirmButtonColor: '#ef4444'
      });
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
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Code',
        text: 'Please enter an invitation code.',
        confirmButtonColor: '#f59e0b'
      });
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
          const confirmResult = await Swal.fire({
            icon: 'success',
            title: 'Valid Invitation Code!',
            html: `<strong>Student:</strong> ${info.studentName}<br><strong>Institution:</strong> ${info.institutionId}<br><br>Would you like to authenticate with Internet Identity to claim this account?`,
            showCancelButton: true,
            confirmButtonText: 'Authenticate & Claim',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280'
          });

          if (confirmResult.isConfirmed) {
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
              await Swal.fire({
                icon: 'error',
                title: 'Authentication Failed',
                text: 'Authentication failed: ' + authError.message,
                confirmButtonColor: '#ef4444'
              });
            }
          }
        } else {
          await Swal.fire({
            icon: 'warning',
            title: 'Code Expired',
            text: 'This invitation code has expired or has already been used.',
            confirmButtonColor: '#f59e0b'
          });
        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Invalid Code',
          text: 'Invalid invitation code or code not found.',
          confirmButtonColor: '#ef4444'
        });
        setInvitationCodeInfo(null);
      }
    } catch (error) {
      console.error('Error checking invitation code:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error checking invitation code: ' + error.message,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  }
};