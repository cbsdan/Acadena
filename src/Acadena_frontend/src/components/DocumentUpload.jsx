import React from 'react';
import './assets/styles/document.css';

const DocumentUpload = ({
  uploadForm,
  setUploadForm,
  handleDocumentUpload,
  students,
  loading
}) => {
  const [successModal, setSuccessModal] = React.useState({
    isOpen: false,
    document: null,
    token: '',
    student: '',
    documentType: '',
    title: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === uploadForm.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    
    try {
      const result = await handleDocumentUpload(e);
      if (result?.document && result?.token) {
        setSuccessModal({
          isOpen: true,
          document: result.document,
          token: result.token,
          student: studentName,
          documentType: uploadForm.documentType,
          title: uploadForm.title
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div className="header-content">
          <h1>Upload Document</h1>
          <p>Upload and assign existing documents to students</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-dot"></div>
          <div className="decoration-dot"></div>
          <div className="decoration-dot"></div>
        </div>
      </div>

      <div className="upload-container">
        <form onSubmit={handleSubmit} className="document-form upload-form">
          <div className="form-section">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Student Selection
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
                  value={uploadForm.studentId}
                  onChange={(e) => setUploadForm({ ...uploadForm, studentId: e.target.value })}
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
              Document Information
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
                    value={uploadForm.documentType}
                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
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
                  placeholder="Enter the document title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              File Upload
            </div>

            <div className="form-group">
              <label htmlFor="file">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Upload Document File *
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  required
                  className="file-input"
                />
                <div className="file-upload-area">
                  <div className="file-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="file-upload-text">
                    <p>
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p>PDF, DOC, DOCX, JPG, JPEG, PNG (max. 10MB)</p>
                  </div>
                </div>
                {uploadForm.file && (
                  <div className="file-selected">
                    <div className="file-info">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span className="file-name">{uploadForm.file.name}</span>
                      <span className="file-size">
                        ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => setUploadForm({ ...uploadForm, file: null })}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Uploading Document...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>

      <SuccessModal 
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        document={successModal.document}
        token={successModal.token}
        student={successModal.student}
        documentType={successModal.documentType}
        title={successModal.title}
      />
        <div className="upload-help-section">
          <div className="help-card">
            <div className="help-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="help-content">
              <h3>Upload Guidelines</h3>
              <ul>
                <li>Ensure files are clear and legible</li>
                <li>Use PDF format for best quality</li>
                <li>Maximum file size is 10MB</li>
                <li>Verify student information before uploading</li>
              </ul>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4m0-11V9a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 0V9a2 2 0 0 0-2-2h-2m0 0V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2m8 0V5a2 2 0 0 0-2-2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stats-content">
              <h3>Supported Formats</h3>
              <div className="format-grid">
                <div className="format-item">
                  <span className="format-icon">📄</span>
                  <span>PDF</span>
                </div>
                <div className="format-item">
                  <span className="format-icon">📝</span>
                  <span>DOC/DOCX</span>
                </div>
                <div className="format-item">
                  <span className="format-icon">🖼️</span>
                  <span>JPG/PNG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

const SuccessModal = ({ isOpen, onClose, document, token, student, documentType, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="document-modal-header">
          <h3>Document Uploaded Successfully!</h3>
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
              <strong>Document Type:</strong> {documentType}
            </div>
            <div className="detail-item">
              <strong>Title:</strong> {title}
            </div>
            <div className="detail-item">
              <strong>Student:</strong> {student}
            </div>
            <div className="token-info">
              <strong>Verification Token:</strong>
              <code>{token}</code>
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

export default DocumentUpload;