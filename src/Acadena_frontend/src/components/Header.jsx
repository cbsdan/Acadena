import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from './assets/images/logo.png';
import './assets/styles/style.css';

const Header = ({ handleLogout, isAuthenticated, onNavigateToLanding, onNavigateToDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      // If logged in, always navigate to dashboard
      if (location.pathname !== '/app') {
        navigate('/app');
      } else {
        // If already on /app, force navigate to dashboard by reloading with dashboard view
        navigate('/app', { replace: true });
        // Add a small delay to ensure the navigation completes, then set to dashboard
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigateToDashboard'));
        }, 100);
      }
    } else {
      // If not logged in, go to landing page
      navigate('/');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="header-logo-container">
            <img src={logoImage} alt="Acadena Logo" className="header-logo" />
            <div className="logo-text-container">
              <h1 className="header-title">Acadena</h1>
              <p className="header-subtitle">Academic Records Management System</p>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          {isAuthenticated && (
            <>
              
              <button onClick={handleLogout} className="logout-btn">
                <svg className="logout-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Header decoration */}
      <div className="header-decoration">
        <div className="decoration-shape decoration-1"></div>
        <div className="decoration-shape decoration-2"></div>
      </div>
    </header>
  );
};

export default Header;