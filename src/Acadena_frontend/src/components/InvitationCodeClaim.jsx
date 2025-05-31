import React from 'react';

const InvitationCodeClaim = ({ 
  invitationCodeForm, 
  setInvitationCodeForm, 
  handleInvitationCodeSubmit, 
  handleCheckInvitationCode, 
  invitationCodeInfo, 
  loading, 
  setCurrentView 
}) => (
  <div className="registration-form">
    <h2>Claim Your Student Account</h2>
    <p>Enter the invitation code provided by your institution to claim your student account.</p>
    
    <form onSubmit={handleInvitationCodeSubmit}>
      <div className="form-group">
        <label htmlFor="invitationCode">Invitation Code *</label>
        <input
          type="text"
          id="invitationCode"
          value={invitationCodeForm.code}
          onChange={(e) => setInvitationCodeForm({...invitationCodeForm, code: e.target.value})}
          placeholder="Enter your invitation code"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={handleCheckInvitationCode} disabled={loading}>
          Check Code
        </button>
      </div>

      {invitationCodeInfo && (
        <div className="invitation-info">
          <h3>Account Information</h3>
          <p><strong>Student Name:</strong> {invitationCodeInfo.studentName}</p>
          <p><strong>Institution:</strong> {invitationCodeInfo.institutionId}</p>
          <p><strong>Status:</strong> {invitationCodeInfo.isValid ? 'Valid' : 'Invalid/Expired'}</p>
          <p><strong>Expires:</strong> {new Date(Number(invitationCodeInfo.expiryDate) / 1000000).toLocaleDateString()}</p>
          
          {invitationCodeInfo.isValid && (
            <div className="claim-warning">
              <p><strong>Important:</strong> Claiming this account will link it to your Internet Identity. This action cannot be undone.</p>
            </div>
          )}
        </div>
      )}

      {invitationCodeInfo && invitationCodeInfo.isValid && (
        <div className="form-actions">
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Claiming Account...' : 'Claim Account with Internet Identity'}
          </button>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={() => setCurrentView('login')} className="link-btn">
          Back to Login
        </button>
      </div>
    </form>
  </div>
);

export default InvitationCodeClaim;
