import { useState, useEffect } from 'react';
import './App.css';

// Import hooks and utilities
import { useAuth, useData } from './hooks';
import {
  institutionHandlers,
  studentHandlers,
  documentHandlers,
  invitationHandlers
} from './utils';

// Import services
import { internetIdentityService } from './services/InternetIdentityService';
import { Acadena_backend } from 'declarations/Acadena_backend';

// Import components
import {
  Header,
  Navigation,
  Login,
  InstitutionRegistration,
  InvitationCodeClaim,
  Dashboard,
  StudentRegistration,
  DocumentManagement,
  LandingPage,
  SessionManager
} from './components';

function App() {
  // Authentication and navigation state
  const {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    handleLogin,
    handleLogout,
    loadCurrentUser
  } = useAuth();

  // Add showLandingPage state - this will control whether to show landing page or app
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [currentView, setCurrentView] = useState('login');

  // ...existing code for data state and form states...
  const {
    institutions,
    setInstitutions,
    students,
    setStudents,
    documents,
    setDocuments,
    systemStatus,
    myInvitationCodes,
    loadData,
    loadSystemStatus,
    loadInstitutions,
    loadMyStudents,
    loadMyInvitationCodes
  } = useData(user, isAuthenticated);

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

  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentNumber: '',
    program: '',
    yearLevel: 1
  });

  const [documentForm, setDocumentForm] = useState({
    studentId: '',
    documentType: 'Transcript',
    title: '',
    content: ''
  });

  const [invitationCodeForm, setInvitationCodeForm] = useState({
    code: ''
  });

  const [invitationCodeInfo, setInvitationCodeInfo] = useState(null);

  // Function to navigate from landing page to app
  const enterApp = () => {
    setShowLandingPage(false);
  };

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user just authenticated, hide landing page and show dashboard
      setShowLandingPage(false);
      if (currentView === 'login') {
        setCurrentView('dashboard');
      }
    } else if (isAuthenticated && !user) {
      // Authenticated but no user data - this could be a new user
      setShowLandingPage(false);
    } else if (!isAuthenticated) {
      // If not authenticated, ensure we're in the right state
      if (!showLandingPage && currentView !== 'register-institution' && currentView !== 'claim-invitation' && currentView !== 'session-manager') {
        setCurrentView('login');
      }
    }

      // If showing landing page, render only that
    }, [isAuthenticated, user, showLandingPage, currentView]);
    
    // if (showLandingPage) {
    //   return <LandingPage onEnterApp={enterApp} />;
    // }

  
  console.log('Not showing landing page, checking authentication...', {
    isAuthenticated,
    currentView,
    userPresent: user ? 'yes' : 'no'
  });
  
  // Check for pending institution registration after authentication
  useEffect(() => {
    const checkPendingRegistration = async () => {
      try {
        // Check if user just returned from Internet Identity authentication
        const iiAuthSuccess = localStorage.getItem('iiAuthSuccess');
        if (iiAuthSuccess === 'true') {
          localStorage.removeItem('iiAuthSuccess');
          console.log('Detected return from Internet Identity authentication');
        }

        // First check if we're expecting a new Internet Identity
        const expectingNew = localStorage.getItem('expectingNewII');
        if (expectingNew === 'true' && isAuthenticated) {
          // Clear the expectation flag
          localStorage.removeItem('expectingNewII');
          
          const pendingResult = await internetIdentityService.checkForPendingInstitutionRegistration();
          if (pendingResult && pendingResult.success) {
            console.log('Found pending institution registration:', pendingResult);
            
            // Validate the formData before using it
            if (pendingResult.formData) {
              console.log('Form data found in pending result. Creating deep copy...');
              // Create a deep copy of the form data to avoid reference issues
              const formDataCopy = JSON.parse(JSON.stringify(pendingResult.formData));
              
              console.log('Setting institution form data:', formDataCopy);
              // Set the form data directly instead of using a function with prevForm
              setInstitutionWithAdminForm(formDataCopy);
              
              // Navigate to registration completion
              setShowLandingPage(false);
              setCurrentView('register-institution');
              
              // Show success notification
              const message = `Internet Identity created successfully!\n\nIdentity Anchor: ${pendingResult.anchor}\nPrincipal: ${pendingResult.principal}\n\nContinuing with institution registration...`;
              alert(message);
              
              // Automatically submit the form after a short delay
              setTimeout(() => {
                console.log('Auto-submitting institution registration with restored data');
                console.log('Current form data before auto-submit:', institutionWithAdminForm);
                
                // Use the dedicated method for submitting after II creation
                const submitWithFormData = async () => {
                  try {
                    setLoading(true);
                    // Use the form data from pendingResult instead of state which might not be updated yet
                    const result = await institutionHandlers.submitInstitutionRegistration(
                      pendingResult.formData,
                      loadInstitutions,
                      loadSystemStatus
                    );
                    
                    if (result.success) {
                      alert('Institution and admin account created successfully!\n\nThe admin can now log in using Internet Identity to manage students and documents for ' + pendingResult.formData.name + '.');
                      
                      // Clear form data
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
                      
                      // Clean up localStorage
                      localStorage.removeItem('pendingInstitutionRegistration');
                      localStorage.removeItem('expectingNewII');
                      localStorage.removeItem('registrationInProgress');
                      
                      // Navigate to dashboard
                      setCurrentView('dashboard');
                      
                      // Set user data directly from the registration result
                      console.log('✅ Setting user data directly from registration result:', result.admin);
                      setUser(result.admin);
                      setIsAuthenticated(true);
                      
                      // Update the session in InternetIdentityService
                      const principal = internetIdentityService.getPrincipal();
                      if (principal) {
                        const currentSession = internetIdentityService.getSession(principal);
                        if (currentSession) {
                          currentSession.userInfo = result.admin;
                          console.log('✅ Updated session with admin user data');
                        }
                      }
                    } else {
                      alert('Institution registration failed: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error in submitWithFormData:', error);
                    alert('Error creating institution: ' + error.message);
                  } finally {
                    setLoading(false);
                  }
                };
                
                submitWithFormData();
              }, 2000);
              
              return; // Exit early since we handled the case
            } else {
              console.error('No form data found in pending result');
            }
          } else {
            // No pending registration found, but user authenticated
            // This might be a returning user or new user without registration
            setShowLandingPage(false);
            if (user) {
              setCurrentView('dashboard');
            } else {
              // New user without registration - show setup options
              setCurrentView('dashboard'); // Will show "Account Setup Required" section
            }
            return; // Exit early
          }
        } else if (isAuthenticated && !expectingNew) {
          // Regular authentication without pending registration
          const pendingResult = await internetIdentityService.checkForPendingInstitutionRegistration();
          if (pendingResult && pendingResult.success) {
            // Handle case where pending data exists from previous session
            console.log('Found pending registration from previous session:', pendingResult);
            setInstitutionWithAdminForm(prevForm => ({
              ...pendingResult.formData,
              ...prevForm,
              ...pendingResult.formData
            }));
            setShowLandingPage(false);
            setCurrentView('register-institution');
            
            // Auto-submit after restoring data
            setTimeout(() => {
              console.log('Auto-submitting institution registration with restored data from previous session');
              
              // Use the dedicated method for submitting after II creation
              const submitWithFormData = async () => {
                try {
                  setLoading(true);
                  const result = await institutionHandlers.submitInstitutionRegistration(
                    pendingResult.formData,
                    loadInstitutions,
                    loadSystemStatus
                  );
                  
                  if (result.success) {
                    alert('Institution and admin account created successfully!\n\nThe admin can now log in using Internet Identity to manage students and documents for ' + pendingResult.formData.name + '.');
                    
                    // Clear form data
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
                    
                    // Clean up localStorage
                    localStorage.removeItem('pendingInstitutionRegistration');
                    localStorage.removeItem('expectingNewII');
                    localStorage.removeItem('registrationInProgress');
                    
                    // Navigate to dashboard
                    setCurrentView('dashboard');
                    
                    // Set user data directly from the registration result
                    console.log('✅ Setting user data directly from registration result:', result.admin);
                    setUser(result.admin);
                    setIsAuthenticated(true);
                    
                    // Update the session in InternetIdentityService
                    const principal = internetIdentityService.getPrincipal();
                    if (principal) {
                      const currentSession = internetIdentityService.getSession(principal);
                      if (currentSession) {
                        currentSession.userInfo = result.admin;
                        console.log('✅ Updated session with admin user data');
                      }
                    }
                  } else {
                    alert('Institution registration failed: ' + result.error);
                  }
                } catch (error) {
                  console.error('Error in submitWithFormData:', error);
                  alert('Error creating institution: ' + error.message);
                } finally {
                  setLoading(false);
                }
              };
              
              submitWithFormData();
            }, 1000);
            
          } else if (user) {
            // Authenticated user with data
            setShowLandingPage(false);
            setCurrentView('dashboard');
          } else {
            // Authenticated but no user data - new user
            setShowLandingPage(false);
            setCurrentView('dashboard'); // Will show setup options
          }
        }
      } catch (error) {
        console.error('Error checking for pending institution registration:', error);
        // Clean up on error
        localStorage.removeItem('expectingNewII');
        localStorage.removeItem('pendingInstitutionRegistration');
      }
    };

    // Check immediately when component mounts (for page refresh scenarios)
    checkPendingRegistration();
    
  }, [isAuthenticated]); // Remove user dependency to handle authenticated users without user data

  // Enhanced handlers with navigation
  const handleLoginWithNav = async () => {
    try {
      const result = await handleLogin();
      // Don't set currentView here - let the useEffect handle it based on authentication state
      return result;
    } catch (error) {
      // Error already handled in handleLogin
      throw error;
    }
  };

  const handleLogoutWithNav = () => {
    handleLogout();
    setCurrentView('login');
    setShowLandingPage(true); // Go back to landing page on logout
    // Clear form data on logout
    setStudents([]);
    setDocuments([]);
  };

  // Enhanced handler for institution registration from setup screen
  const handleRegisterInstitutionFromSetup = () => {
    console.log('Starting institution registration from Account Setup Required screen');
    console.log('Current auth state:', { isAuthenticated, user: !!user });
    
    // Check if there's pending registration data
    const pendingData = localStorage.getItem('pendingInstitutionRegistration');
    if (pendingData) {
      try {
        const parsed = JSON.parse(pendingData);
        const isExpired = (Date.now() - parsed.timestamp) > (30 * 60 * 1000);
        
        if (!isExpired && parsed.formData) {
          console.log('Found valid pending registration data, restoring form');
          setInstitutionWithAdminForm(parsed.formData);
          setCurrentView('register-institution');
          
          // Show message about restored data
          setTimeout(() => {
            alert('Your previous form data has been restored. Please review and submit to complete registration.');
          }, 500);
          return;
        } else if (isExpired) {
          console.log('Pending registration data has expired, clearing');
          localStorage.removeItem('pendingInstitutionRegistration');
        }
      } catch (error) {
        console.error('Error parsing pending registration data:', error);
        localStorage.removeItem('pendingInstitutionRegistration');
      }
    }
    
    // No pending data, start fresh
    console.log('No valid pending data, starting fresh registration');
    setCurrentView('register-institution');
  };

  const handleInstitutionWithAdminSubmit = (e) => {
    return institutionHandlers.handleInstitutionWithAdminSubmit(
      e,
      institutionWithAdminForm,
      setInstitutionWithAdminForm,
      setLoading,
      loadInstitutions,
      loadSystemStatus,
      setCurrentView
    );
  };

  // Auto-submission function that bypasses event handling
  const autoSubmitInstitutionRegistration = async () => {
    console.log('🎯 Auto-submitting institution registration...');
    console.log('📋 Current form data:', institutionWithAdminForm);
    
    // Safety check: Try to get form data from localStorage if current state is empty
    if (!institutionWithAdminForm.name || !institutionWithAdminForm.adminEmail) {
      console.log('⚠️ Form data appears to be missing, attempting to retrieve from localStorage...');
      try {
        const pendingData = localStorage.getItem('pendingInstitutionRegistration');
        if (pendingData) {
          const parsed = JSON.parse(pendingData);
          if (parsed.formData) {
            console.log('✅ Retrieved form data from localStorage:', parsed.formData);
            // Set the form data directly
            setInstitutionWithAdminForm(parsed.formData);
            // Return early and call this function again after a delay
            setTimeout(() => {
              console.log('🔄 Retrying auto-submit with retrieved form data');
              autoSubmitInstitutionRegistration();
            }, 1000);
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error retrieving form data from localStorage:', error);
      }
    }
    
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
        console.error('❌ Missing required fields:', missingFields);
        alert(`Institution registration failed: Missing required fields - ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
      
      // Check for duplicate accreditation number before submission
      console.log('🔍 Checking for duplicate accreditation number:', institutionWithAdminForm.accreditationNumber);
      const isDuplicate = await institutionHandlers.checkAccreditationNumberExists(
        institutionWithAdminForm.accreditationNumber
      );
      
      if (isDuplicate) {
        console.error('❌ Duplicate accreditation number found');
        alert('Institution registration failed: An institution with this accreditation number already exists. Please use a different accreditation number.');
        setLoading(false);
        return;
      }
      
      const institutionType = { [institutionWithAdminForm.institutionType]: null };
      console.log('🏛️ Creating institution with type:', institutionType);
      console.log('📞 Backend call parameters:', {
        name: institutionWithAdminForm.name,
        type: institutionType,
        address: institutionWithAdminForm.address,
        contactEmail: institutionWithAdminForm.contactEmail,
        contactPhone: institutionWithAdminForm.contactPhone,
        accreditationNumber: institutionWithAdminForm.accreditationNumber,
        website: institutionWithAdminForm.website && institutionWithAdminForm.website.trim() !== '' ? institutionWithAdminForm.website : null,
        description: institutionWithAdminForm.description && institutionWithAdminForm.description.trim() !== '' ? institutionWithAdminForm.description : null,
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

      console.log('📥 Backend response:', result);

      if ('ok' in result) {
        console.log('✅ Institution and admin created successfully!');
        alert('Institution and admin account created successfully!\n\nThe admin can now log in using Internet Identity to manage students and documents for ' + institutionWithAdminForm.name + '.');
        
        // Clear form data
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
        
        // Reload data
        await loadInstitutions();
        await loadSystemStatus();
        
        
        // Clean up localStorage
        localStorage.removeItem('pendingInstitutionRegistration');
        localStorage.removeItem('expectingNewII');
        localStorage.removeItem('registrationInProgress');
        
        // Navigate to dashboard
        setCurrentView('dashboard');
        
        // Extract admin user data from the result
        const adminUser = result.ok[1];
        
        // Set user data directly from the registration result
        console.log('✅ Setting user data directly from institution registration result:', adminUser);
        setUser(adminUser);
        setIsAuthenticated(true);
        
        // Update the session in InternetIdentityService
        const principal = internetIdentityService.getPrincipal();
        if (principal) {
          const currentSession = internetIdentityService.getSession(principal);
          if (currentSession) {
            currentSession.userInfo = adminUser;
            console.log('✅ Updated session with admin user data');
          }
        }
        
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
  };

  const handleStudentSubmit = (e) => {
    return studentHandlers.handleStudentSubmit(
      e,
      user,
      studentForm,
      setStudentForm,
      setLoading,
      loadMyStudents,
      loadMyInvitationCodes,
      loadSystemStatus
    );
  };

  const handleDocumentSubmit = (e) => {
    return documentHandlers.handleDocumentSubmit(
      e,
      user,
      documentForm,
      setDocumentForm,
      setLoading,
      loadSystemStatus
    );
  };

  const handleInvitationCodeSubmit = (e) => {
    return invitationHandlers.handleInvitationCodeSubmit(
      e,
      invitationCodeForm,
      setInvitationCodeForm,
      setLoading,
      setCurrentView
    );
  };

  const handleCheckInvitationCode = () => {
    return invitationHandlers.handleCheckInvitationCode(
      invitationCodeForm,
      setInvitationCodeInfo,
      setLoading
    );
  };

  const getNavItems = () => {
    const items = [{ key: 'dashboard', label: 'Dashboard' }];
    
    if (user?.role?.InstitutionAdmin) {
      items.push(
        { key: 'students', label: 'Register Student' },
        { key: 'documents', label: 'Issue Document' }
      );
    }
    
    if (user?.role?.SystemAdmin) {
      items.push(
        { key: 'institutions', label: 'Manage Institutions' },
        { key: 'system', label: 'System Settings' }
      );
    }
    
    return items;
  };

  // ...rest of your existing render logic...
  if (!isAuthenticated) {
    return (
      <div className="app">
        <Header isAuthenticated={isAuthenticated} />

        <main className="main-content">
          {currentView === 'login' && (
            <Login 
              handleLogin={handleLoginWithNav}
              loading={loading}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'register-institution' && (
            <InstitutionRegistration
              institutionWithAdminForm={institutionWithAdminForm}
              setInstitutionWithAdminForm={setInstitutionWithAdminForm}
              handleInstitutionWithAdminSubmit={handleInstitutionWithAdminSubmit}
              loading={loading}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'claim-invitation' && (
            <InvitationCodeClaim
              invitationCodeForm={invitationCodeForm}
              setInvitationCodeForm={setInvitationCodeForm}
              handleInvitationCodeSubmit={handleInvitationCodeSubmit}
              handleCheckInvitationCode={handleCheckInvitationCode}
              invitationCodeInfo={invitationCodeInfo}
              loading={loading}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'session-manager' && (
            <SessionManager setCurrentView={setCurrentView} />
          )}
          {!['login', 'register-institution', 'claim-invitation', 'session-manager'].includes(currentView) && (
            <div className="error-message">
              <h3>Redirecting to Login</h3>
              <p>Current view: {currentView}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <button onClick={() => setCurrentView('login')}>Go to Login</button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        handleLogout={handleLogoutWithNav} 
        isAuthenticated={isAuthenticated} 
      />

      <Navigation 
        getNavItems={getNavItems}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="main-content">
        {loading && (
          <div className="loading-spinner">Loading...</div>
        )}
        {!loading && currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            systemStatus={systemStatus}
            students={students}
            documents={documents}
            myInvitationCodes={myInvitationCodes}
          />
        )}
        {!loading && currentView === 'dashboard' && !user && isAuthenticated && (
          <div className="user-setup-required">
            <h3>Account Setup Required</h3>
            <p>You are authenticated but your account is not set up yet.</p>
            <p>Would you like to register an institution or claim an invitation?</p>
            <div className="setup-options">
              <button onClick={handleRegisterInstitutionFromSetup}>
                Register Institution
              </button>
              <button onClick={() => setCurrentView('claim-invitation')}>
                Claim Invitation
              </button>
            </div>
          </div>
        )}
        {!loading && currentView === 'students' && user?.role?.InstitutionAdmin && (
          <StudentRegistration
            studentForm={studentForm}
            setStudentForm={setStudentForm}
            handleStudentSubmit={handleStudentSubmit}
            loading={loading}
          />
        )}
        {!loading && currentView === 'documents' && user?.role?.InstitutionAdmin && (
          <DocumentManagement
            documentForm={documentForm}
            setDocumentForm={setDocumentForm}
            handleDocumentSubmit={handleDocumentSubmit}
            students={students}
            loading={loading}
          />
        )}
        {!loading && currentView === 'students' && !user?.role?.InstitutionAdmin && (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>You need Institution Administrator privileges to register students.</p>
          </div>
        )}
        {!loading && currentView === 'documents' && !user?.role?.InstitutionAdmin && (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>You need Institution Administrator privileges to manage documents.</p>
          </div>
        )}
        {!loading && !['dashboard', 'students', 'documents'].includes(currentView) && (
          <div className="error-message">
            <h3>View not found</h3>
            <p>Current view: {currentView}</p>
            <p>User authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User role: {user?.role ? Object.keys(user.role)[0] : 'None'}</p>
            <button onClick={() => setCurrentView('dashboard')}>Go to Dashboard</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;