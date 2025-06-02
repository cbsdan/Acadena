import React, { useEffect } from "react";

const DocumentPerInstitution  = ({
  institutionId,
  documents,
  setDocuments,
  loading,
  setLoading,
  loadDocumentsByInstitution // <-- Accept as prop
}) => {
  useEffect(() => {
      console.log("institutionId:", institutionId);
  console.log("documents:", documents);
    if (institutionId) {
      loadDocumentsByInstitution(institutionId);
    }
  }, [institutionId, loadDocumentsByInstitution]);

return (
  <div className="my-documents">
    <h2>Institution Documents</h2>

    {loading ? (
      <div className="loading">Loading documents...</div>
    ) : Array.isArray(documents) && documents.length === 0 ? (
      <p>No documents found for this institution.</p>
    ) : Array.isArray(documents) ? (
      <div className="documents-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-card">
            <h4>{doc.title}</h4>
            <p>
              <strong>Type:</strong> {Object.keys(doc.documentType)[0]}
            </p>
            <p>
              <strong>Issued To (Student ID):</strong> {doc.studentId}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(Number(doc.issueDate) / 1000000).toLocaleDateString()}
            </p>
            <p>
              <strong>Token ID:</strong> {doc.id}
            </p>
            <p>
              <strong>Verified:</strong> {doc.isVerified ? "Yes" : "No"}
            </p>
            {doc.fileName && (
              <div>
                <strong>File:</strong> {doc.fileName}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div style={{color: 'red'}}>documents is not an array</div>
    )}
  </div>
);
};

export default DocumentPerInstitution;