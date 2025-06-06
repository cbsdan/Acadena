import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/Acadena_backend';
import instiRegisterImage from './assets/images/instiregister.png';
import './assets/styles/style.css';

const agent = new HttpAgent({ host: "http://localhost:4943" });
if (process.env.DFX_NETWORK !== "ic") {
  agent.fetchRootKey();
}
const backend = Actor.createActor(idlFactory, { agent, canisterId });

const InstitutionRegistration = ({ 
  institutionWithAdminForm, 
  setInstitutionWithAdminForm, 
  handleInstitutionWithAdminSubmit, 
  loading, 
  setCurrentView 
}) => {
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [availableInstitutions, setAvailableInstitutions] = useState([]);
  const [registeredInstitutions, setRegisteredInstitutions] = useState([]);
  const [institutionSearchTerm, setInstitutionSearchTerm] = useState('');
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);


  useEffect(() => {
    loadAvailableInstitutions();
    loadRegisteredInstitutions();
  }, []);

  const loadAvailableInstitutions = async () => {
    try {
      setLoadingInstitutions(true);
      const institutions = await backend.getCHEDInstitutions();
      setAvailableInstitutions(institutions);
    } catch (error) {
      console.error('Error loading institutions:', error);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const loadRegisteredInstitutions = async () => {
    try {
      const registered = await backend.getAllInstitutions();
      setRegisteredInstitutions(registered);
    } catch (error) {
      console.error('Error loading registered institutions:', error);
    }
  };

  const handleInstitutionSelect = (institution) => {
    const institutionIndex = availableInstitutions.findIndex(inst => inst.name === institution.name);
    

    setInstitutionWithAdminForm(prev => ({
      ...prev,
      name: institution.name,
      address: `${institution.city}, ${institution.province}, ${institution.region}`,
      website: institution.website,
      contactPhone: institution.contact,
      contactEmail: prev.contactEmail, 

      accreditationNumber: `CHED_${String(institutionIndex).padStart(4, '0')}_${Date.now()}`
    }));
    
    setShowInstitutionModal(false);
    setInstitutionSearchTerm('');
    setIsManualInput(false);
  };

  const openInstitutionModal = () => {
    setShowInstitutionModal(true);
  };

  const closeInstitutionModal = () => {
    setShowInstitutionModal(false);
    setInstitutionSearchTerm('');
  };

  const handleManualInput = () => {
    setIsManualInput(true);
    setShowInstitutionModal(false);
 
    setInstitutionWithAdminForm(prev => ({
      ...prev,
      name: '',
      address: '',
      website: '',
      contactPhone: '',
      // Auto-generate accreditation number for manual input too
      accreditationNumber: `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    }));
  };


  const filteredInstitutions = availableInstitutions.filter(inst => {

    const isAlreadyRegistered = registeredInstitutions.some(regInst => 
      regInst.name.toLowerCase().trim() === inst.name.toLowerCase().trim()
    );

    // Filter by search term
    const matchesSearch = inst.name.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
      inst.province.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
      inst.region.toLowerCase().includes(institutionSearchTerm.toLowerCase());


    return matchesSearch && !isAlreadyRegistered;
  });

  return (
    <div className="registration-page">
      <div className="registration-left">
        <div className="registration-left-content">
          <div className="registration-image-container">
            <img 
              src={instiRegisterImage} 
              alt="Institution Registration" 
              className="registration-image"
            />
            <div className="image-glow-effect"></div>
          </div>
          
          <div className="registration-message">
            <h2 className="message-title">Join Acadena Today</h2>
            <p className="message-text">
              Register your institution and bring academic records into the future with secure, 
              transparent, and blockchain-powered verification.
            </p>
            
            <div className="feature-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">🔒</div>
                <span>Secure & Immutable</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">⚡</div>
                <span>Instant Verification</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">🔗</div>
                <span>Blockchain Stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="registration-right">
        <div className="registration-form-container">
          <div className="form-header">
            <h1 className="form-title">Register Institution</h1>
            <p className="form-subtitle">Create your institution profile and admin account</p>
          </div>

          <form onSubmit={handleInstitutionWithAdminSubmit} className="registration-form">
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">🏛️</span>
                Institution Details
              </h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">Institution Name *</label>
                <div className="name-input-group">
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    value={institutionWithAdminForm.name}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, name: e.target.value})}
                    required
                    placeholder={isManualInput ? "Enter institution name" : "Click 'Select Institution' to choose from existing institutions"}
                    readOnly={!isManualInput}
                  />
                  <button
                    type="button"
                    className="select-institution-btn"
                    onClick={openInstitutionModal}
                    title="Select from existing institutions"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Select Institution
                  </button>
                </div>
                <small className="field-help">Select from existing CHED institutions or choose manual input</small>
              </div>

              <div className="form-group">
                <label htmlFor="institutionType" className="form-label">Institution Type *</label>
                <select
                  id="institutionType"
                  className="form-select"
                  value={institutionWithAdminForm.institutionType}
                  onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, institutionType: e.target.value})}
                  required
                >
                  <option value="">Select institution type</option>
                  <option value="University">University</option>
                  <option value="College">College</option>
                  <option value="HighSchool">High School</option>
                  <option value="ElementarySchool">Elementary School</option>
                  <option value="TechnicalSchool">Technical School</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">Address *</label>
                <textarea
                  id="address"
                  className="form-textarea"
                  value={institutionWithAdminForm.address}
                  onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, address: e.target.value})}
                  required
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactEmail" className="form-label">Contact Email *</label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="form-input"
                    value={institutionWithAdminForm.contactEmail}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactEmail: e.target.value})}
                    required
                    placeholder="contact@institution.edu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone" className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    className="form-input"
                    value={institutionWithAdminForm.contactPhone}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactPhone: e.target.value})}
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="accreditationNumber" className="form-label">Accreditation Number *</label>
                <input
                  type="text"
                  id="accreditationNumber"
                  className="form-input"
                  value={institutionWithAdminForm.accreditationNumber}
                  onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, accreditationNumber: e.target.value})}
                  required
                  placeholder="Auto-generated accreditation number"
                  readOnly={true} 
                />
                <small className="field-help">
                  Auto-generated unique accreditation number
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="website" className="form-label">Website</label>
                  <input
                    type="url"
                    id="website"
                    className="form-input"
                    value={institutionWithAdminForm.website}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, website: e.target.value})}
                    placeholder="https://www.institution.edu"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    value={institutionWithAdminForm.description}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, description: e.target.value})}
                    placeholder="Brief description of your institution"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">👤</span>
                Administrator Details
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adminFirstName" className="form-label">Admin First Name *</label>
                  <input
                    type="text"
                    id="adminFirstName"
                    className="form-input"
                    value={institutionWithAdminForm.adminFirstName}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminFirstName: e.target.value})}
                    required
                    placeholder="First name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminLastName" className="form-label">Admin Last Name *</label>
                  <input
                    type="text"
                    id="adminLastName"
                    className="form-input"
                    value={institutionWithAdminForm.adminLastName}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminLastName: e.target.value})}
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="adminEmail" className="form-label">Admin Email *</label>
                <input
                  type="email"
                  id="adminEmail"
                  className="form-input"
                  value={institutionWithAdminForm.adminEmail}
                  onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminEmail: e.target.value})}
                  required
                  placeholder="admin@institution.edu"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="primary-button submit-btn">
                <span className="button-content">
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Creating Institution...
                    </>
                  ) : (
                    <>
                      <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Create Institution & Admin
                    </>
                  )}
                </span>
                <div className="button-shine"></div>
              </button>
              
              <button type="button" onClick={() => setCurrentView('login')} className="secondary-button back-btn">
                <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
      {showInstitutionModal && (
        <div className="modal-overlay" onClick={closeInstitutionModal}>
          <div className="institution-modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                  <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                  <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Select Institution
              </h3>
              <button className="modal-close" onClick={closeInstitutionModal}>
                <svg viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="modal-search">
              <div className="search-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={institutionSearchTerm}
                  onChange={(e) => setInstitutionSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-results-count">
                {filteredInstitutions.length} available institutions 
                {registeredInstitutions.length > 0 && 
                  ` (${availableInstitutions.length - filteredInstitutions.length} already registered)`
                }
              </div>
            </div>

            <div className="modal-body">
              {loadingInstitutions ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Loading institutions...</div>
                </div>
              ) : (
                <div className="institutions-list">
                  {/* Manual Input Option */}
                  <div 
                    className="institution-row manual-input-row"
                    onClick={handleManualInput}
                  >
                    <div className="institution-row-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="institution-row-content">
                      <div className="institution-row-name">Manual Input</div>
                      <div className="institution-row-location">
                        <svg className="location-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Enter institution details manually
                      </div>
                    </div>
                    <div className="institution-row-arrow">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>

                  {/* Show message if no institutions available */}
                  {filteredInstitutions.length === 0 && institutionSearchTerm && (
                    <div className="no-results-container" style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No institutions found</div>
                      <div style={{ fontSize: '0.9rem' }}>
                        Try adjusting your search or use manual input to add a new institution.
                      </div>
                    </div>
                  )}
                  {filteredInstitutions.map((inst, idx) => (
                    <div 
                      key={idx} 
                      className="institution-row"
                      onClick={() => handleInstitutionSelect(inst)}
                    >
                      <div className="institution-row-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                          <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                          <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="institution-row-content">
                        <div className="institution-row-name">{inst.name}</div>
                        <div className="institution-row-location">
                          <svg className="location-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {inst.city}, {inst.province}, {inst.region}
                        </div>
                        <div className="institution-row-details">
                          <span className="detail-item">📞 {inst.contact}</span>
                          <span className="detail-item">🌐 {inst.website}</span>
                        </div>
                      </div>
                      <div className="institution-row-arrow">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionRegistration;