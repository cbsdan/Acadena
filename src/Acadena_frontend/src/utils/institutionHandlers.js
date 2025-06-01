import { Acadena_backend } from 'declarations/Acadena_backend';

export const institutionHandlers = {
  // Check if accreditation number already exists
  checkAccreditationNumberExists: async (accreditationNumber) => {
    try {
      const institutions = await Acadena_backend.getAllInstitutions();
      return institutions.some(institution => 
        institution.accreditationNumber === accreditationNumber
      );
    } catch (error) {
      console.error('Error checking accreditation number:', error);
      // In case of error, allow the submission to proceed to backend validation
      return false;
    }
  },
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
      // Check for duplicate accreditation number before submission
      const isDuplicate = await institutionHandlers.checkAccreditationNumberExists(
        institutionWithAdminForm.accreditationNumber
      );
      
      if (isDuplicate) {
        alert('Institution registration failed: An institution with this accreditation number already exists. Please use a different accreditation number.');
        setLoading(false);
        return;
      }
      
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
        // Provide more user-friendly error messages
        let errorMessage = 'Error creating institution: ';
        if (result.err && typeof result.err === 'object') {
          if ('AlreadyExists' in result.err) {
            errorMessage = 'Institution registration failed: An institution with this accreditation number already exists. Please use a different accreditation number.';
          } else if ('InvalidInput' in result.err) {
            errorMessage = 'Institution registration failed: Please check that all required fields are filled correctly.';
          } else if ('Unauthorized' in result.err) {
            errorMessage = 'Institution registration failed: Authentication error. Please try logging in again.';
          } else {
            errorMessage += JSON.stringify(result.err);
          }
        } else {
          errorMessage += JSON.stringify(result.err);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating institution:', error);
      alert('Error creating institution: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};
