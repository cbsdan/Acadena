import React from 'react';
import './assets/styles/studentregister.css';
import studentImage from './assets/images/student.png';

const StudentRegistration = ({ 
  studentForm, 
  setStudentForm, 
  handleStudentSubmit, 
  loading 
}) => (
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

        <form onSubmit={handleStudentSubmit} className="registration-form">
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
              <input
                type="number"
                id="yearLevel"
                min="1"
                max="10"
                placeholder="1-10"
                value={studentForm.yearLevel}
                onChange={(e) => setStudentForm({...studentForm, yearLevel: e.target.value})}
                required
              />
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
            <input
              type="text"
              id="program"
              placeholder="Enter program/course name"
              value={studentForm.program}
              onChange={(e) => setStudentForm({...studentForm, program: e.target.value})}
              required
            />
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
    </div>
  </div>
);

export default StudentRegistration;