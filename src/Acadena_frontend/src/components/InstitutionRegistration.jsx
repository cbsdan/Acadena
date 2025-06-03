import React, { useState, useCallback } from 'react';
import { institutionHandlers } from '../utils/institutionHandlers';
import InternetIdentityCreation from './InternetIdentityCreation';
import instiRegisterImage from './assets/images/instiregister.png';
import './assets/styles/style.css';

const InstitutionRegistration = ({ 
  institutionWithAdminForm, 
  setInstitutionWithAdminForm, 
  handleInstitutionWithAdminSubmit, 
  loading, 
  setCurrentView 
}) => {
  const [accreditationValidation, setAccreditationValidation] = useState({
    isChecking: false,
    isDuplicate: false,
    hasChecked: false
  });
  
  const [showInternetIdentityModal, setShowInternetIdentityModal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

  // Debounced validation for accreditation number
  const validateAccreditationNumber = useCallback(
    async (accreditationNumber) => {
      if (!accreditationNumber.trim()) {
        setAccreditationValidation({
          isChecking: false,
          isDuplicate: false,
          hasChecked: false
        });
        return;
      }

      setAccreditationValidation(prev => ({ ...prev, isChecking: true }));
      
      try {
        const isDuplicate = await institutionHandlers.checkAccreditationNumberExists(accreditationNumber);
        setAccreditationValidation({
          isChecking: false,
          isDuplicate,
          hasChecked: true
        });
      } catch (error) {
        console.error('Error validating accreditation number:', error);
        setAccreditationValidation({
          isChecking: false,
          isDuplicate: false,
          hasChecked: false
        });
      }
    },
    []
  );

  // Handle accreditation number change with validation
  const handleAccreditationNumberChange = (e) => {
    const value = e.target.value;
    setInstitutionWithAdminForm({
      ...institutionWithAdminForm, 
      accreditationNumber: value
    });

    // Debounce validation (wait 500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      validateAccreditationNumber(value);
    }, 500);

    // Clear previous timeout
    return () => clearTimeout(timeoutId);
  };

  // Helper function to generate unique accreditation number suggestions
  const generateUniqueAccreditationNumber = async () => {
    const prefix = institutionWithAdminForm.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 4);
    
    const timestamp = Date.now().toString().slice(-6);
    const suggested = `${prefix}-${timestamp}`;
    
    // Check if this suggestion is unique
    const isDuplicate = await institutionHandlers.checkAccreditationNumberExists(suggested);
    
    if (!isDuplicate) {
      setInstitutionWithAdminForm({
        ...institutionWithAdminForm,
        accreditationNumber: suggested
      });
      
      // Trigger validation for the new number
      validateAccreditationNumber(suggested);
    }
  };

  // Validate form before showing Internet Identity modal
  const validateForm = () => {
    const requiredFields = [
      'name', 'institutionType', 'address', 'contactEmail', 
      'contactPhone', 'accreditationNumber', 'adminFirstName', 
      'adminLastName', 'adminEmail'
    ];
    
    for (const field of requiredFields) {
      if (!institutionWithAdminForm[field] || institutionWithAdminForm[field].trim() === '') {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }
    
    if (accreditationValidation.isDuplicate) {
      alert('Please use a different accreditation number as this one already exists.');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(institutionWithAdminForm.contactEmail)) {
      alert('Please enter a valid contact email address.');
      return false;
    }
    if (!emailRegex.test(institutionWithAdminForm.adminEmail)) {
      alert('Please enter a valid admin email address.');
      return false;
    }
    
    return true;
  };

  // Handle form submission - show Internet Identity modal first
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Show confirmation message about the flow
    const confirmed = confirm(
      `Ready to register your institution!\n\n` +
      `Next steps:\n` +
      `1. Create your Internet Identity (secure authentication)\n` +
      `2. Register "${institutionWithAdminForm.name}" with admin account for ${institutionWithAdminForm.adminFirstName} ${institutionWithAdminForm.adminLastName}\n\n` +
      `Click OK to continue or Cancel to review your information.`
    );
    
    if (!confirmed) {
      return;
    }
    
    setFormValidated(true);
    setShowInternetIdentityModal(true);
  };

  // Handle successful Internet Identity creation - simplified flow
  const handleInternetIdentitySuccess = () => {
    // In the simplified flow, this is handled by App.jsx when user returns
    // from Internet Identity registration. Just close the modal here.
    setShowInternetIdentityModal(false);
  };

  // Handle Internet Identity creation cancellation
  const handleInternetIdentityCancel = () => {
    setShowInternetIdentityModal(false);
    setFormValidated(false);
  };

  // Handle Internet Identity creation error
  const handleInternetIdentityError = (error) => {
    setShowInternetIdentityModal(false);
    setFormValidated(false);
    console.error('Internet Identity creation error:', error);
    alert('Failed to create Internet Identity: ' + error.message);
  };

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
          <p className="form-subtitle">Fill out the form below to create your Internet Identity and register your institution</p>
        </div>

        <form onSubmit={handleFormSubmit} className="registration-form">
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
              <div className="input-container">
                <input
                  type="text"
                  id="accreditationNumber"
                  className={`form-input ${
                    accreditationValidation.hasChecked 
                      ? accreditationValidation.isDuplicate 
                        ? 'error' 
                        : 'success'
                      : ''
                  }`}
                  value={institutionWithAdminForm.accreditationNumber}
                  onChange={handleAccreditationNumberChange}
                  required
                  placeholder="Enter accreditation number"
                />
                <button 
                  type="button" 
                  onClick={generateUniqueAccreditationNumber}
                  className="generate-button"
                  title="Generate unique accreditation number"
                >
                  Generate
                </button>
                {accreditationValidation.isChecking && (
                  <div className="validation-indicator checking">
                    <div className="spinner-small"></div>
                    <span>Checking...</span>
                  </div>
                )}
                {accreditationValidation.hasChecked && !accreditationValidation.isChecking && (
                  <div className={`validation-indicator ${accreditationValidation.isDuplicate ? 'error' : 'success'}`}>
                    {accreditationValidation.isDuplicate ? (
                      <>
                        <span className="validation-icon">❌</span>
                        <span>Already exists</span>
                      </>
                    ) : (
                      <>
                        <span className="validation-icon">✅</span>
                        <span>Available</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              {accreditationValidation.isDuplicate && (
                <div className="error-message">
                  This accreditation number is already registered. Please use a different number.
                </div>
              )}
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
            <div className="ii-info-notice">
              <div className="ii-info-icon">🔐</div>
              <div className="ii-info-text">
                <strong>Secure Registration Process</strong><br />
                We'll create your Internet Identity first (secure, private authentication), then register your institution.
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || accreditationValidation.isDuplicate} 
              className="primary-button submit-btn"
            >
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
                    Create Internet Identity & Register Institution
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
    
    {/* Internet Identity Creation Modal */}
    {showInternetIdentityModal && (
      <InternetIdentityCreation
        onSuccess={handleInternetIdentitySuccess}
        onCancel={handleInternetIdentityCancel}
        onError={handleInternetIdentityError}
        displayName={`${institutionWithAdminForm.adminFirstName} ${institutionWithAdminForm.adminLastName}`}
        formData={institutionWithAdminForm}
      />
    )}
  </div>
);
};

export default InstitutionRegistration;