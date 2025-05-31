import React from 'react';

const Header = ({ handleLogout, isAuthenticated }) => (
  <header className="app-header">
    <div className="header-content">
      <div className="logo-section">
        <img src="/logo2.svg" alt="Acadena logo" className="logo" />
        <h1>Acadena</h1>
        <p>Academic Records Management System</p>
      </div>
      {isAuthenticated && (
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      )}
    </div>
  </header>
);

export default Header;
