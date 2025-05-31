import React from 'react';

const Dashboard = ({ 
  user, 
  systemStatus, 
  students, 
  documents, 
  myInvitationCodes 
}) => {
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

export default Dashboard;
