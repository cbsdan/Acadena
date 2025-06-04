import React, { useEffect, useState } from "react";
import './assets/styles/document.css';

const DocumentPerInstitution = ({
  institutionId,
  documents,
  setDocuments,
  loading,
  setLoading,
  loadDocumentsByInstitution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('issueDate');

  useEffect(() => {
    console.log("institutionId:", institutionId);
    console.log("documents:", documents);
    if (institutionId) {
      loadDocumentsByInstitution(institutionId);
    }
  }, [institutionId, loadDocumentsByInstitution]);

  const getDocumentTypeDisplay = (docType) => {
    const typeKey = Object.keys(docType)[0];
    const typeIcons = {
      'Transcript': '📄',
      'Diploma': '🎓',
      'Certificate': '🏆',
      'Recommendation': '📝'
    };
    return {
      key: typeKey,
      icon: typeIcons[typeKey] || '📄'
    };
  };

  const filteredDocuments = Array.isArray(documents) ? documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.studentId.toString().includes(searchTerm);
    const matchesType = filterType === 'All' || Object.keys(doc.documentType)[0] === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'issueDate') {
      return new Date(Number(b.issueDate) / 1000000) - new Date(Number(a.issueDate) / 1000000);
    }
    return a.title.localeCompare(b.title);
  }) : [];

  const documentTypes = Array.isArray(documents) ? 
    [...new Set(documents.map(doc => Object.keys(doc.documentType)[0]))] : [];

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
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2"/>
              <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="header-content">
            <h1>Institution Documents</h1>
            <p>View and manage all documents issued by your institution</p>
          </div>
          <div className="header-decoration">
            <div className="decoration-dot"></div>
            <div className="decoration-dot"></div>
            <div className="decoration-dot"></div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Loading documents...</p>
          </div>
        ) : (
          <div className="documents-container">
            {/* Controls Section */}
            <div className="documents-controls">
              <div className="search-filter-section">
                <div className="search-wrapper">
                  <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search documents by title or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filter-controls">
                  <div className="filter-group">
                    <label htmlFor="typeFilter">
                      <svg viewBox="0 0 24 24" fill="none">
                        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Filter by Type
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="typeFilter"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        {documentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <svg className="select-arrow" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="sortBy">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M7 12h10m-7 6h4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Sort by
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="issueDate">Issue Date</option>
                        <option value="title">Title</option>
                      </select>
                      <svg className="select-arrow" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="documents-stats">
                <div className="stat-badge">
                  <span className="stat-number">{filteredDocuments.length}</span>
                  <span className="stat-label">Documents Found</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-number">
                    {filteredDocuments.filter(doc => doc.isVerified).length}
                  </span>
                  <span className="stat-label">Verified</span>
                </div>
              </div>
            </div>

            {/* Documents List */}
            {!Array.isArray(documents) ? (
              <div className="error-container">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>Data Error</h3>
                <p>Documents data is not in the expected format</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>No Documents Found</h3>
                <p>No documents match your current search criteria</p>
              </div>
            ) : (
              <div className="documents-grid">
                {filteredDocuments.map((doc) => {
                  const docType = getDocumentTypeDisplay(doc.documentType);
                  return (
                    <div key={doc.id} className="document-card-modern">
                      <div className="document-card-header">
                        <div className="document-type-badge">
                          <span className="type-icon">{docType.icon}</span>
                          <span className="type-text">{docType.key}</span>
                        </div>
                        <div className={`verification-badge ${doc.isVerified ? 'verified' : 'unverified'}`}>
                          <svg viewBox="0 0 24 24" fill="none">
                            {doc.isVerified ? (
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                            ) : (
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            )}
                            {doc.isVerified && (
                              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2"/>
                            )}
                          </svg>
                          <span>{doc.isVerified ? 'Verified' : 'Pending'}</span>
                        </div>
                          <div className={`status-badge status-${doc.status?.toLowerCase() || 'unknown'}`}>
                          <span>{doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Unknown'}</span>
                        </div>
                      </div>

                      <div className="document-card-body">
                        <h4 className="document-title">{doc.title}</h4>
                        
                        <div className="document-details">
                          <div className="detail-item">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <div>
                              <span className="detail-label">Student ID</span>
                              <span className="detail-value">{doc.studentId}</span>
                            </div>
                          </div>

                          <div className="detail-item">
                            <svg viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <div>
                              <span className="detail-label">Issue Date</span>
                              <span className="detail-value">
                                {new Date(Number(doc.issueDate) / 1000000).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="detail-item">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M10.68 13.31a4 4 0 0 0 5.63-.02l.01-.01A4 4 0 0 0 9.68 6.7l-7.95 7.95a4 4 0 0 0 5.63 5.63l7.95-7.95a4 4 0 0 0 .01-5.62v-.01" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <div>
                              <span className="detail-label">Token ID</span>
                              <span className="detail-value token-id">{doc.id}</span>
                            </div>
                          </div>

                          {doc.fileName && (
                            <div className="detail-item">
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <div>
                                <span className="detail-label">File</span>
                                <span className="detail-value">{doc.fileName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPerInstitution;