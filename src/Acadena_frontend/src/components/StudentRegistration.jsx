import React from 'react';

const StudentRegistration = ({ 
  studentForm, 
  setStudentForm, 
  handleStudentSubmit, 
  loading 
}) => (
  <div className="registration-form">
    <h2>Register New Student</h2>
    <form onSubmit={handleStudentSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            value={studentForm.firstName}
            onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            value={studentForm.lastName}
            onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={studentForm.email}
          onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="studentNumber">Student Number *</label>
          <input
            type="text"
            id="studentNumber"
            value={studentForm.studentNumber}
            onChange={(e) => setStudentForm({...studentForm, studentNumber: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="yearLevel">Year Level *</label>
          <input
            type="number"
            id="yearLevel"
            min="1"
            max="10"
            value={studentForm.yearLevel}
            onChange={(e) => setStudentForm({...studentForm, yearLevel: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="program">Program *</label>
        <input
          type="text"
          id="program"
          value={studentForm.program}
          onChange={(e) => setStudentForm({...studentForm, program: e.target.value})}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register Student'}
      </button>
    </form>
  </div>
);

export default StudentRegistration;
