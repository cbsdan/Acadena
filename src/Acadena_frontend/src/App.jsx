import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { useAuth, useData } from './hooks';
import {
  institutionHandlers,
  studentHandlers,
  documentHandlers,
  invitationHandlers
} from './utils';
import { internetIdentityService } from './services/InternetIdentityService';
import {
  Header,
  Navigation,
  Login,
  InstitutionRegistration,
  InvitationCodeClaim,
  Dashboard,
  StudentRegistration,
  DocumentManagement,
  SessionManager,
  ProtectedRoute,
  AccountSetup,
  NotFound,
  LandingPage
} from './components';

function App() {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}

function AppWithRouter() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const {
    institutions,
    setInstitutions,
    students,
    setStudents,
    documents,
    setDocuments,
    systemStatus,
    myInvitationCodes,
    loadSystemStatus,
    loadInstitutions,
    loadMyStudents,
    loadMyInvitationCodes
  } = useData(user, isAuthenticated);

  const [institutionWithAdminForm, setInstitutionWithAdminForm] = useState({
    name: '', institutionType: 'University', address: '', contactEmail: '', contactPhone: '', accreditationNumber: '', website: '', description: '', adminFirstName: '', adminLastName: '', adminEmail: ''
  });
  const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', email: '', studentNumber: '', program: '', yearLevel: 1 });
  const [documentForm, setDocumentForm] = useState({ studentId: '', documentType: 'Transcript', title: '', content: '' });
  const [invitationCodeForm, setInvitationCodeForm] = useState({ code: '' });
  const [invitationCodeInfo, setInvitationCodeInfo] = useState(null);

  // Minimal navigation effect
  useEffect(() => {
    if (!isAuthenticated) {
      if (!['/', '/login', '/register-institution', '/claim-invitation', '/session-manager'].includes(location.pathname)) {
        navigate('/');
      }
    } else if (isAuthenticated && !user) {
      navigate('/account-setup');
    } else if (isAuthenticated && user && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  // Minimal pending registration check (only on login/register-institution)
  useEffect(() => {
    const checkPending = async () => {
      if ((location.pathname === '/login' || location.pathname === '/register-institution') && isAuthenticated) {
        const pending = await internetIdentityService.checkForPendingInstitutionRegistration();
        if (pending && pending.success && pending.formData) {
          setInstitutionWithAdminForm(pending.formData);
          navigate('/register-institution');
        }
      }
    };
    checkPending();
    // Only run on auth or location change
  }, [isAuthenticated, location.pathname]);

  // Handlers
  const handleLoginWithNav = async () => { await handleLogin(); };
  const handleLogoutWithNav = async () => { 
    await handleLogout(); 
    navigate('/login'); 
    setStudents([]); 
    setDocuments([]); 
  };
  const onNavigateToLanding = () => { navigate('/'); };
  const handleRegisterInstitutionFromSetup = () => { navigate('/register-institution'); };
  const handleInstitutionWithAdminSubmit = (e) => institutionHandlers.handleInstitutionWithAdminSubmit(e, institutionWithAdminForm, setInstitutionWithAdminForm, setLoading, loadInstitutions, loadSystemStatus, navigate);
  const handleStudentSubmit = (e) => studentHandlers.handleStudentSubmit(e, user, studentForm, setStudentForm, setLoading, loadMyStudents, loadMyInvitationCodes, loadSystemStatus);
  const handleDocumentSubmit = (e) => documentHandlers.handleDocumentSubmit(e, user, documentForm, setDocumentForm, setLoading, loadSystemStatus);
  const handleInvitationCodeSubmit = (e) => invitationHandlers.handleInvitationCodeSubmit(e, invitationCodeForm, setInvitationCodeForm, setLoading, navigate);
  const handleCheckInvitationCode = () => invitationHandlers.handleCheckInvitationCode(invitationCodeForm, setInvitationCodeInfo, setLoading);
  const getNavItems = () => {
    const items = [{ key: 'dashboard', label: 'Dashboard', path: '/dashboard' }];
    if (user?.role?.InstitutionAdmin) items.push({ key: 'students', label: 'Register Student', path: '/students' }, { key: 'documents', label: 'Issue Document', path: '/documents' });
    if (user?.role?.SystemAdmin) items.push({ key: 'institutions', label: 'Manage Institutions', path: '/institutions' }, { key: 'system', label: 'System Settings', path: '/system' });
    return items;
  };

  return (
    <div className="app">
      {location.pathname !== '/' && (
        <Header
          handleLogout={handleLogoutWithNav}
          isAuthenticated={isAuthenticated}
          onNavigateToLanding={onNavigateToLanding}
        />
      )}
      {isAuthenticated && location.pathname !== '/' && (
        <Navigation getNavItems={getNavItems} />
      )}
      <main className="main-content">
        {loading && <div className="loading-spinner">Loading...</div>}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!isAuthenticated ? <Login handleLogin={handleLoginWithNav} loading={loading} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register-institution" element={<InstitutionRegistration institutionWithAdminForm={institutionWithAdminForm} setInstitutionWithAdminForm={setInstitutionWithAdminForm} handleInstitutionWithAdminSubmit={handleInstitutionWithAdminSubmit} loading={loading} />} />
          <Route path="/claim-invitation" element={<InvitationCodeClaim invitationCodeForm={invitationCodeForm} setInvitationCodeForm={setInvitationCodeForm} handleInvitationCodeSubmit={handleInvitationCodeSubmit} handleCheckInvitationCode={handleCheckInvitationCode} invitationCodeInfo={invitationCodeInfo} loading={loading} />} />
          <Route path="/session-manager" element={<SessionManager />} />
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}>{user ? <Dashboard user={user} systemStatus={systemStatus} students={students} documents={documents} myInvitationCodes={myInvitationCodes} /> : <AccountSetup onRegisterInstitution={handleRegisterInstitutionFromSetup} />}</ProtectedRoute>} />
          <Route path="/account-setup" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AccountSetup onRegisterInstitution={handleRegisterInstitutionFromSetup} /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="InstitutionAdmin" userRole={user?.role}><StudentRegistration studentForm={studentForm} setStudentForm={setStudentForm} handleStudentSubmit={handleStudentSubmit} loading={loading} /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="InstitutionAdmin" userRole={user?.role}><DocumentManagement documentForm={documentForm} setDocumentForm={setDocumentForm} handleDocumentSubmit={handleDocumentSubmit} students={students} loading={loading} /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;