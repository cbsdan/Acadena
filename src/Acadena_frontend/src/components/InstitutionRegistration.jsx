import React from 'react';

const InstitutionRegistration = ({ 
  institutionWithAdminForm, 
  setInstitutionWithAdminForm, 
  handleInstitutionWithAdminSubmit, 
  loading, 
  setCurrentView 
}) => (
  <div className="registration-form">
    <h2>Register New Institution with Admin</h2>
    <form onSubmit={handleInstitutionWithAdminSubmit}>
      <h3>Institution Details</h3>
      
      <div className="form-group">
        <label htmlFor="name">Institution Name *</label>
        <input
          type="text"
          id="name"
          value={institutionWithAdminForm.name}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, name: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="institutionType">Institution Type *</label>
        <select
          id="institutionType"
          value={institutionWithAdminForm.institutionType}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, institutionType: e.target.value})}
          required
        >
          <option value="University">University</option>
          <option value="College">College</option>
          <option value="HighSchool">High School</option>
          <option value="ElementarySchool">Elementary School</option>
          <option value="TechnicalSchool">Technical School</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="address">Address *</label>
        <textarea
          id="address"
          value={institutionWithAdminForm.address}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, address: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email *</label>
          <input
            type="email"
            id="contactEmail"
            value={institutionWithAdminForm.contactEmail}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactEmail: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">Contact Phone *</label>
          <input
            type="tel"
            id="contactPhone"
            value={institutionWithAdminForm.contactPhone}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, contactPhone: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="accreditationNumber">Accreditation Number *</label>
        <input
          type="text"
          id="accreditationNumber"
          value={institutionWithAdminForm.accreditationNumber}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, accreditationNumber: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="website">Website</label>
        <input
          type="url"
          id="website"
          value={institutionWithAdminForm.website}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, website: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={institutionWithAdminForm.description}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, description: e.target.value})}
        />
      </div>

      <h3>Administrator Details</h3>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="adminFirstName">Admin First Name *</label>
          <input
            type="text"
            id="adminFirstName"
            value={institutionWithAdminForm.adminFirstName}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminFirstName: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="adminLastName">Admin Last Name *</label>
          <input
            type="text"
            id="adminLastName"
            value={institutionWithAdminForm.adminLastName}
            onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminLastName: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="adminEmail">Admin Email *</label>
        <input
          type="email"
          id="adminEmail"
          value={institutionWithAdminForm.adminEmail}
          onChange={(e) => setInstitutionWithAdminForm({...institutionWithAdminForm, adminEmail: e.target.value})}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Institution...' : 'Create Institution & Admin'}
        </button>
        <button type="button" onClick={() => setCurrentView('login')}>
          Back to Login
        </button>
      </div>
    </form>
  </div>
);

export default InstitutionRegistration;
