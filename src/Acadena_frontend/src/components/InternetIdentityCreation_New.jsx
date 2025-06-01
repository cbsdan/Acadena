// filepath: /home/cbsdan/Acadena/src/Acadena_frontend/src/components/InternetIdentityCreation.jsx
import React, { useState } from 'react';
import { internetIdentityRegistrationService } from '../services/InternetIdentityRegistrationService';
import './assets/styles/style.css';

const InternetIdentityCreation = ({ 
  onSuccess, 
  onCancel, 
  onError,
  displayName = 'Institution Admin' 
}) => {
  const [currentStep, setCurrentStep] = useState('start'); // start, redirecting
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await internetIdentityRegistrationService.createNewInternetIdentity(displayName);
      
      if (result.success && result.requiresRedirect) {
        setCurrentStep('redirecting');
        // Small delay to show the redirecting state, then redirect
        setTimeout(() => {
          internetIdentityRegistrationService.redirectToRegistration();
        }, 1000);
      } else {
        const errorMsg = result.error || 'Failed to start registration';
        setError(errorMsg);
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred: ' + err.message;
      setError(errorMsg);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'start':
        return (
          <div className="ii-step-content">
            <div className="ii-step-header">
              <h3>Create Internet Identity</h3>
              <p>
                Internet Identity is a secure, anonymous authentication system that allows you to 
                sign into applications on the Internet Computer without sharing personal data.
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
                onClick={handleStart}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Starting...' : 'Create Internet Identity'}
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
        );

      case 'redirecting':
        return (
          <div className="ii-step-content">
            <div className="ii-step-header">
              <h3>Redirecting to Internet Identity</h3>
              <p>
                You will be redirected to Internet Identity to complete your registration.
                This process includes:
              </p>
            </div>
            
            <div className="ii-redirect-steps">
              <div className="ii-redirect-step">
                <span className="step-number">1</span>
                <span>Captcha verification</span>
              </div>
              <div className="ii-redirect-step">
                <span className="step-number">2</span>
                <span>Create passkey with your device</span>
              </div>
              <div className="ii-redirect-step">
                <span className="step-number">3</span>
                <span>Receive your Internet Identity number</span>
              </div>
            </div>

            <div className="ii-loading">
              <div className="loading-spinner"></div>
              <p>Redirecting...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ii-modal-overlay">
      <div className="ii-modal">
        <div className="ii-modal-header">
          <h2>Internet Identity Setup</h2>
        </div>
        <div className="ii-modal-body">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default InternetIdentityCreation;
