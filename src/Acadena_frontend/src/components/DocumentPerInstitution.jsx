import React, { useEffect, useState } from "react";
import './assets/styles/managedocument.css';

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
    <div className="manage-documents-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Document Management</h1>
            <p className="page-subtitle">View and manage all documents issued by your institution</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon documents">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-number">{filteredDocuments.length}</span>
                <span className="stat-label">Total Documents</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon verified">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-number">
                  {filteredDocuments.filter(doc => doc.isVerified).length}
                </span>
                <span className="stat-label">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      ) : (
        <div className="content-wrapper">
          {/* Search and Filter Controls */}
          <div className="controls-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search documents by title or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Document Type</label>
                <div className="select-wrapper">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </div>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <div className="select-wrapper">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="issueDate">Issue Date</option>
                    <option value="title">Title</option>
                  </select>
                  <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Content */}
          <div className="documents-section">
            {!Array.isArray(documents) ? (
              <div className="error-state">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3>Data Error</h3>
                <p>Documents data is not in the expected format. Please try refreshing the page.</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3>No Documents Found</h3>
                <p>
                  {searchTerm || filterType !== 'All' 
                    ? "No documents match your current search criteria. Try adjusting your filters."
                    : "No documents have been issued by this institution yet."
                  }
                </p>
              </div>
            ) : (
              <div className="documents-grid">
                {filteredDocuments.map((doc) => {
                  const docType = getDocumentTypeDisplay(doc.documentType);
                  return (
                    <div key={doc.id} className="document-card">
                      <div className="card-header">
                        <div className="document-type">
                          <span className="type-icon">{docType.icon}</span>
                          <span className="type-name">{docType.key}</span>
                        </div>
                        <div className="card-badges">
                          <div className={`verification-badge ${doc.isVerified ? 'verified' : 'pending'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {doc.isVerified ? (
                                <>
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22,4 12,14.01 9,11.01"/>
                                </>
                              ) : (
                                <circle cx="12" cy="12" r="10"/>
                              )}
                            </svg>
                            <span>{doc.isVerified ? 'Verified' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-body">
                        <h3 className="document-title">{doc.title}</h3>
                        
                        <div className="document-info">
                          <div className="info-row">
                            <div className="info-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                              <div className="info-content">
                                <span className="info-label">Student ID</span>
                                <span className="info-value">{doc.studentId}</span>
                              </div>
                            </div>
                            <div className="info-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              <div className="info-content">
                                <span className="info-label">Issue Date</span>
                                <span className="info-value">
                                  {new Date(Number(doc.issueDate) / 1000000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="info-row">
                            <div className="info-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                              </svg>
                              <div className="info-content">
                                <span className="info-label">Token ID</span>
                                <span className="info-value token-id">{doc.id}</span>
                              </div>
                            </div>
                            {doc.fileName && (
                              <div className="info-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14,2 14,8 20,8"/>
                                </svg>
                                <div className="info-content">
                                  <span className="info-label">File</span>
                                  <span className="info-value">{doc.fileName}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className={`status-indicator ${doc.status?.toLowerCase() || 'unknown'}`}>
                          <span>{doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPerInstitution;