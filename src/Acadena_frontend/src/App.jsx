import { useState, useCallback, useEffect } from 'react';
import './App.css';

import {Provider} from 'react-redux';
import store from './redux/store';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Import hooks and utilities
import { useAuth, useData } from './hooks';
import {
  institutionHandlers,
  studentHandlers,
  documentHandlers,
  invitationHandlers
} from './utils';

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
  DocumentUpload,
  DocumentPerInstitution,
  LandingPage,
  Institutions,
} from './components';

import { internetIdentityRegistrationService } from './services/InternetIdentityRegistrationService';

// Main App Component wrapped in Router context
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Navigation state
  const [currentView, setCurrentView] = useState('login');
  const [institutionDocuments, setInstitutionDocuments] = useState([]);
  const [institutionDocumentsLoading, setInstitutionDocumentsLoading] = useState(false);
  
  // Data state
  const {
    institutions,
    setInstitutions,
    students,
    documents,
    systemStatus,
    myInvitationCodes,
    loadData,
    loadSystemStatus,
    loadInstitutions,
    loadMyStudents,
    loadMyInvitationCodes
  } = useData(user, isAuthenticated);

  // Form states
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

  const [uploadDocumentForm, setUploadDocumentForm] = useState({
    studentId: '',
    documentType: 'Transcript',
    title: '',
    file: null
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

  // Load documents by institution
  const loadDocumentsByInstitution = useCallback((institutionId) => {
    documentHandlers.fetchDocumentsByInstitution(
      institutionId,
      setInstitutionDocuments,
      setInstitutionDocumentsLoading
    );
  }, [setInstitutionDocuments, setInstitutionDocumentsLoading]);

  useEffect(() => {
    // Check for pending institution registration on app load
    const checkPendingRegistration = async () => {
      if (internetIdentityRegistrationService.isRegistrationInProgress()) {
        console.log('🔄 App: Checking for pending institution registration...');

        try {
          await institutionHandlers.handleReturnFromII(
            setInstitutionWithAdminForm,
            setLoading,
            loadInstitutions,
            loadSystemStatus,
            setCurrentView
          );
        } catch (error) {
          console.error('Error handling pending registration:', error);
        }
      }
    };

    checkPendingRegistration();
  }, []);

  useEffect(() => {
    if (
      location.pathname === '/app' &&
      isAuthenticated &&
      user &&
      (currentView === 'login' || currentView === '' || currentView == null)
    ) {
      setCurrentView('dashboard');
    }
  }, [location.pathname, isAuthenticated, user, currentView]);

  useEffect(() => {
    // Get the last view from sessionStorage on mount
    const lastView = sessionStorage.getItem('currentView');
    if (lastView) {
      setCurrentView(lastView);
    }
  }, []);

  // Then modify the setCurrentView to persist the view
  const handleSetCurrentView = (view) => {
    setCurrentView(view);
    sessionStorage.setItem('currentView', view);
  };

  // Navigation functions
  const navigateToLanding = () => 
    {
    navigate('/');
  };

  const navigateToInstitutions = () => {
    navigate('/institutions');
  };

const navigateToApp = () => {
  // If not authenticated, set view to login first
  if (!isAuthenticated) {
    setCurrentView('login');
  }
  navigate('/app');
};
  // Enhanced handlers with navigation
  const handleLoginWithNav = async () => {
    try {
      await handleLogin();
      setCurrentView('dashboard');
      navigate('/app');
    } catch (error) {
      // Error already handled in handleLogin
    }
  };

  const handleDocumentUpload = (e) => {
    return documentHandlers.handleDocumentUpload(
      e,
      user,
      uploadDocumentForm,
      setUploadDocumentForm,
      setLoading,
      loadSystemStatus
    );
  };

  const handleLogoutWithNav = () => {
    handleLogout();
    setCurrentView('login');
    sessionStorage.removeItem('currentView'); 
    navigate('/'); // Navigate to landing page on logout

    // Clear form data on logout
    setInstitutions([]);
    setStudents([]);
    setDocuments([]);
  };

  // Form handlers
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

  // Navigation items
  const getNavItems = () => {
    const items = [{ key: 'dashboard', label: 'Dashboard' }];
    
    if (user?.role.InstitutionAdmin) {
      items.push(
        { key: 'students', label: 'Register Student' },
        { key: 'documents', label: 'Issue Document' },
        { key: 'upload', label: 'Upload Document' },
        { key: 'institution-documents', label: 'Institution Documents' },
        { key: 'Transferring-of-Students', label: 'Transfer Students' }
      );
    }
    
    return items;
  };

  // Modern Navigation Component
  const ModernNavigation = ({ navItems, currentView, setCurrentView }) => (
    <nav style={navStyles.nav}>
      <div style={navStyles.navContainer}>
        <div style={navStyles.navItems}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              style={{
                ...navStyles.navItem,
                ...(currentView === item.key ? navStyles.navItemActive : {})
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.key) {
                  Object.assign(e.target.style, navStyles.navItemHover);
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.key) {
                  Object.assign(e.target.style, navStyles.navItem);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div style={navStyles.navProfile}>
          <div style={navStyles.profileInfo}>
            <div style={navStyles.profileAvatar}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div style={navStyles.profileText}>
              <div style={navStyles.profileName}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={navStyles.profileRole}>
                {user?.role?.InstitutionAdmin ? 'Institution Admin' : 'User'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  // Navigation styles
  const navStyles = {
    nav: {
      background: 'linear-gradient(135deg, #2b3467 0%, #1a1f47 100%)',
      boxShadow: '0 2px 12px rgba(43, 52, 103, 0.15)',
      backdropFilter: 'blur(20px)',
      border: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0',
      margin: '0',
      fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    navContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    navItems: {
      display: 'flex',
      gap: '0.25rem',
      alignItems: 'center',
      flex: 1
    },
    navItem: {
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: "'Nunito', sans-serif",
      letterSpacing: '0.025em',
      position: 'relative'
    },
    navItemHover: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: 'white',
      transform: 'translateY(-1px)'
    },
    navItemActive: {
      background: 'rgba(255, 255, 255, 0.12)',
      color: 'white',
      fontWeight: '600',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    navProfile: {
      display: 'flex',
      alignItems: 'center'
    },
    profileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.12)'
    },
    profileAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #eb455f 0%, #d63384 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '700',
      fontSize: '0.9rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    },
    profileText: {
      color: 'white'
    },
    profileName: {
      fontSize: '0.875rem',
      fontWeight: '600',
      lineHeight: '1.2',
      fontFamily: "'Nunito', sans-serif"
    },
    profileRole: {
      fontSize: '0.75rem',
      opacity: '0.8',
      fontWeight: '500',
      fontFamily: "'Nunito', sans-serif"
    }
  };

  // Responsive styles for mobile
  const mobileStyles = `
    @media (max-width: 1024px) {
      .modern-nav-container {
        padding: 0.75rem 1.5rem;
      }
      
      .modern-nav-items {
        gap: 0.125rem;
      }
      
      .modern-nav-item {
        padding: 0.625rem 1rem;
        font-size: 0.8rem;
      }
    }
  
    @media (max-width: 768px) {
      .modern-nav-container {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
      
      .modern-nav-items {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
      }
      
      .modern-nav-item {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        flex: 1;
        min-width: 120px;
        text-align: center;
      }
      
      .modern-nav-profile {
        order: -1;
      }
    }
    
    @media (max-width: 600px) {
      .modern-nav-items {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        width: 100%;
      }
      
      .modern-nav-item {
        flex: none;
        min-width: auto;
      }
    }
    
    @media (max-width: 480px) {
      .modern-nav-container {
        padding: 0.75rem;
      }
      
      .modern-nav-items {
        grid-template-columns: 1fr;
        gap: 0.375rem;
      }
      
      .modern-nav-item {
        padding: 0.625rem;
        font-size: 0.825rem;
      }
      
      .modern-nav-profile .profile-info {
        padding: 0.375rem 0.75rem;
      }
      
      .modern-nav-profile .profile-name {
        font-size: 0.8rem;
      }
      
      .modern-nav-profile .profile-role {
        font-size: 0.7rem;
      }
    }
  `;

  // Route-based rendering
  const renderCurrentPage = () => {
    const path = location.pathname;
    
    // Landing page route
    if (path === '/') {
      return (
        <LandingPage
          onEnterApp={navigateToApp}
          onShowInstitutions={navigateToInstitutions}
        />
      );
    }
    
    // Institutions page route
    if (path === '/institutions') {
      return <Institutions onBackToLanding={navigateToLanding} />;
    }
    
    // App routes (protected)
    if (path === '/app') {
        // Show loading spinner while authentication is being checked
      if (user == null && !isAuthenticated) {
        // Only show global loading spinner while checking authentication
        if (loading) {
        return (
          <div className="app">
            <Header isAuthenticated={isAuthenticated} />
            <main className="main-content">
              <div style={{ textAlign: 'center', marginTop: '3rem', color: '#888' }}>
                Loading...
              </div>
            </main>
          </div>
          );
        }
      }
      if (!isAuthenticated || !user) {
        return (
          <div className="app">
            <Header isAuthenticated={isAuthenticated} />
            <main className="main-content">
              {currentView === 'login' && (
                <Login
                  handleLogin={handleLoginWithNav}
                  loading={loading}
                  setCurrentView={handleSetCurrentView}
                />
              )}
              {currentView === 'register-institution' && (
                <InstitutionRegistration
                  institutionWithAdminForm={institutionWithAdminForm}
                  setInstitutionWithAdminForm={setInstitutionWithAdminForm}
                  handleInstitutionWithAdminSubmit={handleInstitutionWithAdminSubmit}
                  loading={loading}
                  setCurrentView={handleSetCurrentView}
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
                  setCurrentView={handleSetCurrentView}
                />
              )}
            </main>
          </div>
        );
      }

      return (
        <div className="app">
          <style>{mobileStyles}</style>
          <Header 
            handleLogout={handleLogoutWithNav} 
            isAuthenticated={isAuthenticated} 
          />

          <ModernNavigation 
            navItems={getNavItems()}
            currentView={currentView}
            setCurrentView={handleSetCurrentView}
          />

          <main className="main-content">
            {currentView === 'dashboard' && (
              <Dashboard
                user={user}
                systemStatus={systemStatus}
                students={students}
                documents={documents}
                myInvitationCodes={myInvitationCodes}
              />
            )}
            {currentView === 'students' && user?.role.InstitutionAdmin && (
              <StudentRegistration
                studentForm={studentForm}
                setStudentForm={setStudentForm}
                handleStudentSubmit={handleStudentSubmit}
                loading={loading}
              />
            )}
            {currentView === 'documents' && user?.role.InstitutionAdmin && (
              <DocumentManagement
                documentForm={documentForm}
                setDocumentForm={setDocumentForm}
                handleDocumentSubmit={handleDocumentSubmit}
                students={students}
                loading={loading}
              />
            )}
            {currentView === 'upload' && user?.role.InstitutionAdmin && (
              <DocumentUpload
                uploadForm={uploadDocumentForm}
                setUploadForm={setUploadDocumentForm}
                handleDocumentUpload={handleDocumentUpload}
                students={students}
                loading={loading}
              />
            )}
            {currentView === 'institution-documents' && user?.role.InstitutionAdmin && (
              <DocumentPerInstitution
                institutionId={user?.role?.InstitutionAdmin}
                documents={institutionDocuments}
                setDocuments={setInstitutionDocuments}
                loading={institutionDocumentsLoading}
                setLoading={setInstitutionDocumentsLoading}
                loadDocumentsByInstitution={loadDocumentsByInstitution}
              />
            )}
          </main>
        </div>
      );
    }

    // Default fallback to landing page
    return (
      <LandingPage
        onEnterApp={navigateToApp}
        onShowInstitutions={navigateToInstitutions}
      />
    );
  };

  return renderCurrentPage();
}

// Main App Component with Router Provider
function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;