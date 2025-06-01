import React from 'react';

const DocumentUpload = ({
  uploadForm,
  setUploadForm,
  handleDocumentUpload,
  students,
  loading
}) => (
  <div className="registration-form">
    <h2>Upload New Document</h2>
    <form onSubmit={handleDocumentUpload}>
      <div className="form-group">
        <label htmlFor="studentId">Student *</label>
        <select
          id="studentId"
          value={uploadForm.studentId}
          onChange={(e) => setUploadForm({ ...uploadForm, studentId: e.target.value })}
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
          value={uploadForm.documentType}
          onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
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
          value={uploadForm.title}
          onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="file">Upload File *</label>
        <input
          type="file"
          id="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
          required
        />
        {uploadForm.file && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.95em', color: '#2b3467' }}>
            Selected: {uploadForm.file.name}
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Uploading Document...' : 'Upload Document'}
      </button>
    </form>
  </div>
);

export default DocumentUpload;