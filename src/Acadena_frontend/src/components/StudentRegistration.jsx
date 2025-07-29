import React from 'react';
import './assets/styles/studentregister.css';
import studentImage from './assets/images/student.png';

const StudentRegistration = ({ 
  studentForm, 
  setStudentForm, 
  handleStudentSubmit, 
  loading 
}) => {
  const [successModal, setSuccessModal] = React.useState({
    isOpen: false,
    student: null,
    invitationCode: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await handleStudentSubmit(
        e,
        studentForm,
        setStudentForm,
        loading
      );
      if (result?.student && result?.invitationCode) {
        setSuccessModal({
          isOpen: true,
          student: result.student,
          invitationCode: result.invitationCode
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
};

return (
  <div className="student-registration-container">
    <div className="registration-background">
      <div className="floating-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
    </div>

    <div className="registration-content">
      {/* Left Side - Form */}
      <div className="form-section">
        <div className="form-header">
          <div className="form-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 12v5c3 0 9-1 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Student Registration</h1>
          <p>Register a new student to the academic system</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Enter first name"
                value={studentForm.firstName}
                onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Enter last name"
                value={studentForm.lastName}
                onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter email address"
              value={studentForm.email}
              onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentNumber">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Student Number *
              </label>
              <input
                type="text"
                id="studentNumber"
                placeholder="Enter student ID number"
                value={studentForm.studentNumber}
                onChange={(e) => setStudentForm({...studentForm, studentNumber: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearLevel">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Year Level *
              </label>
              <select
                id="yearLevel"
                value={studentForm.yearLevel}
                onChange={(e) => setStudentForm({...studentForm, yearLevel: e.target.value})}
                required
              >
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
                <option value="custom">Other (Specify)</option>
              </select>
              {studentForm.yearLevel === 'custom' && (
                <input
                  type="text"
                  placeholder="Specify year level"
                  value={studentForm.customYearLevel || ''}
                  onChange={(e) => setStudentForm({...studentForm, customYearLevel: e.target.value})}
                  style={{ marginTop: '8px' }}
                  required
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="program">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Academic Program *
            </label>
            <select
              id="program"
              value={studentForm.program}
              onChange={(e) => setStudentForm({...studentForm, program: e.target.value})}
              required
            >
              <option value="">Select Academic Program</option>
              <optgroup label="Computer Science & IT">
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data Science">Data Science</option>
                <option value="Computer Engineering">Computer Engineering</option>
              </optgroup>
              <optgroup label="Engineering">
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Industrial Engineering">Industrial Engineering</option>
                <option value="Aerospace Engineering">Aerospace Engineering</option>
              </optgroup>
              <optgroup label="Business & Management">
                <option value="Business Administration">Business Administration</option>
                <option value="Accounting">Accounting</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resource Management">Human Resource Management</option>
                <option value="Economics">Economics</option>
              </optgroup>
              <optgroup label="Healthcare">
                <option value="Nursing">Nursing</option>
                <option value="Medicine">Medicine</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Physical Therapy">Physical Therapy</option>
                <option value="Medical Technology">Medical Technology</option>
              </optgroup>
              <optgroup label="Liberal Arts & Sciences">
                <option value="Psychology">Psychology</option>
                <option value="English Literature">English Literature</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="History">History</option>
                <option value="Political Science">Political Science</option>
              </optgroup>
              <optgroup label="Arts & Design">
                <option value="Fine Arts">Fine Arts</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Architecture">Architecture</option>
                <option value="Interior Design">Interior Design</option>
                <option value="Music">Music</option>
                <option value="Theater Arts">Theater Arts</option>
              </optgroup>
              <optgroup label="Education">
                <option value="Elementary Education">Elementary Education</option>
                <option value="Secondary Education">Secondary Education</option>
                <option value="Special Education">Special Education</option>
                <option value="Physical Education">Physical Education</option>
              </optgroup>
              <option value="custom">Other (Specify)</option>
            </select>
            {studentForm.program === 'custom' && (
              <input
                type="text"
                placeholder="Specify your academic program"
                value={studentForm.customProgram || ''}
                onChange={(e) => setStudentForm({...studentForm, customProgram: e.target.value})}
                style={{ marginTop: '8px' }}
                required
              />
            )}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Registering Student...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Register Student
              </>
            )}
          </button>
        </form>
      </div>
      {/* Add this before the closing div of student-registration-container */}
   
      {/* Right Side - Image */}
      <div className="image-section">
        <div className="image-container">
          <img 
            src={studentImage} 
            alt="Student Registration" 
            className="registration-image"
          />
          <div className="image-overlay">
            <h3>Join Our Academic Community</h3>
            <p>Empowering students with secure, verifiable academic credentials for their educational journey.</p>
            <div className="features-list">
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Secure Digital Identity</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Verifiable Credentials</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Academic Record Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
         <SuccessModal 
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        student={successModal.student}
        invitationCode={successModal.invitationCode}
      />
    </div>
    </div>

  );           
};


const SuccessModal = ({ isOpen, onClose, student, invitationCode }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="document-modal-header">
          <h3>Student Registered Successfully!</h3>
          <button className="close-modal" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="document-modal-body">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#22C55E" strokeWidth="2"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="#22C55E" strokeWidth="2"/>
            </svg>
          </div>
          <div className="document-details">
            <div className="detail-item">
              <strong>Student Name:</strong> {student?.firstName} {student?.lastName}
            </div>
            <div className="detail-item">
              <strong>Student Number:</strong> {student?.studentNumber}
            </div>
            <div className="detail-item">
              <strong>Program:</strong> {student?.program}
            </div>
            <div className="token-info">
              <strong>Invitation Code:</strong>
              <code>{invitationCode}</code>
              <p className="invitation-note">
                Please share this invitation code with the student to claim their account using Internet Identity.
              </p>
            </div>
          </div>
        </div>
        <div className="document-modal-footer">
          <button className="modal-action-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};


export default StudentRegistration;