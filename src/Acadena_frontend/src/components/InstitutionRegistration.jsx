import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/Acadena_backend';
import instiRegisterImage from './assets/images/instiregister.png';
import './assets/styles/institutionregister.css';

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
      accreditationNumber: `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    }));
  };

  const filteredInstitutions = availableInstitutions.filter(inst => {
    const isAlreadyRegistered = registeredInstitutions.some(regInst => 
      regInst.name.toLowerCase().trim() === inst.name.toLowerCase().trim()
    );

    const matchesSearch = inst.name.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
      inst.province.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
      inst.region.toLowerCase().includes(institutionSearchTerm.toLowerCase());

    return matchesSearch && !isAlreadyRegistered;
  });

  return (
    <div className="modern-registration-container">
      {/* Left Panel - Brand Section */}
      <div className="brand-panel">
        <div className="brand-content">
          <div className="brand-header">
          </div>

          <div className="hero-image-container">
            <img 
              src={instiRegisterImage} 
              alt="Institution Registration" 
              className="hero-image"
            />
            <div className="image-overlay"></div>
          </div>

          <div className="feature-highlights">
            <div className="highlight-item">
              <div className="highlight-badge">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <span className="highlight-text">Secure & Immutable</span>
            </div>
            <div className="highlight-item">
              <div className="highlight-badge">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                </svg>
              </div>
              <span className="highlight-text">Instant Verification</span>
            </div>
            <div className="highlight-item">
              <div className="highlight-badge">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                </svg>
              </div>
              <span className="highlight-text">Blockchain Stored</span>
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon secure">🔐</div>
              <div className="feature-text">
                <h4>Secure Storage</h4>
                <p>Blockchain-secured records</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon fast">⚡</div>
              <div className="feature-text">
                <h4>Instant Verification</h4>
                <p>Real-time authentication</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon global">🌐</div>
              <div className="feature-text">
                <h4>Global Access</h4>
                <p>Worldwide recognition</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-wrapper">
          <div className="form-header-modern">
            <h2 className="form-title-modern">Register Your Institution</h2>
            <p className="form-subtitle-modern">Join other institutions using blockchain verification</p>
          </div>

          <form onSubmit={handleInstitutionWithAdminSubmit} className="modern-form">
            <div className="form-card">
              <div className="card-header">
                <div className="card-icon institution">🏛️</div>
                <div className="card-title-group">
                  <h3 className="card-title">Institution Information</h3>
                  <p className="card-subtitle">Basic details about your institution</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group full-width">
                  <label className="modern-label">Institution Name *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="modern-input"
                      value={institutionWithAdminForm.name}
                      onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, name: e.target.value})}
                      required
                      placeholder={isManualInput ? "Enter institution name" : "Select from existing institutions"}
                      readOnly={!isManualInput}
                    />
                    <button
                      type="button"
                      className="select-btn"
                      onClick={openInstitutionModal}
                      title="Select from existing institutions"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Browse
                    </button>
                  </div>
                  <span className="input-helper">Choose from CHED registered institutions or enter manually</span>
                </div>

                <div className="input-group">
                  <label className="modern-label">Institution Type *</label>
                  <select
                    className="modern-select"
                    value={institutionWithAdminForm.institutionType}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, institutionType: e.target.value})}
                    required
                  >
                    <option value="">Choose type</option>
                    <option value="University">University</option>
                    <option value="College">College</option>
                    <option value="HighSchool">High School</option>
                    <option value="ElementarySchool">Elementary School</option>
                    <option value="TechnicalSchool">Technical School</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="modern-label">Contact Email *</label>
                  <input
                    type="email"
                    className="modern-input"
                    value={institutionWithAdminForm.contactEmail}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactEmail: e.target.value})}
                    required
                    placeholder="contact@institution.edu"
                  />
                </div>

                <div className="input-group">
                  <label className="modern-label">Contact Phone *</label>
                  <input
                    type="tel"
                    className="modern-input"
                    value={institutionWithAdminForm.contactPhone}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactPhone: e.target.value})}
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="input-group full-width">
                  <label className="modern-label">Address *</label>
                  <textarea
                    className="modern-textarea"
                    value={institutionWithAdminForm.address}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, address: e.target.value})}
                    required
                    placeholder="Complete institutional address"
                    rows="3"
                  />
                </div>

                <div className="input-group">
                  <label className="modern-label">Website</label>
                  <input
                    type="url"
                    className="modern-input"
                    value={institutionWithAdminForm.website}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, website: e.target.value})}
                    placeholder="https://www.institution.edu"
                  />
                </div>

                <div className="input-group">
                  <label className="modern-label">Accreditation Number *</label>
                  <input
                    type="text"
                    className="modern-input readonly"
                    value={institutionWithAdminForm.accreditationNumber}
                    readOnly
                    placeholder="Auto-generated"
                  />
                  <span className="input-helper">Automatically generated unique identifier</span>
                </div>

                <div className="input-group full-width">
                  <label className="modern-label">Description</label>
                  <textarea
                    className="modern-textarea"
                    value={institutionWithAdminForm.description}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, description: e.target.value})}
                    placeholder="Brief description of your institution"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="card-header">
                <div className="card-icon admin">👤</div>
                <div className="card-title-group">
                  <h3 className="card-title">Administrator Account</h3>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group full-width">
                  <label className="modern-label">Administrator Email *</label>
                  <input
                    type="email"
                    className="modern-input"
                    value={institutionWithAdminForm.adminEmail}
                    onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminEmail: e.target.value})}
                    required
                    placeholder="admin@institution.edu"
                  />
                  <span className="input-helper">This will be used to access the admin dashboard</span>
                </div>
              </div>
            </div>

            <div className="form-actions-modern">
              <button 
                type="button" 
                onClick={() => setCurrentView('login')} 
                className="btn-secondary"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
                </svg>
                Back to Login
              </button>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                    </svg>
                    Create Institution
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showInstitutionModal && (
        <div className="modal-backdrop" onClick={closeInstitutionModal}>
          <div className="modern-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h3 className="modal-title-modern">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.75 2.524z"/>
                </svg>
                Select Institution
              </h3>
              <button className="modal-close-btn" onClick={closeInstitutionModal}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </div>

            <div className="modal-search-section">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search institutions by name, city, or province..."
                  value={institutionSearchTerm}
                  onChange={(e) => setInstitutionSearchTerm(e.target.value)}
                  className="search-input-modern"
                />
              </div>
              <div className="search-results-info">
                {filteredInstitutions.length} institutions available
              </div>
            </div>

            <div className="modal-content-modern">
              {loadingInstitutions ? (
                <div className="loading-state">
                  <div className="loading-spinner large"></div>
                  <p>Loading institutions...</p>
                </div>
              ) : (
                <div className="institutions-grid">
                  <div className="institution-card manual-card" onClick={handleManualInput}>
                    <div className="institution-icon manual">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                      </svg>
                    </div>
                    <div className="institution-info">
                      <h4 className="institution-name">Manual Entry</h4>
                      <p className="institution-location">Enter details manually</p>
                    </div>
                    <div className="select-arrow">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                      </svg>
                    </div>
                  </div>

                  {filteredInstitutions.length === 0 && institutionSearchTerm ? (
                    <div className="no-results">
                      <div className="no-results-icon">🔍</div>
                      <h4>No institutions found</h4>
                      <p>Try adjusting your search or use manual entry</p>
                    </div>
                  ) : (
                    filteredInstitutions.map((inst, idx) => (
                      <div 
                        key={idx} 
                        className="institution-card"
                        onClick={() => handleInstitutionSelect(inst)}
                      >
                        <div className="institution-icon">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                          </svg>
                        </div>
                        <div className="institution-info">
                          <h4 className="institution-name">{inst.name}</h4>
                          <p className="institution-location">
                            {inst.city}, {inst.province}
                          </p>
                          <div className="institution-details">
                            {inst.contact && <span>📞 {inst.contact}</span>}
                            {inst.website && <span>🌐 {inst.website}</span>}
                          </div>
                        </div>
                        <div className="select-arrow">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
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