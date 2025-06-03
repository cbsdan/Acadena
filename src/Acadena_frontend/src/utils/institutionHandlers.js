import { Acadena_backend } from 'declarations/Acadena_backend';
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
      // Validate form data first
      const requiredFields = [
        'name', 'institutionType', 'address', 'contactEmail',
        'contactPhone', 'accreditationNumber', 'adminFirstName',
        'adminLastName', 'adminEmail'
      ];

      const missingFields = requiredFields.filter(field =>
        !institutionWithAdminForm[field] ||
        institutionWithAdminForm[field].trim() === ''
      );

      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
        alert('Failed to create Internet Identity: ' + result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in institution registration flow:', error);
      alert('Error during registration: ' + error.message);
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
      alert('Error completing registration: ' + error.message);
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
      formData.adminFirstName,
      formData.adminLastName,
      formData.adminEmail
    );

    if ('ok' in result) {
      console.log('✅ Institution registration successful:', result.ok);

      internetIdentityRegistrationService.clearPendingRegistration();

      alert(
        `Institution and admin account created successfully!\n\n` +
        `Institution: ${formData.name}\n` +
        `Admin: ${formData.adminFirstName} ${formData.adminLastName}\n\n` +
        `You can now manage students and documents for your institution.`
      );

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
        adminFirstName: '',
        adminLastName: '',
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
      alert('Error creating institution: ' + JSON.stringify(result.err));
    }
  } catch (error) {
    console.error('❌ Error submitting institution registration:', error);
    alert('Error creating institution: ' + error.message);
  } finally {
    setLoading(false);
  }
}