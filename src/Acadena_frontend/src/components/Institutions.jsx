import React, { useEffect, useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../../declarations/Acadena_backend';
import './assets/styles/main.css';
import logoImage from './assets/images/logo.png';

const agent = new HttpAgent({ host: "http://localhost:4943" });
if (process.env.DFX_NETWORK !== "ic") {
  agent.fetchRootKey();
}
const backend = Actor.createActor(idlFactory, { agent, canisterId });

export default function Institutions({ onBackToLanding }) {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getCHEDInstitutions()
      .then(data => {
        console.log("Institutions from canister:", data);
        setInstitutions(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleInstitutionSelect = (event) => {
    const selectedIndex = parseInt(event.target.value);
    if (selectedIndex >= 0) {
      setSelectedInstitution(institutions[selectedIndex]);
    } else {
      setSelectedInstitution(null);
    }
  };

  const handleBackToHome = (e) => {
    e.preventDefault();
    if (onBackToLanding && typeof onBackToLanding === 'function') {
      onBackToLanding();
    } else {
      console.error("onBackToLanding is not a function or is undefined");
    }
  };

  if (loading) {
    return (
      <div className="institutions-page">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-left">
            <img src={logoImage} alt="Acadena Logo" className="navbar-logo" />
            <span className="logo-text">Acadena</span>
          </div>
          
          <div className="navbar-center">
            <ul className="navbar-menu">
              <li>
                <button 
                  className="nav-link-button" 
                  onClick={handleBackToHome}
                >
                  Home
                </button>
              </li>
              <li><span className="nav-link active">Institutions</span></li>
            </ul>
          </div>
          
          <div className="navbar-right">
            <button className="navbar-button" onClick={handleBackToHome}>
              <span>Back to Home</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </nav>

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading institutions...</div>
        </div>
        
        {/* Floating Background Elements */}
        <div className="floating-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="institutions-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logoImage} alt="Acadena Logo" className="navbar-logo" />
          <span className="logo-text">Acadena</span>
        </div>
        
        <div className="navbar-center">
          <ul className="navbar-menu">
            <li>
              <button 
                className="nav-link-button" 
                onClick={handleBackToHome}
              >
                Home
              </button>
            </li>
            <li><span className="nav-link active">Institutions</span></li>
          </ul>
        </div>
        
        <div className="navbar-right">
          <button className="navbar-button" onClick={handleBackToHome}>
            <span>Back to Home</span>
            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="institutions-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="institutions-container">
          <div className="institutions-header">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="institutions-title">
              <span className="title-main">CHED Institutions</span>
              <span className="title-accent">Database</span>
            </h1>
            <p className="institutions-subtitle">
              Explore <span className="highlight-number">{institutions.length}</span> registered higher education institutions across the Philippines
            </p>
            <div className="title-decoration">
              <div className="decoration-line"></div>
              <div className="decoration-dot"></div>
              <div className="decoration-line"></div>
            </div>
          </div>

          <div className="institution-selector">
            <div className="selector-wrapper">
              <label htmlFor="institution-dropdown" className="dropdown-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Select an Institution
              </label>
              <div className="dropdown-container">
                <select 
                  id="institution-dropdown"
                  className="institution-dropdown"
                  onChange={handleInstitutionSelect}
                  defaultValue=""
                >
                  <option value="">-- Choose an institution --</option>
                  {institutions.map((inst, idx) => (
                    <option key={idx} value={idx}>
                      {inst.name} - {inst.region}, {inst.province}, {inst.city}
                    </option>
                  ))}
                </select>
                <div className="dropdown-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Details */}
      {selectedInstitution && (
        <div className="institution-details">
          <div className="institutions-container">
            <div className="institution-card">
              <div className="institution-card-header">
                <div className="header-background"></div>
                <div className="header-content">
                  <div className="institution-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="institution-name">{selectedInstitution.name}</h2>
                  <span className="institution-region">{selectedInstitution.region}</span>
                </div>
              </div>
              <div className="institution-card-body">
                <div className="institution-info">
                  <div className="info-item">
                    <div className="info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Province</span>
                      <span className="info-value">{selectedInstitution.province}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">City</span>
                      <span className="info-value">{selectedInstitution.city}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Website</span>
                      <a 
                        href={selectedInstitution.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="info-link"
                      >
                        {selectedInstitution.website}
                        <svg className="external-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="2"/>
                          <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Contact</span>
                      <span className="info-value">{selectedInstitution.contact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedInstitution && !loading && (
        <div className="no-selection">
          <div className="institutions-container">
            <div className="no-selection-content">
              <div className="no-selection-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="no-selection-title">Select an institution to view details</h3>
              <p className="no-selection-description">Choose from the dropdown above to see comprehensive institution information</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
}