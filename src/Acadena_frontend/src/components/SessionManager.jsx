import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './assets/styles/style.css';

const SessionManager = () => {
  const navigate = useNavigate();
  const {
    sessions,
    currentSession,
    handleLogin,
    handleLogout,
    switchUser,
    removeSession,
    loading,
    isAuthenticated
  } = useAuth();

  const [showSessionList, setShowSessionList] = useState(false);

  const formatAnchor = (anchor) => {
    if (!anchor) return 'Unknown';
    return `#${anchor}`;
  };

  const formatPrincipal = (principal) => {
    if (!principal) return 'Unknown';
    return `${principal.substring(0, 8)}...${principal.substring(principal.length - 8)}`;
  };

  const getAuthMethodDisplay = (session) => {
    // In a real implementation, this would come from Internet Identity
    const methods = ['WebAuthn', 'Hardware Key', 'Biometric', 'Recovery Phrase'];
    return methods[Math.floor(Math.random() * methods.length)];
  };

  const handleNewLogin = async () => {
    try {
      await handleLogin();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSwitchUser = async (principal) => {
    try {
      await switchUser(principal);
      setShowSessionList(false);
    } catch (error) {
      console.error('Switch user failed:', error);
    }
  };

  const handleRemoveSession = (principal, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to remove this session?')) {
      removeSession(principal);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '800px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-circle">
                <span className="logo-icon">👥</span>
              </div>
              <h1 className="auth-title">Session Manager</h1>
            </div>
            <h2 className="auth-welcome">Internet Identity Multi-User Sessions</h2>
            <p className="auth-subtitle">
              Manage multiple authenticated users on this device
            </p>
          </div>

          <div className="auth-content">
            {/* Current Session */}
            {isAuthenticated && currentSession && (
              <div style={{ 
                background: '#e8f5e8', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                border: '2px solid #28a745'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#155724', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🟢 Active Session
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {currentSession.userInfo ? 
                        `${currentSession.userInfo.firstName} ${currentSession.userInfo.lastName}` : 
                        'Anonymous User'
                      }
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#155724', marginBottom: '0.25rem' }}>
                      <strong>Identity Anchor:</strong> {formatAnchor(currentSession.anchor)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#155724', marginBottom: '0.25rem' }}>
                      <strong>Principal:</strong> {formatPrincipal(currentSession.principal)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#155724', marginBottom: '0.25rem' }}>
                      <strong>Auth Method:</strong> {getAuthMethodDisplay(currentSession)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      Session started: {currentSession.loginTime?.toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    disabled={loading}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Logging out...' : 'End Session'}
                  </button>
                </div>
              </div>
            )}

            {/* Available Sessions */}
            {sessions.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#495057' }}>
                    Available Sessions ({sessions.length})
                  </h3>
                  <button
                    onClick={() => setShowSessionList(!showSessionList)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {showSessionList ? 'Hide' : 'Show'} Sessions
                  </button>
                </div>

                {showSessionList && (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {sessions.map((session, index) => {
                      const isActive = currentSession?.principal === session.principal;
                      
                      return (
                        <div
                          key={session.principal}
                          style={{
                            background: isActive ? '#e8f5e8' : '#f8f9fa',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: `1px solid ${isActive ? '#28a745' : '#e9ecef'}`,
                            cursor: isActive ? 'default' : 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => !isActive && handleSwitchUser(session.principal)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <strong>
                                  {session.userInfo ? 
                                    `${session.userInfo.firstName} ${session.userInfo.lastName}` : 
                                    'Anonymous User'
                                  }
                                </strong>
                                {isActive && (
                                  <span style={{ 
                                    background: '#28a745', 
                                    color: 'white', 
                                    padding: '0.2rem 0.5rem', 
                                    borderRadius: '12px', 
                                    fontSize: '0.7rem' 
                                  }}>
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                Anchor: {formatAnchor(session.anchor)} • {getAuthMethodDisplay(session)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#adb5bd' }}>
                                {formatPrincipal(session.principal)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {!isActive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSwitchUser(session.principal);
                                  }}
                                  disabled={loading}
                                  style={{
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  Switch
                                </button>
                              )}
                              <button
                                onClick={(e) => handleRemoveSession(session.principal, e)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add New Session */}
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <button 
                onClick={handleNewLogin}
                disabled={loading}
                className="primary-button"
                style={{ 
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 11-8 0 4 4 0 018 0zM16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add New User Session
                  </>
                )}
              </button>
            </div>

            {/* Information Box */}
            <div style={{ 
              background: '#fff3cd', 
              padding: '1.5rem', 
              borderRadius: '8px',
              border: '1px solid #ffeaa7'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#856404' }}>
                🔐 How Multi-User Sessions Work
              </h4>
              <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#856404' }}>
                <li>Each user gets a unique Internet Identity with their own anchor number</li>
                <li>Sessions are completely isolated - no data is shared between users</li>
                <li>Users can switch between sessions without re-authenticating</li>
                <li>Each session maintains its own authentication state and permissions</li>
                <li>Sessions persist until explicitly removed or expired</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="auth-actions" style={{ marginTop: '2rem' }}>
              <button 
                onClick={() => navigate('/login')}
                className="secondary-button"
              >
                ← Back to Login
              </button>
            </div>
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
};

export default SessionManager;
