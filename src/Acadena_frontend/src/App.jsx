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
    handleLogout
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
            
            // Restore institution form data and continue registration
            setInstitutionWithAdminForm(prevForm => ({
              ...pendingResult.formData,
              // Keep any existing form data that wasn't in the saved data
              ...prevForm,
              // Override with saved data
              ...pendingResult.formData
            }));
            
            // Navigate to registration completion
            setShowLandingPage(false);
            setCurrentView('register-institution');
            
            // Show success notification
            const message = `Internet Identity created successfully!\n\nIdentity Anchor: ${pendingResult.anchor}\nPrincipal: ${pendingResult.principal}\n\nContinuing with institution registration...`;
            alert(message);
            return; // Exit early since we handled the case
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
            setInstitutionWithAdminForm(prevForm => ({
              ...pendingResult.formData,
              ...prevForm,
              ...pendingResult.formData
            }));
            setShowLandingPage(false);
            setCurrentView('register-institution');
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

  // ...rest of your existing handler functions...
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
              <button onClick={() => setCurrentView('register-institution')}>
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