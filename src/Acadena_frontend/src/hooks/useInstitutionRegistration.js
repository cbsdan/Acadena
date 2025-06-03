import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData } from '../hooks';
import { institutionHandlers } from '../utils';
import { internetIdentityService } from '../services/InternetIdentityService';

function useInstitutionRegistration() {
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated, setIsAuthenticated, loading, setLoading } = useAuth();
  const { loadInstitutions, loadSystemStatus } = useData(user, isAuthenticated);

  const [institutionWithAdminForm, setInstitutionWithAdminForm] = useState({
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

  // Check for pending registration on mount
  useEffect(() => {
    const checkPendingRegistration = async () => {
      try {
        const expectingNew = localStorage.getItem('expectingNewII');
        if (expectingNew === 'true' && isAuthenticated) {
          localStorage.removeItem('expectingNewII');
          
          const pendingResult = await internetIdentityService.checkForPendingInstitutionRegistration();
          if (pendingResult && pendingResult.success && pendingResult.formData) {
            console.log('Found pending institution registration:', pendingResult);
            
            const formDataCopy = JSON.parse(JSON.stringify(pendingResult.formData));
            setInstitutionWithAdminForm(formDataCopy);
            
            const message = `Internet Identity created successfully!\n\nIdentity Anchor: ${pendingResult.anchor}\nPrincipal: ${pendingResult.principal}\n\nContinuing with institution registration...`;
            alert(message);
            
            // Auto-submit after delay
            setTimeout(() => {
              submitInstitutionRegistration(pendingResult.formData);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking for pending institution registration:', error);
        localStorage.removeItem('expectingNewII');
        localStorage.removeItem('pendingInstitutionRegistration');
      }
    };

    if (isAuthenticated) {
      checkPendingRegistration();
    }
  }, [isAuthenticated]);

  const submitInstitutionRegistration = async (formData = institutionWithAdminForm) => {
    setLoading(true);
    
    try {
      const result = await institutionHandlers.submitInstitutionRegistration(
        formData,
        loadInstitutions,
        loadSystemStatus
      );
      
      if (result.success) {
        alert('Institution and admin account created successfully!\n\nThe admin can now log in using Internet Identity to manage students and documents for ' + formData.name + '.');
        
        // Clear form and localStorage
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
        
        localStorage.removeItem('pendingInstitutionRegistration');
        localStorage.removeItem('expectingNewII');
        localStorage.removeItem('registrationInProgress');
        
        // Set user data and navigate
        setUser(result.admin);
        setIsAuthenticated(true);
        
        // Update session
        const principal = internetIdentityService.getPrincipal();
        if (principal) {
          const currentSession = internetIdentityService.getSession(principal);
          if (currentSession) {
            currentSession.userInfo = result.admin;
          }
        }
        
        navigate('/dashboard');
      } else {
        alert('Institution registration failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating institution:', error);
      alert('Error creating institution: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionWithAdminSubmit = (e) => {
    return institutionHandlers.handleInstitutionWithAdminSubmit(
      e,
      institutionWithAdminForm,
      setInstitutionWithAdminForm,
      setLoading,
      loadInstitutions,
      loadSystemStatus,
      () => navigate('/dashboard')
    );
  };

  const handleRegisterFromSetup = () => {
    console.log('Starting institution registration from setup screen');
    
    const pendingData = localStorage.getItem('pendingInstitutionRegistration');
    if (pendingData) {
      try {
        const parsed = JSON.parse(pendingData);
        const isExpired = (Date.now() - parsed.timestamp) > (30 * 60 * 1000);
        
        if (!isExpired && parsed.formData) {
          setInstitutionWithAdminForm(parsed.formData);
          navigate('/register-institution');
          setTimeout(() => {
            alert('Your previous form data has been restored. Please review and submit to complete registration.');
          }, 500);
          return;
        } else if (isExpired) {
          localStorage.removeItem('pendingInstitutionRegistration');
        }
      } catch (error) {
        console.error('Error parsing pending registration data:', error);
        localStorage.removeItem('pendingInstitutionRegistration');
      }
    }
    
    navigate('/register-institution');
  };

  return {
    institutionWithAdminForm,
    setInstitutionWithAdminForm,
    handleInstitutionWithAdminSubmit,
    handleRegisterFromSetup,
    loading
  };
}

export default useInstitutionRegistration;
