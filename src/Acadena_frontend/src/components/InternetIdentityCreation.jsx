import React, { useState, useEffect } from 'react';
import { internetIdentityRegistrationService } from '../services/InternetIdentityRegistrationService';
import { internetIdentityService } from '../services/InternetIdentityService';
import './assets/styles/style.css';

const InternetIdentityCreation = ({ 
  onSuccess, 
  onCancel, 
  onError,
  displayName = 'Institution Admin',
  formData = null
}) => {
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');

  // Monitor authentication state to detect when user returns from Internet Identity
  useEffect(() => {
    let interval;
    
    if (redirecting) {
      // Check every 2 seconds if the user has been authenticated
      interval = setInterval(async () => {
        try {
          const isAuth = await internetIdentityService.isAuthenticated();
          if (isAuth) {
            console.log('Detected authentication success, closing modal');
            setRedirecting(false);
            if (onSuccess) {
              onSuccess();
            }
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [redirecting, onSuccess]);

  const handleCreateIdentity = async () => {
    setRedirecting(true);
    setError('');
    
    try {
      const result = await internetIdentityRegistrationService.createNewInternetIdentity(displayName, formData);
      
      if (result.success) {
        // The service will redirect to Internet Identity
        // No need to do anything else here
      } else {
        setError(result.error || 'Failed to create Internet Identity');
        setRedirecting(false);
        if (onError) {
          onError(new Error(result.error));
        }
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred: ' + err.message;
      setError(errorMsg);
      setRedirecting(false);
      if (onError) {
        onError(err);
      }
    }
  };

  if (redirecting) {
    return (
      <div className="ii-modal-overlay">
        <div className="ii-modal-content">
          <div className="ii-modal-header">
            <h2>Redirecting to Internet Identity</h2>
          </div>
          <div className="ii-modal-body">
            <div className="ii-step-content">
              <div className="ii-step-header">
                <h3>Creating Your Internet Identity</h3>
                <p>You will be redirected to Internet Identity to complete registration.</p>
              </div>
              
              <div className="ii-redirect-steps">
                <div className="ii-redirect-step">
                  <span className="step-number">1</span>
                  <span>Complete captcha verification</span>
                </div>
                <div className="ii-redirect-step">
                  <span className="step-number">2</span>
                  <span>Create passkey with your device</span>
                </div>
                <div className="ii-redirect-step">
                  <span className="step-number">3</span>
                  <span>Return to complete institution registration</span>
                </div>
              </div>
              
              <div className="ii-loading">
                <div className="loading-spinner"></div>
                <p>Redirecting...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ii-modal-overlay">
      <div className="ii-modal-content">
        <div className="ii-modal-header">
          <h2>Create Internet Identity</h2>
        </div>
        <div className="ii-modal-body">
          <div className="ii-step-content">
            <div className="ii-step-header">
              <h3>Secure Authentication Setup</h3>
              <p>
                Internet Identity provides secure, passwordless authentication for your institution admin account.
              </p>
            </div>
            
            <div className="ii-features">
              <div className="ii-feature">
                <div className="ii-feature-icon">🔒</div>
                <div className="ii-feature-text">
                  <strong>Secure Authentication</strong><br />
                  Uses cryptographic keys stored on your device
                </div>
              </div>
              <div className="ii-feature">
                <div className="ii-feature-icon">🔐</div>
                <div className="ii-feature-text">
                  <strong>Privacy Protection</strong><br />
                  No personal information required or stored
                </div>
              </div>
              <div className="ii-feature">
                <div className="ii-feature-icon">📱</div>
                <div className="ii-feature-text">
                  <strong>Device-based</strong><br />
                  Works with Touch ID, Face ID, or security keys
                </div>
              </div>
            </div>

            {error && (
              <div className="ii-error-message">
                {error}
              </div>
            )}

            <div className="ii-step-actions">
              <button 
                type="button"
                onClick={handleCreateIdentity}
                className="btn-primary"
              >
                Create Internet Identity
              </button>
              <button 
                type="button"
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternetIdentityCreation;