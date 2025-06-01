import React from 'react';

const StaffRegistration = ({ 
  staffForm, 
  setStaffForm, 
  handleStaffSubmit, 
  loading 
}) => (
  <div className="registration-form">
    <h2>Register New Staff Member</h2>
    <p className="form-subtitle">Add administrative staff to your institution</p>
    
    <form onSubmit={handleStaffSubmit}>
      <div className="form-section">
        <h3 className="section-title">
          <span className="section-icon">👤</span>
          Staff Details
        </h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              value={staffForm.firstName}
              onChange={(e) => setStaffForm({...staffForm, firstName: e.target.value})}
              required
              placeholder="First name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              value={staffForm.lastName}
              onChange={(e) => setStaffForm({...staffForm, lastName: e.target.value})}
              required
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={staffForm.email}
            onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
            required
            placeholder="staff@institution.edu"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role *</label>
          <select
            id="role"
            value={staffForm.role}
            onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}
            required
          >
            <option value="">Select role</option>
            <option value="InstitutionAdmin">Institution Administrator</option>
            <option value="Staff">Staff Member</option>
            <option value="Registrar">Registrar</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="department">Department (Optional)</label>
          <input
            type="text"
            id="department"
            value={staffForm.department}
            onChange={(e) => setStaffForm({...staffForm, department: e.target.value})}
            placeholder="e.g., Admissions, Academic Affairs"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="primary-button">
          {loading ? 'Creating Staff Account...' : 'Create Staff Account & Generate Invitation'}
        </button>
      </div>
    </form>

    <div className="info-box">
      <h4>How it works:</h4>
      <ol>
        <li>Fill out the staff member's information</li>
        <li>An invitation code will be generated</li>
        <li>Share the invitation code with the staff member</li>
        <li>They can use the code to claim their account with Internet Identity</li>
      </ol>
    </div>
  </div>
);

export default StaffRegistration;
