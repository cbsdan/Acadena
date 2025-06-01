import { useState } from 'react';
import './App.css';

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
  LandingPage,
  Institutions,
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

  // Add showLandingPage and showInstitutions state
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showInstitutions, setShowInstitutions] = useState(false);
  const [currentView, setCurrentView] = useState('login');

  // ...existing code for data state and form states...
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
    setShowInstitutions(false);
  };

  // Function to show Institutions page
  const showInstitutionsPage = () => {
    setShowLandingPage(false);
    setShowInstitutions(true);
  };

  // If showing Institutions page, render only that
  if (showInstitutions) {
    return <Institutions />;
  }

  // If showing landing page, render only that
  if (showLandingPage) {
    return (
      <LandingPage
        onEnterApp={enterApp}
        onShowInstitutions={showInstitutionsPage}
      />
    );
  }

  // Enhanced handlers with navigation
  const handleLoginWithNav = async () => {
    try {
      await handleLogin();
      setCurrentView('dashboard');
    } catch (error) {
      // Error already handled in handleLogin
    }
  };

  const handleLogoutWithNav = () => {
    handleLogout();
    setCurrentView('login');
    setShowLandingPage(true); // Go back to landing page on logout
    setShowInstitutions(false);
    // Clear form data on logout
    setInstitutions([]);
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
    
    if (user?.role.InstitutionAdmin) {
      items.push(
        { key: 'students', label: 'Register Student' },
        { key: 'documents', label: 'Issue Document' }
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
      </main>
    </div>
  );
}

export default App;