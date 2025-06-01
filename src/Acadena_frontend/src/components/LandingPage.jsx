import React, { useEffect } from 'react';
import './assets/styles/main.css';
import logoImage from './assets/images/logo.png';
import landingPageImage from './assets/images/landingpage.png';
import aboutImage from './assets/images/about.png';

const LandingPage = ({ onEnterApp, onShowInstitutions }) => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-section');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logoImage} alt="Acadena Logo" className="navbar-logo" />
          <span className="logo-text">Acadena</span>
        </div>
        
        <div className="navbar-center">
          <ul className="navbar-menu">
            <li><a href="#home" className="nav-link active">Home</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#guide" className="nav-link">Guide</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
            <li>
              <button className="nav-link" onClick={onShowInstitutions} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                Institutions
              </button>
            </li>
          </ul>
        </div>
        
        <div className="navbar-right">
          <button className="navbar-button" onClick={onEnterApp}>
            <span>Get Started</span>
            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="content-left">
          <h1 className="main-heading">
            <span className="gradient-text">Secure Learning</span> and 
            <span className="gradient-text"> Seamless Records.</span>
            <br />
            <span className="subtitle">Anytime, Anywhere.</span>
          </h1>
          <p className="description">
            Experience the future of education with blockchain-powered security
            and seamless academic record management.
          </p>
          <div className="cta-buttons">
            <button className="try-today-button primary" onClick={onEnterApp}>
              <span>Try Today</span>
              <div className="button-shine"></div>
            </button>
          </div>
        </div>
        
        <div className="content-right">
          <div className="image-container">
            <div className="floating-card card-1">
              <div className="card-icon">🛡️</div>
              <div className="card-text">Blockchain Secured</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">⚡</div>
              <div className="card-text">Instant Verification</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🔄</div>
              <div className="card-text">Cross-Institution</div>
            </div>
            <img src={landingPageImage} alt="Landing Page Illustration" className="main-image" />
            <div className="image-glow"></div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section fade-in-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">What Acadena Delivers</h2>
            <div className="title-underline"></div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" data-delay="100">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Manage and Verify Records</h3>
              <p className="feature-description">
                Register students, issue and validate documents securely.
              </p>
              <div className="feature-glow"></div>
            </div>

            <div className="feature-card" data-delay="200">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Private Key Management</h3>
              <p className="feature-description">
                Advanced private key generation and management system with account recovery features for secure access control.
              </p>
              <div className="feature-glow"></div>
            </div>

            <div className="feature-card" data-delay="300">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Smart Requests and Transfers</h3>
              <p className="feature-description">
                Easily request, verify, and move records between institutions.
              </p>
              <div className="feature-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section fade-in-section" id="about">
        <div className="about-container">
          <div className="about-content">
            <div className="about-image-left">
              <div className="about-image-frame">
                <img src={aboutImage} alt="About Acadena" className="about-img" />
                <div className="image-overlay"></div>
              </div>
            </div>
            
            <div className="about-content-right">
              <div className="section-label">
                <span className="label-line"></span>
                <span className="label-text">About Us</span>
                <span className="label-line"></span>
              </div>
              
              <h2 className="about-heading">
                Revolutionizing Education with 
                <span className="highlight-text"> Blockchain Technology</span>
              </h2>
              
              <div className="about-text-content">
                <p className="about-paragraph">
                  At Acadena, we believe every student deserves secure access to their academic records, 
                  no matter where they are. Our platform uses blockchain technology to protect, verify, 
                  and transfer student credentials with ease.
                </p>
                
                <div className="about-stats-grid">
                  <div className="stat-box">
                    <div className="stat-number">100%</div>
                    <div className="stat-desc">Secure Records</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">24/7</div>
                    <div className="stat-desc">Digital Access</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">Instant</div>
                    <div className="stat-desc">Verification</div>
                  </div>
                </div>
                
                <div className="about-benefits">
                  <div className="benefit-item">
                    <div className="benefit-icon">🔒</div>
                    <div className="benefit-content">
                      <h4>Immutable Storage</h4>
                      <p>Your records are permanently secured on the blockchain</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">⚡</div>
                    <div className="benefit-content">
                      <h4>Instant Verification</h4>
                      <p>Verify credentials anywhere in the world instantly</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">🔄</div>
                    <div className="benefit-content">
                      <h4>Cross-Institution Network</h4>
                      <p>Seamless communication between educational institutions</p>
                    </div>
                  </div>
                </div>
                
                <div className="about-cta">
                  <button className="discover-btn" onClick={onEnterApp}>
                    <span>Discover More</span>
                    <div className="btn-bg"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
};

export default LandingPage;