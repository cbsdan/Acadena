import React, { useState } from 'react';
import './assets/styles/dashboard.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllDocuUsingAccessToken } from '../redux/actions/documentAction';
import { fetchStudentByUserId } from '../redux/actions/studentAction';

const Dashboard = ({ 
  user, 
  systemStatus, 
  students, 
  myInvitationCodes 
}) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // Access student info from Redux store
  const studentInfo = useSelector(state => state.student.student);
  // Access documents from Redux store
  const documents = useSelector(state => state.document.documents);
  const dispatch = useDispatch();


  const getUserRoleDisplay = () => {
    if (user.role.SystemAdmin) return 'System Administrator';
    if (user.role.InstitutionAdmin) return 'Institution Administrator';
    if (user.role.Student) return 'Student';
    return 'Unknown';
  };
  
  React.useEffect(() => {
    if (user.role.Student ) {
      console.log("KINGINAAAAAAAAA", user);
      dispatch(fetchStudentByUserId(user.role.Student));
      dispatch(fetchAllDocuUsingAccessToken({ studentid: user.role.Student }));
    }
  }, [user.role.Student, user.id, dispatch]);

  React.useEffect(() => {
    if (user.role.Student && studentInfo && studentInfo.id) {
      dispatch(fetchAllDocuUsingAccessToken({ studentid: user.role.Student }));
    }
  }, [user.role.Student, studentInfo, dispatch]);

  const getRoleIcon = () => {
    if (user.role.SystemAdmin) {
      return (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (user.role.InstitutionAdmin) {
      return (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78A5.5 5.5 0 0 0 19 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (user.role.Student) {
      return (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 12v5c3 0 9-1 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return null;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
 const handlePreviewDocument = (document) => {
    let fileArr = document.file && document.file[0];
    if (!fileArr) return;
    const type = (document.fileType && document.fileType[0]) || 'application/pdf';
    const blob = new Blob([fileArr], { type });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Download document file
  const handleDownloadDocument = (document) => {
    // document.file is an array with a single Uint8Array
    let fileArr = document.file && document.file[0];
    if (!fileArr) return;
    // Convert to Blob
    const blob = new Blob([fileArr], { type: (document.fileType && document.fileType[0]) || 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = (document.fileName && document.fileName[0]) ? document.fileName[0] : (document.title ? document.title.replace(/\s+/g, '_') + '.pdf' : 'document.pdf');
    window.document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  console.log('Dashboard rendered with user:', students);

  return (
    <div className="dashboard">
      <div className="dashboard-wrapper">
        {/* Floating Background Elements */}
        <div className="floating-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>

        {/* Header Section */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <div className="user-avatar-container">
              <div className="user-avatar">
                <div className="avatar-icon">
                  {getRoleIcon()}
                </div>
                <div className="online-indicator"></div>
              </div>
            </div>
            <div className="welcome-content">
              <div className="greeting-text">{getGreeting()}</div>
              <h1 className="welcome-title">
                <span className="user-name">
                  {getUserRoleDisplay() === "Institution Administrator" && "Admin"}
                  {getUserRoleDisplay() === "Student" && ""}
                </span>
              </h1>
              <div className="user-details">
                <div className="user-role">
                  <span className="role-badge">{getUserRoleDisplay()}</span>
                </div>
                <div className="user-email">
                  <svg className="email-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="quick-actions">
            <button className="action-btn notifications">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="notification-dot"></span>
            </button>
          </div>
        </div>

        {/* Role-specific sections */}
        {user.role.InstitutionAdmin && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                Students
              </h2>
              <div className="section-actions">
                <span className="section-count">{students.length} students</span>
              </div>
            </div>
            {students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-illustration">
                  <svg viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                    <path d="M45 45h30v30H45z" fill="#cbd5e0"/>
                    <circle cx="52" cy="55" r="3" fill="#a0aec0"/>
                    <circle cx="68" cy="55" r="3" fill="#a0aec0"/>
                    <path d="M50 65h20" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>No students registered yet</h3>
                <p>Start by registering your first student to begin managing their academic records and credentials.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Student
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Student ID
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Program
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Contact
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} className={`table-row row-${index % 2}`}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar-small">
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </div>
                            <div className="student-details">
                              <span className="student-name">{student.firstName} {student.lastName}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="student-id-badge">#{student.studentNumber}</span>
                        </td>
                        <td>
                          <span className="program-text">{student.program}</span>
                        </td>
                        <td>
                          <span className="email-text">{student.email}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {user.role.Student && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                My Documents
              </h2>
              <div className="section-actions">
                <span className="section-count">{documents.length} documents</span>
              </div>
            </div>
            {(!documents || documents.length === 0) ? (
              <div className="empty-state">
                <div className="empty-illustration">
                  <svg viewBox="0 0 120 120" fill="none">
                    <rect x="30" y="20" width="60" height="80" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                    <rect x="40" y="35" width="40" height="3" fill="#cbd5e0"/>
                    <rect x="40" y="45" width="30" height="3" fill="#cbd5e0"/>
                    <rect x="40" y="55" width="35" height="3" fill="#cbd5e0"/>
                  </svg>
                </div>
                <h3>No documents issued yet</h3>
                <p>Your academic documents and certificates will appear here once they are issued by your institution.</p>
              </div>
            ) : (
              <div className="cards-grid documents-grid">
                {/* Show all documents fetched for the student, no filtering applied */}
                {documents.map((document, index) => (
                  <div key={document.id} className={`info-card document-card card-${index % 4}`}>
                    <div className="card-header">
                      <div className="document-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="card-title-section">
                        <h4>{document.title}</h4>
                      </div>
                      <div className={`verification-badge ${document.isVerified ? 'verified' : 'pending'}`}>
                        {document.isVerified ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Verified
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M8 12h8" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Pending
                          </>
                        )}
                      </div>
                      {/* Download button */}
                      <button className="download-btn" onClick={() => handleDownloadDocument(document)} title="Download Document" style={{marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer'}}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                          <path d="M12 3v14m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Type</span>
                          <span className="info-value">{Object.keys(document.documentType)[0]}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Issue Date</span>
                          <span className="info-value">
                            {new Date(Number(document.issueDate) / 1000000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="document-content-preview">
                        <strong>Content:</strong>
                        <div style={{whiteSpace: 'pre-wrap', background: '#f9fafb', padding: 8, borderRadius: 6, marginTop: 4}}>
                          {document.content || 'No content available'}
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      {/* Removed duplicate download button at the bottom */}
                    </div>
                        <button
                  className="preview-btn"
                  onClick={() => handlePreviewDocument(document)}
                  title="Preview Document"
                  style={{marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer'}}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role.InstitutionAdmin && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                Invitation Codes
              </h2>
              <div className="section-actions">
                <span className="section-count">{myInvitationCodes.length} codes</span>
              </div>
            </div>
            {myInvitationCodes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-illustration">
                  <svg viewBox="0 0 120 120" fill="none">
                    <rect x="20" y="40" width="80" height="40" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                    <circle cx="30" cy="50" r="3" fill="#cbd5e0"/>
                    <rect x="40" y="47" width="30" height="6" fill="#cbd5e0"/>
                    <rect x="40" y="60" width="20" height="4" fill="#e2e8f0"/>
                  </svg>
                </div>
                <h3>No invitation codes generated yet</h3>
                <p>Register students to create invitation codes that they can use to access the system and verify their identity.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Student
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Invitation Code
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M8 12h8" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Status
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Created
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Expires
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInvitationCodes.map((invitation, index) => (
                      <tr key={invitation.code} className={`table-row row-${index % 2}`}>
                        <td>
                          <div className="student-info">
                            <div className="student-avatar-small">
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </div>
                            <div className="student-details">
                              <span className="student-name">{invitation.studentName}</span>
                              <span className="student-id-small">#{invitation.studentId}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="code-cell">
                            <code className="invitation-code-small">{invitation.code}</code>
                            {!invitation.isUsed && (
                              <button 
                                onClick={() => copyToClipboard(invitation.code)}
                                className={`copy-btn-small ${copiedCode === invitation.code ? 'copied' : ''}`}
                                title="Copy invitation code"
                              >
                                {copiedCode === invitation.code ? (
                                  <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge-small ${invitation.isUsed ? 'used' : 'available'}`}>
                            {invitation.isUsed ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td>
                          <span className="date-text">
                            {new Date(Number(invitation.createdDate) / 1000000).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <span className="date-text">
                            {new Date(Number(invitation.expiryDate) / 1000000).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

       {previewUrl && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewType(null);
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: 16,
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            {previewType && previewType.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 8 }}
              />
            ) : previewType === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                title="PDF Preview"
                style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: 8 }}
              />
            ) : (
              <div>No preview available</div>
            )}
            <button
              style={{
                marginTop: 16,
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 24px',
                fontSize: 18,
                cursor: 'pointer'
              }}
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setPreviewType(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;