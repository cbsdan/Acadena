import { Acadena_backend } from 'declarations/Acadena_backend';

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
      const institutionType = { [institutionWithAdminForm.institutionType]: null };
      
      const result = await Acadena_backend.registerInstitutionWithAdmin(
        institutionWithAdminForm.name,
        institutionType,
        institutionWithAdminForm.address,
        institutionWithAdminForm.contactEmail,
        institutionWithAdminForm.contactPhone,
        institutionWithAdminForm.accreditationNumber,
        institutionWithAdminForm.website ? [institutionWithAdminForm.website] : [],
        institutionWithAdminForm.description ? [institutionWithAdminForm.description] : [],
        institutionWithAdminForm.adminFirstName,
        institutionWithAdminForm.adminLastName,
        institutionWithAdminForm.adminEmail
      );

      if ('ok' in result) {
        alert('Institution and admin account created successfully!\n\nThe admin can now log in using Internet Identity to manage students and documents for ' + institutionWithAdminForm.name + '.');
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
        await loadInstitutions();
        await loadSystemStatus();
        setCurrentView('login');
      } else {
        alert('Error creating institution: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error creating institution:', error);
      alert('Error creating institution: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};
