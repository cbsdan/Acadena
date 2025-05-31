import React from 'react';

const DocumentManagement = ({ 
  documentForm, 
  setDocumentForm, 
  handleDocumentSubmit, 
  students, 
  loading 
}) => (
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

export default DocumentManagement;
