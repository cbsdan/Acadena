import React from 'react';
import instiRegisterImage from './assets/images/instiregister.png';
import './assets/styles/style.css';

const InstitutionRegistration = ({ 
  institutionWithAdminForm, 
  setInstitutionWithAdminForm, 
  handleInstitutionWithAdminSubmit, 
  loading, 
  setCurrentView 
}) => (
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
          {/* Institution Details Section */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🏛️</span>
              Institution Details
            </h3>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">Institution Name *</label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={institutionWithAdminForm.name}
                onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, name: e.target.value})}
                required
                placeholder="Enter institution name"
              />
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
                placeholder="Enter accreditation number"
              />
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

          {/* Administrator Details Section */}
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
  </div>
);

export default InstitutionRegistration;