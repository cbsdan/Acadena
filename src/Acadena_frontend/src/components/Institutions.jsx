import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleInstitutionSelect = (institution) => {
    setSelectedInstitution(institution);
    setShowModal(false); // Close modal automatically
    setSearchTerm(''); // Clear search term
  };

  const handleBackToHome = (e) => {
    e.preventDefault();
    console.log("🏠 Navigating back to home...");
    
    // Try using the prop function first
    if (onBackToLanding && typeof onBackToLanding === 'function') {
      console.log("✅ Using onBackToLanding prop");
      onBackToLanding();
    } else {
      // Fallback to direct navigation
      console.log("🔄 Using direct navigation fallback");
      navigate('/');
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchTerm('');
  };

  // Filter institutions based on search term
  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <label className="dropdown-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Select an Institution
              </label>
              <div className="institution-selector-button" onClick={openModal}>
                <span className="selector-text">
                  {selectedInstitution ? selectedInstitution.name : "-- Choose an institution --"}
                </span>
                <div className="selector-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <svg className="modal-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                  <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                  <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Select Institution
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <div className="modal-search">
              <div className="search-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-results-count">
                {filteredInstitutions.length} of {institutions.length} institutions
              </div>
            </div>

            <div className="modal-body">
              <div className="institutions-list">
                {filteredInstitutions.map((inst, idx) => (
                  <div 
                    key={idx} 
                    className="institution-row"
                    onClick={() => handleInstitutionSelect(inst)}
                  >
                    <div className="institution-row-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 17 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                        <path d="m2 12 10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="institution-row-content">
                      <div className="institution-row-name">{inst.name}</div>
                      <div className="institution-row-location">
                        <svg className="location-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {inst.city}, {inst.province}, {inst.region}
                      </div>
                    </div>
                    <div className="institution-row-arrow">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <p className="no-selection-description">Click the selector above to browse and choose from our comprehensive database</p>
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