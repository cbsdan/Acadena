import React from 'react';
import './assets/styles/uploaddocument.css';

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
    <div className="app-container">
      <div className="upload-page">
        {/* Header Section */}
        <header className="page-header">
          <h1>Upload Document</h1>
          <p>Upload and assign documents to students securely</p>
        </header>

        {/* Main Content */}
        <div className="main-content">
          {/* Form Container */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {/* Student Selection Card */}
              <div className="form-card">
                <div className="card-header">
                  <i className="icon-user"></i>
                  <h2>Student Selection</h2>
                </div>
                <div className="card-body">
                  <div className="select-container">
                    <select
                      value={uploadForm.studentId}
                      onChange={(e) => setUploadForm({ ...uploadForm, studentId: e.target.value })}
                      required
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - #{student.studentNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Details Card */}
              <div className="form-card">
                <div className="card-header">
                  <i className="icon-file"></i>
                  <h2>Document Details</h2>
                </div>
                <div className="card-body">
                  <div className="input-group">
                    <div className="select-container">
                      <select
                        value={uploadForm.documentType}
                        onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                        required
                      >
                        <option value="Transcript">📄 Transcript</option>
                        <option value="Diploma">🎓 Diploma</option>
                        <option value="Certificate">🏆 Certificate</option>
                        <option value="Recommendation">📝 Recommendation</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter document title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Card */}
              <div className="form-card">
                <div className="card-header">
                  <i className="icon-upload"></i>
                  <h2>File Upload</h2>
                </div>
                <div className="card-body">
                  <div className="upload-zone">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                      required
                    />
                    {!uploadForm.file ? (
                      <div className="upload-placeholder">
                        <i className="icon-cloud-upload"></i>
                        <p>Drag and drop your file here or click to browse</p>
                        <span>Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)</span>
                      </div>
                    ) : (
                      <div className="file-preview">
                        <i className="icon-document"></i>
                        <div className="file-info">
                          <p>{uploadForm.file.name}</p>
                          <span>{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadForm({ ...uploadForm, file: null })}
                          className="remove-file"
                        >
                          <i className="icon-close"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="icon-upload"></i>
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            {/* Guidelines Card */}
            <div className="info-card">
              <div className="info-header">
                <i className="icon-info"></i>
                <h3>Upload Guidelines</h3>
              </div>
              <ul className="guideline-list">
                <li>Ensure files are clear and legible</li>
                <li>Use PDF format for best compatibility</li>
                <li>Maximum file size is 10MB</li>
                <li>Verify student information before uploading</li>
              </ul>
            </div>

            {/* Formats Card */}
            <div className="info-card">
              <div className="info-header">
                <i className="icon-file-type"></i>
                <h3>Supported Formats</h3>
              </div>
              <div className="format-grid">
                <div className="format-item">
                  <i className="icon-pdf"></i>
                  <span>PDF Documents</span>
                </div>
                <div className="format-item">
                  <i className="icon-word"></i>
                  <span>Word Files</span>
                </div>
                <div className="format-item">
                  <i className="icon-image"></i>
                  <span>Image Files</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <i className="icon-success"></i>
              <h3>Upload Successful!</h3>
              <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })}>
                <i className="icon-close"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-info">
                <div className="info-row">
                  <strong>Document Type:</strong>
                  <span>{successModal.documentType}</span>
                </div>
                <div className="info-row">
                  <strong>Title:</strong>
                  <span>{successModal.title}</span>
                </div>
                <div className="info-row">
                  <strong>Student:</strong>
                  <span>{successModal.student}</span>
                </div>
              </div>
              <div className="token-section">
                <strong>Verification Token</strong>
                <code>{successModal.token}</code>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSuccessModal({ ...successModal, isOpen: false })}>
                <i className="icon-check"></i>
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;