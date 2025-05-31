import React from 'react';

const Login = ({ handleLogin, loading, setCurrentView }) => (
  <div className="login-container">
    <div className="login-card">
      <h2>Welcome to Acadena</h2>
      <p>Please authenticate to access your account</p>
      <p className="login-note">Existing users can log in below. New institutions can register to get started.</p>
      <button onClick={handleLogin} disabled={loading} className="login-btn">
        {loading ? 'Authenticating...' : 'Login with Internet Identity'}
      </button>
      <div className="login-options">
        <button onClick={() => setCurrentView('register-institution')} className="link-btn">
          Register New Institution
        </button>
        <button onClick={() => setCurrentView('claim-invitation')} className="link-btn">
          I have an invitation code
        </button>
      </div>
    </div>
  </div>
);

export default Login;
