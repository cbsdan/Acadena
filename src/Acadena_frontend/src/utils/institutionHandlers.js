import { internetIdentityService } from '../services/InternetIdentityService';
import { internetIdentityRegistrationService } from '../services/InternetIdentityRegistrationService';

export const institutionHandlers = {
  handleInstitutionWithAdminSubmit: async (
    e,
    institutionWithAdminForm,
    setInstitutionWithAdminForm,
    setLoading,
    loadInstitutions,
    loadSystemStatus,
    setCurrentView
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Old code
      // const requiredFields = [
      //   'name', 'institutionType', 'address', 'contactEmail',
      //   'contactPhone', 'accreditationNumber', 'adminFirstName',
      //   'adminLastName', 'adminEmail'
      // ];
      const requiredFields = [
        'name', 'institutionType', 'address', 'contactEmail',
        'contactPhone', 'accreditationNumber', 'adminEmail'
      ];

      const missingFields = requiredFields.filter(field =>
        !institutionWithAdminForm[field] ||
        institutionWithAdminForm[field].trim() === ''
      );

      if (missingFields.length > 0) {
        showErrorToast(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('🚀 Starting Internet Identity registration flow...');

      // Check if user is already authenticated
      if (await internetIdentityService.isAuthenticated()) {
        console.log('✅ User already authenticated, proceeding with institution registration...');

        // Get the current principal to verify
        const currentPrincipal = internetIdentityService.getPrincipal();
        console.log('🔍 Current authenticated principal:', currentPrincipal);

        await submitInstitutionRegistration(
          institutionWithAdminForm,
          setInstitutionWithAdminForm,
          loadInstitutions,
          loadSystemStatus,
          setCurrentView,
          setLoading
        );
        return;
      }

      // Create Internet Identity and store form data
      console.log('🔑 Creating new Internet Identity for admin...');
      const result = await internetIdentityRegistrationService.createNewInternetIdentity(
        'Institution Admin',
        institutionWithAdminForm
      );

      if (result.success) {
        console.log('✅ Internet Identity created successfully');

        // Update the InternetIdentityService with the new identity
        await internetIdentityService.loginWithNewIdentity(result.identity, null);

        // Now submit the institution registration
        await submitInstitutionRegistration(
          institutionWithAdminForm,
          setInstitutionWithAdminForm,
          loadInstitutions,
          loadSystemStatus,
          setCurrentView,
          setLoading
        );
      } else {
        console.error('❌ Failed to create Internet Identity:', result.error);
        showErrorToast('Failed to create Internet Identity: ' + result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in institution registration flow:', error);
      showErrorToast('Error during registration: ' + error.message);
      setLoading(false);
    }
  },

  // Handle returning from Internet Identity registration
  handleReturnFromII: async (
    setInstitutionWithAdminForm,
    setLoading,
    loadInstitutions,
    loadSystemStatus,
    setCurrentView
  ) => {
    try {
      console.log('🔄 Handling return from Internet Identity...');

      const pendingResult = await internetIdentityService.checkForPendingInstitutionRegistration();

      if (pendingResult && pendingResult.success) {
        console.log('✅ Found pending institution registration, proceeding...');

        await submitInstitutionRegistration(
          pendingResult.formData,
          setInstitutionWithAdminForm,
          loadInstitutions,
          loadSystemStatus,
          setCurrentView,
          setLoading
        );

        // Clear the pending data
        internetIdentityRegistrationService.clearPendingRegistration();
      }
    } catch (error) {
      console.error('❌ Error handling return from II:', error);
      showErrorToast('Error completing registration: ' + error.message);
    }
  }
};

// Helper function to submit institution registration
async function submitInstitutionRegistration(
  formData,
  setInstitutionWithAdminForm,
  loadInstitutions,
  loadSystemStatus,
  setCurrentView,
  setLoading
) {
  try {
    console.log('📝 Submitting institution registration to backend...');

    // CRITICAL: Use the authenticated actor from InternetIdentityService
    const actor = internetIdentityService.getActor();
    if (!actor) {
      throw new Error('No authenticated actor available');
    }

    // Verify principal before making the call
    const principal = internetIdentityService.getPrincipal();
    console.log('🔍 Making backend call with principal:', principal);

    const institutionType = { [formData.institutionType]: null };

    const result = await actor.registerInstitutionWithAdmin(
      formData.name,
      institutionType,
      formData.address,
      formData.contactEmail,
      formData.contactPhone,
      formData.accreditationNumber,
      formData.website ? [formData.website] : [],
      formData.description ? [formData.description] : [],
      // formData.adminFirstName,
      // formData.adminLastName,
      formData.adminEmail
    );

    if ('ok' in result) {
      console.log('✅ Institution registration successful:', result.ok);

      internetIdentityRegistrationService.clearPendingRegistration();

      // Show success toast
      showSuccessToast(`Institution "${formData.name}" registered successfully! Redirecting to dashboard...`);

      // Reload and redirect to dashboard
      window.location.href = '/app';
      window.location.reload();

      // Clear form
      setInstitutionWithAdminForm({
        name: '',
        institutionType: 'University',
        address: '',
        contactEmail: '',
        contactPhone: '',
        accreditationNumber: '',
        website: '',
        description: '',
        // adminFirstName: '',
        // adminLastName: '',
        adminEmail: ''
      });

      // Update session with new user info
      await internetIdentityService.updateSessionWithUserInfo();

      // Reload data
      await loadInstitutions();
      await loadSystemStatus();

      // Navigate to dashboard
      setCurrentView('dashboard');
    } else {
      console.error('❌ Institution registration failed:', result.err);
      showErrorToast('Error creating institution: ' + JSON.stringify(result.err));
    }
  } catch (error) {
    console.error('❌ Error submitting institution registration:', error);
    showErrorToast('Error creating institution: ' + error.message);
  } finally {
    setLoading(false);
  }
}

// Simple toast notification function
function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: #10b981; color: white; padding: 16px 24px;
    border-radius: 8px; font-family: system-ui; font-size: 14px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = '@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }';
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: #ef4444; color: white; padding: 16px 24px;
    border-radius: 8px; font-family: system-ui; font-size: 14px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = '@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }';
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}