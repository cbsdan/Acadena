import React from 'react';
import './assets/styles/style.css';

const Login = ({ handleLogin, loading, setCurrentView }) => (
  <div className="auth-page">
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-circle">
              <span className="logo-icon">🎓</span>
            </div>
            <h1 className="auth-title">Acadena</h1>
          </div>
          <h2 className="auth-welcome">Welcome Back</h2>
          <p className="auth-subtitle">Secure access to your academic records</p>
        </div>

        <div className="auth-content">
          <div className="auth-info">
            <div className="info-item">
              <div className="info-icon">🔐</div>
              <div className="info-text">
                <span className="info-title">Secure Authentication</span>
                <span className="info-desc">Login with Internet Identity for maximum security</span>
              </div>
            </div>
          </div>

          <div className="auth-actions">
            <button 
              onClick={handleLogin} 
              disabled={loading} 
              className="primary-button auth-login-btn"
            >
              <span className="button-content">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h6v6M14 14l6.5-6.5M19 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Login with Internet Identity
                  </>
                )}
              </span>
              <div className="button-shine"></div>
            </button>

            <div className="auth-divider">
              <span className="divider-line"></span>
              <span className="divider-text">New to Acadena?</span>
              <span className="divider-line"></span>
            </div>

            <div className="auth-secondary-actions">
              <button 
                onClick={() => setCurrentView('register-institution')} 
                className="secondary-button"
              >
                <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Register New Institution
              </button>
              
              <button 
                onClick={() => setCurrentView('claim-invitation')} 
                className="tertiary-button"
              >
                <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                I have an invitation code
              </button>

              <button 
                onClick={() => setCurrentView('session-manager')} 
                className="tertiary-button"
                style={{ 
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Session Manager
              </button>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <p className="footer-text">
            By continuing, you agree to our 
            <button className="link-button"> Terms of Service</button> and 
            <button className="link-button">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>

    {/* Background Elements */}
    <div className="auth-background">
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>
      <div className="bg-shape bg-shape-4"></div>
    </div>
  </div>
);

export default Login;