import { Acadena_backend } from 'declarations/Acadena_backend';

export const institutionHandlers = {
  // Function to submit institution registration after Internet Identity creation
  submitInstitutionRegistration: async (
    formData, 
    loadInstitutions, 
    loadSystemStatus
  ) => {
    console.log('🔄 institutionHandlers.submitInstitutionRegistration called with data:', formData);
    
    try {
      // Validate all required fields are present and non-empty
      const requiredFields = [
        'name', 'institutionType', 'address', 'contactEmail', 
        'contactPhone', 'accreditationNumber', 'adminFirstName', 
        'adminLastName', 'adminEmail'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !formData[field] || 
        typeof formData[field] === 'string' && formData[field].trim() === ''
      );
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields in form data:', missingFields);
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        };
      }
      
      // Check for duplicate accreditation number before submission
      const isDuplicate = await institutionHandlers.checkAccreditationNumberExists(
        formData.accreditationNumber
      );
      
      if (isDuplicate) {
        console.error('❌ Duplicate accreditation number found');
        return {
          success: false,
          error: 'An institution with this accreditation number already exists. Please use a different accreditation number.'
        };
      }
      
      // Create proper variant format for institutionType
      const institutionType = { [formData.institutionType]: null };
      
      console.log('🏛️ Submitting institution with type:', institutionType);
      console.log('📋 Form data being submitted:', {
        name: formData.name,
        type: institutionType,
        address: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        accreditationNumber: formData.accreditationNumber,
        website: formData.website && formData.website.trim() !== '' ? [formData.website] : [],
        description: formData.description && formData.description.trim() !== '' ? [formData.description] : [],
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail
      });
      
      const result = await Acadena_backend.registerInstitutionWithAdmin(
        formData.name,
        institutionType,
        formData.address,
        formData.contactEmail,
        formData.contactPhone,
        formData.accreditationNumber,
        formData.website && formData.website.trim() !== '' ? [formData.website] : [],
        formData.description && formData.description.trim() !== '' ? [formData.description] : [],
        formData.adminFirstName,
        formData.adminLastName,
        formData.adminEmail
      );

      console.log('📥 Backend response:', result);

      if ('ok' in result) {
        console.log('✅ Institution and admin created successfully!', result.ok);
        
        // Extract the institution and admin user from the result
        const institution = result.ok[0];
        const adminUser = result.ok[1];
        
        // Reload data
        if (loadInstitutions) await loadInstitutions();
        if (loadSystemStatus) await loadSystemStatus();
        
        return {
          success: true,
          institution: institution,
          admin: adminUser
        };
      } else {
        // Parse error
        let errorMessage = 'Error creating institution';
        if (result.err && typeof result.err === 'object') {
          if ('AlreadyExists' in result.err) {
            errorMessage = 'An institution with this accreditation number already exists. Please use a different accreditation number.';
          } else if ('InvalidInput' in result.err) {
            errorMessage = 'Please check that all required fields are filled correctly.';
          } else if ('Unauthorized' in result.err) {
            errorMessage = 'Authentication error. Please try logging in again.';
          } else {
            errorMessage += ': ' + JSON.stringify(result.err);
          }
        } else {
          errorMessage += ': ' + JSON.stringify(result.err);
        }
        
        console.error('❌ Error creating institution:', errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('❌ Exception creating institution:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  },
  
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
    navigate
  ) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate all required fields are present and non-empty
      const requiredFields = [
        'name', 'institutionType', 'address', 'contactEmail', 
        'contactPhone', 'accreditationNumber', 'adminFirstName', 
        'adminLastName', 'adminEmail'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !institutionWithAdminForm[field] || 
        typeof institutionWithAdminForm[field] === 'string' && institutionWithAdminForm[field].trim() === ''
      );
      
      if (missingFields.length > 0) {
        alert(`Institution registration failed: Missing required fields - ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      // Check for duplicate accreditation number before submission
      const isDuplicate = await institutionHandlers.checkAccreditationNumberExists(
        institutionWithAdminForm.accreditationNumber
      );
      
      if (isDuplicate) {
        alert('Institution registration failed: An institution with this accreditation number already exists. Please use a different accreditation number.');
        setLoading(false);
        return;
      }
      
      // Create proper variant format for institutionType
      const institutionType = { [institutionWithAdminForm.institutionType]: null };
      
      console.log('Submitting institution with type:', institutionType);
      console.log('Form data being submitted:', {
        name: institutionWithAdminForm.name,
        type: institutionType,
        address: institutionWithAdminForm.address,
        contactEmail: institutionWithAdminForm.contactEmail,
        contactPhone: institutionWithAdminForm.contactPhone,
        accreditationNumber: institutionWithAdminForm.accreditationNumber,
        website: institutionWithAdminForm.website && institutionWithAdminForm.website.trim() !== '' ? [institutionWithAdminForm.website] : [],
        description: institutionWithAdminForm.description && institutionWithAdminForm.description.trim() !== '' ? [institutionWithAdminForm.description] : [],
        adminFirstName: institutionWithAdminForm.adminFirstName,
        adminLastName: institutionWithAdminForm.adminLastName,
        adminEmail: institutionWithAdminForm.adminEmail
      });
      
      const result = await Acadena_backend.registerInstitutionWithAdmin(
        institutionWithAdminForm.name,
        institutionType,
        institutionWithAdminForm.address,
        institutionWithAdminForm.contactEmail,
        institutionWithAdminForm.contactPhone,
        institutionWithAdminForm.accreditationNumber,
        institutionWithAdminForm.website && institutionWithAdminForm.website.trim() !== '' ? [institutionWithAdminForm.website] : [],
        institutionWithAdminForm.description && institutionWithAdminForm.description.trim() !== '' ? [institutionWithAdminForm.description] : [],
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
        navigate('/login');
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
