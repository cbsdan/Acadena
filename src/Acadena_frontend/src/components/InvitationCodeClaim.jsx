import React from 'react';
import './assets/styles/style.css';

const InvitationCodeClaim = ({ 
  invitationCodeForm, 
  setInvitationCodeForm, 
  handleInvitationCodeSubmit, 
  handleCheckInvitationCode, 
  invitationCodeInfo, 
  loading, 
  setCurrentView 
}) => (
  <div className="auth-page">
    <div className="auth-container">
      <div className="auth-card invitation-claim-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-icon">🎟️</span>
            </div>
            <h1 className="auth-title">Acadena</h1>
          </div>
          <h2 className="auth-welcome">Claim Your Student Account</h2>
          <p className="auth-subtitle">Enter the invitation code provided by your institution</p>
        </div>

        <div className="auth-content">
          <form onSubmit={handleInvitationCodeSubmit} className="invitation-form">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="invitationCode" className="form-label">Invitation Code *</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="invitationCode"
                    className="form-input invitation-input"
                    value={invitationCodeForm.code}
                    onChange={(e) => setInvitationCodeForm({...invitationCodeForm, code: e.target.value})}
                    placeholder="Enter your invitation code"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckInvitationCode} 
                    disabled={loading || !invitationCodeForm.code.trim()}
                    className="secondary-button check-btn"
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Check Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {invitationCodeInfo && (
              <div className="invitation-info-card">
                <div className="info-header">
                  <div className="info-status-icon">
                    {invitationCodeInfo.isValid ? '✅' : '❌'}
                  </div>
                  <h3 className="info-title">Account Information</h3>
                </div>
                
                <div className="info-content">
                  <div className="info-item">
                    <span className="info-label">Student Name:</span>
                    <span className="info-value">{invitationCodeInfo.studentName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Institution:</span>
                    <span className="info-value">{invitationCodeInfo.institutionId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className={`info-value status-badge ${invitationCodeInfo.isValid ? 'valid' : 'invalid'}`}>
                      {invitationCodeInfo.isValid ? 'Valid' : 'Invalid/Expired'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Expires:</span>
                    <span className="info-value">{new Date(Number(invitationCodeInfo.expiryDate) / 1000000).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {invitationCodeInfo.isValid && (
                  <div className="claim-warning">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                      <p><strong>Important:</strong> Claiming this account will link it to your Internet Identity. This action cannot be undone.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="auth-actions">
              {invitationCodeInfo && invitationCodeInfo.isValid && (
                <button type="submit" disabled={loading} className="primary-button claim-btn">
                  <span className="button-content">
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        Claiming Account...
                      </>
                    ) : (
                      <>
                        <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M15 3h6v6M14 14l6.5-6.5M19 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Claim Account with Internet Identity
                      </>
                    )}
                  </span>
                  <div className="button-shine"></div>
                </button>
              )}
              
              <button type="button" onClick={() => setCurrentView('login')} className="tertiary-button">
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

    <div className="auth-background">
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>
      <div className="bg-shape bg-shape-4"></div>
    </div>
  </div>
);

export default InvitationCodeClaim;