import React from 'react';
import './assets/styles/document.css';

const DocumentManagement = ({ 
  documentForm, 
  setDocumentForm, 
  handleDocumentSubmit, 
  students, 
  loading 
}) => (
  <div className="document-management-container">
    <div className="document-background">
      <div className="floating-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
    </div>

    <div className="document-content">
      <div className="document-header">
        <div className="header-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>Issue New Document</h1>
          <p>Create and issue official academic documents to students</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-dot"></div>
          <div className="decoration-dot"></div>
          <div className="decoration-dot"></div>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleDocumentSubmit} className="document-form">
          <div className="form-section">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Student Information
            </div>

            <div className="form-group">
              <label htmlFor="studentId">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Select Student *
              </label>
              <div className="select-wrapper">
                <select
                  id="studentId"
                  value={documentForm.studentId}
                  onChange={(e) => setDocumentForm({...documentForm, studentId: e.target.value})}
                  required
                >
                  <option value="">Choose a student from your institution</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} (#{student.studentNumber})
                    </option>
                  ))}
                </select>
                <svg className="select-arrow" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Document Details
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentType">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Document Type *
                </label>
                <div className="select-wrapper">
                  <select
                    id="documentType"
                    value={documentForm.documentType}
                    onChange={(e) => setDocumentForm({...documentForm, documentType: e.target.value})}
                    required
                  >
                    <option value="Transcript">📄 Transcript</option>
                    <option value="Diploma">🎓 Diploma</option>
                    <option value="Certificate">🏆 Certificate</option>
                    <option value="Recommendation">📝 Recommendation</option>
                  </select>
                  <svg className="select-arrow" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Document Title *
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Enter the official document title"
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Document Content *
              </label>
              <div className="textarea-wrapper">
                <textarea
                  id="content"
                  value={documentForm.content}
                  onChange={(e) => setDocumentForm({...documentForm, content: e.target.value})}
                  rows="8"
                  placeholder="Enter the detailed content of the document. This will include all relevant academic information, achievements, grades, and official statements."
                  required
                />
                <div className="textarea-counter">
                  {documentForm.content.length} characters
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Issuing Document...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Issue Document
                </>
              )}
            </button>
          </div>
        </form>

        <div className="help-section">
          <div className="help-card">
            <div className="help-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="help-content">
              <h3>Document Guidelines</h3>
              <ul>
                <li>Ensure all information is accurate and verified</li>
                <li>Use official language and formatting</li>
                <li>Include relevant academic details and achievements</li>
                <li>Review content thoroughly before issuing</li>
              </ul>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stats-content">
              <h3>Quick Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{students.length}</span>
                  <span className="stat-label">Available Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4</span>
                  <span className="stat-label">Document Types</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DocumentManagement;