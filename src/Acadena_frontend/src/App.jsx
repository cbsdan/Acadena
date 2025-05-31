import { useState, useEffect } from 'react';
import { Acadena_backend } from 'declarations/Acadena_backend';
import './App.css';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(false);
  
  // Data state
  const [institutions, setInstitutions] = useState([]);
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});

  // Institution registration with admin form state
  const [institutionWithAdminForm, setInstitutionWithAdminForm] = useState({
    // Institution details
    name: '',
    institutionType: 'University',
    address: '',
    contactEmail: '',
    contactPhone: '',
    accreditationNumber: '',
    website: '',
    description: '',
    // Admin details
    adminFirstName: '',
    adminLastName: '',
    adminEmail: ''
  });

  // Student registration form state
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentNumber: '',
    program: '',
    yearLevel: 1
  });

  // Document management state
  const [documentForm, setDocumentForm] = useState({
    studentId: '',
    documentType: 'Transcript',
    title: '',
    content: ''
  });

  // Invitation code state
  const [invitationCodeForm, setInvitationCodeForm] = useState({
    code: ''
  });

  const [myInvitationCodes, setMyInvitationCodes] = useState([]);
  const [invitationCodeInfo, setInvitationCodeInfo] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const checkAuthentication = async () => {
    try {
      const currentUser = await Acadena_backend.getCurrentUserInfo();
      if (currentUser && currentUser.length > 0) {
        setUser(currentUser[0]);
        setIsAuthenticated(true);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.log('User not authenticated');
      setIsAuthenticated(false);
    }
  };

  const loadData = async () => {
    try {
      await loadSystemStatus();
      await loadInstitutions();
      
      if (user) {
        if (user.role.InstitutionAdmin) {
          await loadMyStudents();
          await loadMyInvitationCodes();
        } else if (user.role.Student) {
          await loadMyDocuments();
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await Acadena_backend.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const loadInstitutions = async () => {
    try {
      const institutionsList = await Acadena_backend.getAllInstitutions();
      setInstitutions(institutionsList);
    } catch (error) {
      console.error('Error loading institutions:', error);
    }
  };

  const loadMyStudents = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    
    try {
      const result = await Acadena_backend.getStudentsByInstitution(user.role.InstitutionAdmin[0]);
      if ('ok' in result) {
        setStudents(result.ok);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadMyDocuments = async () => {
    try {
      const result = await Acadena_backend.getMyDocuments();
      if ('ok' in result) {
        setDocuments(result.ok);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadMyInvitationCodes = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    
    try {
      const result = await Acadena_backend.getMyInvitationCodes();
      if ('ok' in result) {
        setMyInvitationCodes(result.ok);
      }
    } catch (error) {
      console.error('Error loading invitation codes:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await checkAuthentication();
    } catch (error) {
      alert('Please authenticate with Internet Identity first');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    setStudents([]);
    setDocuments([]);
  };

  const handleInstitutionWithAdminSubmit = async (e) => {
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
        setCurrentView('login'); // Redirect back to login after successful registration
      } else {
        alert('Error creating institution: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error creating institution:', error);
      alert('Error creating institution: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await Acadena_backend.createStudentWithInvitationCode(
        user.role.InstitutionAdmin[0], // Use admin's institution
        studentForm.firstName,
        studentForm.lastName,
        studentForm.email,
        studentForm.studentNumber,
        studentForm.program,
        parseInt(studentForm.yearLevel)
      );

      if ('ok' in result) {
        const [student, invitationCode] = result.ok;
        alert(`Student registered successfully!\n\nInvitation Code: ${invitationCode}\n\nPlease share this code with ${student.firstName} ${student.lastName} so they can claim their account using Internet Identity.`);
        setStudentForm({
          firstName: '',
          lastName: '',
          email: '',
          studentNumber: '',
          program: '',
          yearLevel: 1
        });
        await loadMyStudents();
        await loadMyInvitationCodes();
        await loadSystemStatus();
      } else {
        alert('Error registering student: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error registering student:', error);
      alert('Error registering student: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const documentType = { [documentForm.documentType]: null };
      
      const result = await Acadena_backend.issueDocument(
        documentForm.studentId,
        user.role.InstitutionAdmin[0], // Use admin's institution
        documentType,
        documentForm.title,
        documentForm.content
      );

      if ('ok' in result) {
        alert('Document issued successfully!');
        setDocumentForm({
          studentId: '',
          documentType: 'Transcript',
          title: '',
          content: ''
        });
        await loadSystemStatus();
      } else {
        alert('Error issuing document: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error issuing document:', error);
      alert('Error issuing document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Invitation Code Handlers
  
  const handleInvitationCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, check the invitation code info
      const infoResult = await Acadena_backend.getInvitationCodeInfo(invitationCodeForm.code);
      if ('err' in infoResult) {
        alert('Invalid invitation code or code not found.');
        setLoading(false);
        return;
      }
      
      const info = infoResult.ok;
      if (!info.isValid) {
        alert('This invitation code has expired or has already been used.');
        setLoading(false);
        return;
      }
      
      // Show confirmation
      const confirmClaim = confirm(`You are about to claim an account for:\n\nStudent: ${info.studentName}\nInstitution: ${info.institutionId}\n\nThis will link your Internet Identity to this student account. Continue?`);
      
      if (!confirmClaim) {
        setLoading(false);
        return;
      }
      
      // Claim the invitation code
      const result = await Acadena_backend.claimInvitationCode(invitationCodeForm.code);
      
      if ('ok' in result) {
        alert('Account successfully claimed! You can now log in with your Internet Identity.');
        setInvitationCodeForm({ code: '' });
        setCurrentView('login');
      } else {
        alert('Error claiming invitation code: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error claiming invitation code:', error);
      alert('Error claiming invitation code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckInvitationCode = async () => {
    if (!invitationCodeForm.code) {
      alert('Please enter an invitation code.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await Acadena_backend.getInvitationCodeInfo(invitationCodeForm.code);
      if ('ok' in result) {
        setInvitationCodeInfo(result.ok);
      } else {
        alert('Invalid invitation code or code not found.');
        setInvitationCodeInfo(null);
      }
    } catch (error) {
      console.error('Error checking invitation code:', error);
      alert('Error checking invitation code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Functions

  const renderLogin = () => (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Acadena</h2>
        <p>Please authenticate to access your account</p>
        <p className="login-note">Existing users can log in below. New institutions can register to get started.</p>
        <button onClick={handleLogin} disabled={loading} className="login-btn">
          {loading ? 'Authenticating...' : 'Login with Internet Identity'}
        </button>
        <div className="login-options">
          <button onClick={() => setCurrentView('register-institution')} className="link-btn">
            Register New Institution
          </button>
          <button onClick={() => setCurrentView('claim-invitation')} className="link-btn">
            I have an invitation code
          </button>
        </div>
      </div>
    </div>
  );

  const renderInstitutionRegistration = () => (
    <div className="registration-form">
      <h2>Register New Institution with Admin</h2>
      <form onSubmit={handleInstitutionWithAdminSubmit}>
        <h3>Institution Details</h3>
        
        <div className="form-group">
          <label htmlFor="name">Institution Name *</label>
          <input
            type="text"
            id="name"
            value={institutionWithAdminForm.name}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="institutionType">Institution Type *</label>
          <select
            id="institutionType"
            value={institutionWithAdminForm.institutionType}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, institutionType: e.target.value})}
            required
          >
            <option value="University">University</option>
            <option value="College">College</option>
            <option value="HighSchool">High School</option>
            <option value="ElementarySchool">Elementary School</option>
            <option value="TechnicalSchool">Technical School</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            value={institutionWithAdminForm.address}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, address: e.target.value})}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email *</label>
            <input
              type="email"
              id="contactEmail"
              value={institutionWithAdminForm.contactEmail}
              onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactEmail: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">Contact Phone *</label>
            <input
              type="tel"
              id="contactPhone"
              value={institutionWithAdminForm.contactPhone}
              onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactPhone: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="accreditationNumber">Accreditation Number *</label>
          <input
            type="text"
            id="accreditationNumber"
            value={institutionWithAdminForm.accreditationNumber}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, accreditationNumber: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            value={institutionWithAdminForm.website}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, website: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={institutionWithAdminForm.description}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, description: e.target.value})}
          />
        </div>

        <h3>Administrator Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminFirstName">Admin First Name *</label>
            <input
              type="text"
              id="adminFirstName"
              value={institutionWithAdminForm.adminFirstName}
              onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminFirstName: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminLastName">Admin Last Name *</label>
            <input
              type="text"
              id="adminLastName"
              value={institutionWithAdminForm.adminLastName}
              onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminLastName: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="adminEmail">Admin Email *</label>
          <input
            type="email"
            id="adminEmail"
            value={institutionWithAdminForm.adminEmail}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminEmail: e.target.value})}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Institution...' : 'Create Institution & Admin'}
          </button>
          <button type="button" onClick={() => setCurrentView('login')}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );

  const renderInvitationCodeClaim = () => (
    <div className="registration-form">
      <h2>Claim Your Student Account</h2>
      <p>Enter the invitation code provided by your institution to claim your student account.</p>
      
      <form onSubmit={handleInvitationCodeSubmit}>
        <div className="form-group">
          <label htmlFor="invitationCode">Invitation Code *</label>
          <input
            type="text"
            id="invitationCode"
            value={invitationCodeForm.code}
            onChange={(e) => setInvitationCodeForm({...invitationCodeForm, code: e.target.value})}
            placeholder="Enter your invitation code"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCheckInvitationCode} disabled={loading}>
            Check Code
          </button>
        </div>

        {invitationCodeInfo && (
          <div className="invitation-info">
            <h3>Account Information</h3>
            <p><strong>Student Name:</strong> {invitationCodeInfo.studentName}</p>
            <p><strong>Institution:</strong> {invitationCodeInfo.institutionId}</p>
            <p><strong>Status:</strong> {invitationCodeInfo.isValid ? 'Valid' : 'Invalid/Expired'}</p>
            <p><strong>Expires:</strong> {new Date(Number(invitationCodeInfo.expiryDate) / 1000000).toLocaleDateString()}</p>
            
            {invitationCodeInfo.isValid && (
              <div className="claim-warning">
                <p><strong>Important:</strong> Claiming this account will link it to your Internet Identity. This action cannot be undone.</p>
              </div>
            )}
          </div>
        )}

        {invitationCodeInfo && invitationCodeInfo.isValid && (
          <div className="form-actions">
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Claiming Account...' : 'Claim Account with Internet Identity'}
            </button>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => setCurrentView('login')} className="link-btn">
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );

  const renderDashboard = () => {
    const getUserRoleDisplay = () => {
      if (user.role.SystemAdmin) return 'System Administrator';
      if (user.role.InstitutionAdmin) return 'Institution Administrator';
      if (user.role.Student) return 'Student';
      return 'Unknown';
    };

    return (
      <div className="dashboard">
        <div className="user-info">
          <h2>Welcome, {user.firstName} {user.lastName}</h2>
          <p><strong>Role:</strong> {getUserRoleDisplay()}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Institutions</h3>
            <p className="stat-number">{systemStatus.totalInstitutions || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-number">{systemStatus.totalStudents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Documents</h3>
            <p className="stat-number">{systemStatus.totalDocuments || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{systemStatus.totalUsers || 0}</p>
          </div>
        </div>

        {user.role.InstitutionAdmin && (
          <div className="my-students">
            <h3>My Students ({students.length})</h3>
            {students.length === 0 ? (
              <p>No students registered yet.</p>
            ) : (
              <div className="students-list">
                {students.map((student) => (
                  <div key={student.id} className="student-card">
                    <h4>{student.firstName} {student.lastName}</h4>
                    <p><strong>Student Number:</strong> {student.studentNumber}</p>
                    <p><strong>Program:</strong> {student.program}</p>
                    <p><strong>Year Level:</strong> {student.yearLevel}</p>
                    <p><strong>Email:</strong> {student.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role.Student && (
          <div className="my-documents">
            <h3>My Documents ({documents.length})</h3>
            {documents.length === 0 ? (
              <p>No documents issued yet.</p>
            ) : (
              <div className="documents-list">
                {documents.map((document) => (
                  <div key={document.id} className="document-card">
                    <h4>{document.title}</h4>
                    <p><strong>Type:</strong> {Object.keys(document.documentType)[0]}</p>
                    <p><strong>Issue Date:</strong> {new Date(Number(document.issueDate) / 1000000).toLocaleDateString()}</p>
                    <p><strong>Verified:</strong> {document.isVerified ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role.InstitutionAdmin && (
          <div className="my-invitation-codes">
            <h3>My Invitation Codes ({myInvitationCodes.length})</h3>
            {myInvitationCodes.length === 0 ? (
              <p>No invitation codes generated yet. Register students to create invitation codes.</p>
            ) : (
              <div className="invitation-codes-list">
                {myInvitationCodes.map((invitation) => (
                  <div key={invitation.code} className="invitation-card">
                    <h4>{invitation.studentName}</h4>
                    <p><strong>Invitation Code:</strong> <code>{invitation.code}</code></p>
                    <p><strong>Student ID:</strong> {invitation.studentId}</p>
                    <p><strong>Created:</strong> {new Date(Number(invitation.createdDate) / 1000000).toLocaleDateString()}</p>
                    <p><strong>Expires:</strong> {new Date(Number(invitation.expiryDate) / 1000000).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {invitation.isUsed ? (
                      <span className="status-used">
                        Used on {new Date(Number(invitation.usedDate) / 1000000).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}</p>
                    {!invitation.isUsed && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(invitation.code)}
                        className="copy-btn"
                        title="Copy invitation code"
                      >
                        Copy Code
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStudentRegistration = () => (
    <div className="registration-form">
      <h2>Register New Student</h2>
      <form onSubmit={handleStudentSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              value={studentForm.firstName}
              onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              value={studentForm.lastName}
              onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={studentForm.email}
            onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentNumber">Student Number *</label>
            <input
              type="text"
              id="studentNumber"
              value={studentForm.studentNumber}
              onChange={(e) => setStudentForm({...studentForm, studentNumber: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="yearLevel">Year Level *</label>
            <input
              type="number"
              id="yearLevel"
              min="1"
              max="10"
              value={studentForm.yearLevel}
              onChange={(e) => setStudentForm({...studentForm, yearLevel: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="program">Program *</label>
          <input
            type="text"
            id="program"
            value={studentForm.program}
            onChange={(e) => setStudentForm({...studentForm, program: e.target.value})}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Student'}
        </button>
      </form>
    </div>
  );

  const renderDocumentManagement = () => (
    <div className="registration-form">
      <h2>Issue New Document</h2>
      <form onSubmit={handleDocumentSubmit}>
        <div className="form-group">
          <label htmlFor="studentId">Student *</label>
          <select
            id="studentId"
            value={documentForm.studentId}
            onChange={(e) => setDocumentForm({...documentForm, studentId: e.target.value})}
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.studentNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="documentType">Document Type *</label>
          <select
            id="documentType"
            value={documentForm.documentType}
            onChange={(e) => setDocumentForm({...documentForm, documentType: e.target.value})}
            required
          >
            <option value="Transcript">Transcript</option>
            <option value="Diploma">Diploma</option>
            <option value="Certificate">Certificate</option>
            <option value="Recommendation">Recommendation</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Document Title *</label>
          <input
            type="text"
            id="title"
            value={documentForm.title}
            onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Document Content *</label>
          <textarea
            id="content"
            value={documentForm.content}
            onChange={(e) => setDocumentForm({...documentForm, content: e.target.value})}
            rows="6"
            placeholder="Enter the document content"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Issuing Document...' : 'Issue Document'}
        </button>
      </form>
    </div>
  );

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

  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <img src="/logo2.svg" alt="Acadena logo" className="logo" />
              <h1>Acadena</h1>
              <p>Academic Records Management System</p>
            </div>
          </div>
        </header>

        <main className="main-content">
          {currentView === 'login' && renderLogin()}
          {currentView === 'register-institution' && renderInstitutionRegistration()}
          {currentView === 'claim-invitation' && renderInvitationCodeClaim()}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/logo2.svg" alt="Acadena logo" className="logo" />
            <h1>Acadena</h1>
            <p>Academic Records Management System</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <nav className="main-nav">
        {getNavItems().map((item) => (
          <button
            key={item.key}
            className={currentView === item.key ? 'active' : ''}
            onClick={() => setCurrentView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'students' && user?.role.InstitutionAdmin && renderStudentRegistration()}
        {currentView === 'documents' && user?.role.InstitutionAdmin && renderDocumentManagement()}
      </main>
    </div>
  );
}

export default App;
