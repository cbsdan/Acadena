import React from 'react';
import './assets/styles/document.css';
import { documentHandlers } from '../utils/documentHandlers';

const DocumentManagement = ({
  documentForm,
  setDocumentForm,
  handleDocumentSubmit,
  students,
  loading
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [displayCount, setDisplayCount] = React.useState(50); // Initially show 50 students
  const [studentDocuments, setStudentDocuments] = React.useState([]);
  const [documentsLoading, setDocumentsLoading] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [selectedContent, setSelectedContent] = React.useState({
    content: []
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const MAX_DISPLAY_LIMIT = 10; // Maximum students to show at once
  const LOAD_MORE_INCREMENT = 3; // How many more to load when scrolling

  // Filter students based on search term
  const allFilteredStudents = students.filter(student => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const firstName = student.firstName?.toLowerCase() || '';
    const lastName = student.lastName?.toLowerCase() || '';
    const studentNumber = student.studentNumber?.toLowerCase() || '';

    return firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      studentNumber.includes(searchLower);
  });

  // Limit displayed students for performance
  const filteredStudents = allFilteredStudents.slice(0,
    searchTerm ? Math.min(allFilteredStudents.length, MAX_DISPLAY_LIMIT) : displayCount
  );

  const hasMoreStudents = allFilteredStudents.length > filteredStudents.length;

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setDocumentForm({ ...documentForm, studentId: student.id });
    setSearchTerm(`${student.firstName} ${student.lastName} (#${student.studentNumber})`);
    setIsDropdownOpen(false);
    fetchStudentDocuments(student.id);
  };

  // Fetch documents for selected student from backend
  const fetchStudentDocuments = async (studentId) => {
    setDocumentsLoading(true);
    try {
      const documents = await documentHandlers.fetchDocumentsByStudent(
        studentId,
        setStudentDocuments,
        setDocumentsLoading
      );
      return documents;
    } catch (error) {
      console.error('Error in fetchStudentDocuments:', error);
      setStudentDocuments([]);
      setDocumentsLoading(false);
      return [];
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    setDisplayCount(50); // Reset display count when searching

    // Clear selection if user is typing
    if (selectedStudent && value !== `${selectedStudent.firstName} ${selectedStudent.lastName} (#${selectedStudent.studentNumber})`) {
      setSelectedStudent(null);
      setDocumentForm({ ...documentForm, studentId: '' });
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (!searchTerm) {
      setDisplayCount(50); // Reset to initial count when opening without search
    }
  };

  // Handle scroll to load more students
  const handleDropdownScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isNearBottom && hasMoreStudents && !searchTerm) {
      setDisplayCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, MAX_DISPLAY_LIMIT));
    }
  };

  // Load more students function
  const loadMoreStudents = () => {
    setDisplayCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, allFilteredStudents.length));
  };

  // Handle clicking outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.searchable-select-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle document view action
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  // Handle document download action
  const handleDownloadDocument = async (document) => {
    try {
      const success = await documentHandlers.downloadDocument(document);

      if (success) {
        // Show success toast
        setToast({
          type: 'success',
          message: `Document "${document.title}" downloaded successfully!`
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setToast({
        type: 'error',
        message: 'Error downloading document. Please try again.'
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  
  // Sample tile data - replace with your actual content options
  const availableTiles = [
    {
      id: 'academic-achievements',
      title: 'Academic Achievements',
      description: 'Honor roll, dean\'s list, academic awards and recognitions',
      content: 'Outstanding academic performance with consistent honor roll recognition and dean\'s list achievements.'
    },
    {
      id: 'grades-transcript',
      title: 'Grades & Transcript',
      description: 'Official grade reports, GPA, and academic transcripts',
      content: 'Complete academic transcript with cumulative GPA and course-by-course breakdown.'
    },
    {
      id: 'extracurricular',
      title: 'Extracurricular Activities',
      description: 'Sports, clubs, organizations, and leadership roles',
      content: 'Active participation in student government, debate team, and community service organizations.'
    },
    {
      id: 'certifications',
      title: 'Certifications & Licenses',
      description: 'Professional certifications, licenses, and specialized training',
      content: 'Industry-recognized certifications and professional development credentials.'
    },
    {
      id: 'research-projects',
      title: 'Research Projects',
      description: 'Academic research, publications, and scholarly work',
      content: 'Independent research projects with published findings and academic presentations.'
    },
    {
      id: 'internships',
      title: 'Internships & Work Experience',
      description: 'Professional experience, internships, and job roles',
      content: 'Relevant work experience and internship programs with key accomplishments.'
    },
    {
      id: 'recommendations',
      title: 'Letters of Recommendation',
      description: 'Faculty and employer recommendations and references',
      content: 'Strong recommendations from professors and supervisors highlighting key strengths.'
    },
    {
      id: 'community-service',
      title: 'Community Service',
      description: 'Volunteer work, community involvement, and social impact',
      content: 'Dedicated community service with measurable impact on local organizations.'
    }
  ];

  const handleTileToggle = (tile) => {
    const isSelected = selectedContent.content.some(item => item.id === tile.id);
    
    if (isSelected) {
      // Remove tile
      setSelectedContent({
        ...selectedContent,
        content: selectedContent.content.filter(item => item.id !== tile.id)
      });
    } else {
      // Add tile
      setSelectedContent({
        ...selectedContent,
        content: [...selectedContent.content, tile]
      });
    }
  };

  const getTotalCharacters = () => {
    return selectedContent.content.reduce((total, item) => total + item.content.length, 0);
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Student Information
              </div>

              <div className="form-group">
                <label htmlFor="studentSearch">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Select Student *
                </label>
                <div className="searchable-select-container">
                  <div className="searchable-select-input-wrapper">
                    <input
                      type="text"
                      id="studentSearch"
                      placeholder="Search and select a student..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={handleInputFocus}
                      className="searchable-select-input"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="searchable-select-toggle"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <div
                      className="searchable-select-dropdown"
                      onScroll={handleDropdownScroll}
                    >
                      {/* Search results count */}
                      {searchTerm && (
                        <div className="search-results-info">
                          Showing {filteredStudents.length} of {allFilteredStudents.length} students
                          {allFilteredStudents.length > MAX_DISPLAY_LIMIT && (
                            <span className="search-hint">
                              {allFilteredStudents.length - MAX_DISPLAY_LIMIT} more available - refine your search
                            </span>
                          )}
                        </div>
                      )}

                      {filteredStudents.length > 0 ? (
                        <>
                          {filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              className={`searchable-select-option ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                              onClick={() => handleStudentSelect(student)}
                            >
                              <div className="student-info">
                                <div className="student-name">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="student-number">
                                  #{student.studentNumber}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Load more button for non-search results */}
                          {hasMoreStudents && !searchTerm && (
                            <div className="load-more-container">
                              <button
                                type="button"
                                className="load-more-btn"
                                onClick={loadMoreStudents}
                              >
                                Load More ({allFilteredStudents.length - filteredStudents.length} remaining)
                              </button>
                            </div>
                          )}

                          {/* Performance warning for large datasets */}
                          {!searchTerm && students.length > 200 && (
                            <div className="performance-tip">
                              💡 Tip: Use search to quickly find specific students
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="searchable-select-no-results">
                          {searchTerm ? (
                            <>
                              No students found matching "<strong>{searchTerm}</strong>"
                              <div className="search-suggestions">
                                Try searching by first name, last name, or student number
                              </div>
                            </>
                          ) : (
                            "No students available"
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    name="studentId"
                    value={documentForm.studentId}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Student Document History Section */}
            {selectedStudent && (
              <div className="student-documents-section">
                <div className="section-header">
                  <div className="section-title">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Document History for {selectedStudent.firstName} {selectedStudent.lastName}
                  </div>
                  <div className="document-stats">
                    <span className="stat-badge">
                      {studentDocuments.length} Documents
                    </span>
                  </div>
                </div>

                <div className="documents-container">
                  {documentsLoading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading documents...</p>
                    </div>
                  ) : studentDocuments.length > 0 ? (
                    <div className="documents-list">
                      {studentDocuments.map((document) => (
                        <div key={document.id} className="document-item">
                          <div className="document-header">
                            <div className="document-info">
                              <h4 className="document-title">{document.title}</h4>
                              <div className="document-meta">
                                <span className="document-type">
                                  {Object.keys(document.documentType)[0] || 'Unknown'}
                                </span>
                                <span className="document-date">
                                  {new Date(Number(document.issueDate) / 1000000).toLocaleDateString()}
                                </span>
                                <span className={`document-status ${document.isVerified ? 'verified' : 'pending'}`}>
                                  {document.isVerified ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            <div className="document-actions">
                              <button
                                className="action-btn view-btn"
                                onClick={() => handleViewDocument(document)}
                                title="View document"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button
                                className="action-btn download-btn"
                                onClick={() => handleDownloadDocument(document)}
                                title="Download document"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="document-details">
                            <div className="detail-row">
                              <span className="detail-label">Document ID:</span>
                              <span className="detail-value">{document.id}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Issued By:</span>
                              <span className="detail-value">{document.issuingInstitutionId}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Digital Signature:</span>
                              <span className="detail-value signature">{document.signature}</span>
                            </div>
                            {document.description && (
                              <div className="detail-row">
                                <span className="detail-label">Description:</span>
                                <span className="detail-value">{document.description}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12h8" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <h3>No Documents Found</h3>
                      <p>This student has no documents issued yet. Create their first document using the form above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="form-section">
              <div className="section-title">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                </svg>
                Available Documents
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="documentType">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Document Type *
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="documentType"
                      value={documentForm.documentType}
                      onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                      required
                    >
                      <option value="Transcript">📄 Transcript</option>
                      <option value="Diploma">🎓 Diploma</option>
                      <option value="Certificate">🏆 Certificate</option>
                      <option value="Recommendation">📝 Recommendation</option>
                    </select>
                    <svg className="select-arrow" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                
              </div>

              <div className="form-group">
                <label htmlFor="content">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Existing Document
                </label>
                  
      

      {/* Scrollable Tiles Container */}
      <div className="border border-[#BAD7E9] rounded-lg p-4" style={{backgroundColor: '#FCFFE7'}}>
        <div className="selected-content-tiles-vertical custom-scrollbar max-h-80 overflow-y-auto pr-2">
          {availableTiles.map((tile) => {
            const isSelected = selectedContent.content.some(item => item.id === tile.id);
            return (
              <div
                key={tile.id}
                onClick={() => handleTileToggle(tile)}
                className={`selected-tile-vertical ${isSelected ? 'selected' : ''}`}
                style={{
                  borderColor: isSelected ? '#EB455F' : '#BAD7E9',
                  backgroundColor: isSelected ? '#BAD7E9' : '#fff',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(235,69,95,0.13)' : '0 2px 8px rgba(43,52,103,0.07)'
                }}
                title={tile.title}
              >
                <div className="selected-tile-title-vertical">{tile.title}</div>
                <button
                  onClick={e => { e.stopPropagation(); handleTileToggle(tile); }}
                  className="selected-tile-remove-vertical"
                  title={isSelected ? 'Remove from selection' : 'Add to selection'}
                  style={{background: isSelected ? '#EB455F' : '#2B3467', color: '#fff'}}
                >
                  {isSelected ? 'Remove' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>



      {/* Hidden input to maintain form compatibility */}
      <input
        type="hidden"
        name="content"
        value={JSON.stringify(selectedContent.content)}
      />
    
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="stats-content">
                <h3>Quick Stats</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{filteredStudents.length}</span>
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

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <svg className="toast-icon" viewBox="0 0 24 24" fill="none">
              {toast.type === 'success' ? (
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" />
              ) : (
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              )}
              {toast.type === 'success' && (
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" />
              )}
              {toast.type === 'error' && (
                <>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
                </>
              )}
            </svg>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {isModalOpen && selectedDocument && (
        <div className="document-modal-overlay" onClick={closeModal}>
          <div className="document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header">
              <h3>Document Details</h3>
              <button className="close-modal" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <div className="document-modal-body">
              <div className="document-modal-info">
                <h4>{selectedDocument.title}</h4>
                <div className="document-modal-meta">
                  <div className="meta-item">
                    <strong>Type:</strong> {Object.keys(selectedDocument.documentType)[0] || 'Unknown'}
                  </div>
                  <div className="meta-item">
                    <strong>Issue Date:</strong> {new Date(Number(selectedDocument.issueDate) / 1000000).toLocaleDateString()}
                  </div>
                  <div className="meta-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${selectedDocument.isVerified ? 'verified' : 'pending'}`}>
                      {selectedDocument.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <strong>Document ID:</strong> {selectedDocument.id}
                  </div>
                  <div className="meta-item">
                    <strong>Issuing Institution:</strong> {selectedDocument.issuingInstitutionId}
                  </div>
                  <div className="meta-item">
                    <strong>Digital Signature:</strong>
                    <span className="signature-text">{selectedDocument.signature}</span>
                  </div>
                </div>
              </div>
              <div className="document-modal-content">
                <h5>Document Content:</h5>
                <div className="document-content-display">
                  {selectedDocument.content || 'No content available'}
                </div>
                {selectedDocument.description && (
                  <div className="document-description">
                    <h5>Description:</h5>
                    <p>{selectedDocument.description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="document-modal-footer">
              <button
                className="btn-primary"
                onClick={() => handleDownloadDocument(selectedDocument)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                </svg>
                Download Document
              </button>
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .document-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .document-modal {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .document-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .document-modal-header h3 {
          margin: 0;
          color: #1f2937;
        }
        .close-modal {
          background: none;
          border: none;
          width: 24px;
          height: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .close-modal:hover {
          color: #374151;
        }
        .document-modal-body {
          padding: 20px;
        }
        .document-modal-info h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 1.2em;
        }
        .document-modal-meta {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .meta-item strong {
          min-width: 140px;
          color: #374151;
        }
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 500;
        }
        .status-badge.verified {
          background: #d1fae5;
          color: #065f46;
        }
        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .signature-text {
          font-family: monospace;
          font-size: 0.9em;
          background: #f9fafb;
          padding: 4px 8px;
          border-radius: 4px;
          word-break: break-all;
        }
        .document-modal-content {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .document-modal-content h5 {
          margin: 0 0 10px 0;
          color: #374151;
        }
        .document-content-display {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          white-space: pre-wrap;
          font-family: 'Georgia', serif;
          line-height: 1.6;
          max-height: 300px;
          overflow-y: auto;
        }
        .document-description {
          margin-top: 15px;
        }
        .document-description p {
          background: #f3f4f6;
          padding: 10px;
          border-radius: 6px;
          margin: 5px 0 0 0;
        }
        .document-modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn-primary, .btn-secondary {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-primary svg, .btn-secondary svg {
          width: 16px;
          height: 16px;
        }

          .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #BAD7E9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #EB455F;
          border-radius: 4px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #EB455F #BAD7E9;
        }
        .selected-content-tiles-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          min-height: 56px;
          width: 100%;
        }
        .selected-tile-vertical {
          background: #fff;
          border: 2px solid #2B3467;
          border-radius: 10px;
          padding: 14px 24px 12px 24px;
          min-width: 220px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 2px 8px rgba(43,52,103,0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0;
          transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
        }
        .selected-tile-vertical.selected {
          border-color: #EB455F;
          background: #BAD7E9;
          box-shadow: 0 4px 16px rgba(235,69,95,0.13);
        }
        .selected-tile-vertical:hover {
          box-shadow: 0 4px 16px rgba(235,69,95,0.13);
          border-color: #EB455F;
        }
        .selected-tile-title-vertical {
          color: #2B3467;
          font-weight: 600;
          font-size: 1.08em;
          flex: 1;
          text-align: center;
          word-break: break-word;
        }
        .selected-tile-remove-vertical {
          background: #EB455F;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 4px 14px;
          font-size: 0.95em;
          cursor: pointer;
          margin-left: 16px;
          transition: background 0.15s;
        }
        .selected-tile-remove-vertical:hover {
          background: #d12b4a;
        }
      `}</style>
    </div>
  );
};


export default DocumentManagement;