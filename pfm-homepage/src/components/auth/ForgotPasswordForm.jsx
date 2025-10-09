import React, { useState } from 'react';
import { isValidEmail, validatePassword, sanitizeInput } from '../../utils/validators';
import { API_URL } from '../../utils/constants';

const ForgotPasswordForm = (props) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Security Question, 3: New Password
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Check if email exists and get security question
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSecurityQuestion(data.securityQuestion);
        setStep(2);
      } else {
        setErrors({ email: data.message || 'Email not found' });
      }
    } catch (error) {
      setErrors({ email: 'Connection failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify security answer
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    
    if (!securityAnswer.trim()) {
      setErrors({ security: 'Please enter your answer' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/verify-security-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer: securityAnswer })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(3);
      } else {
        setErrors({ security: 'Incorrect answer. Please try again.' });
      }
    } catch (error) {
      setErrors({ security: 'Connection failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set new password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.message });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ Password reset successful! You can now login.');
        props.onLoginClick && props.onLoginClick();
      } else {
        setErrors({ password: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      setErrors({ password: 'Connection failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* BACK BUTTON */}
      <button 
        className="back-button" 
        onClick={() => props.onBack && props.onBack()}
        aria-label="Back to Home"
      >
        ← Back to Login
      </button>

      <div className="login-card">
        <div className="login-header">
          <h2>🔐 Reset Password</h2>
          <p>
            {step === 1 && 'Enter your email to get started'}
            {step === 2 && 'Answer your security question'}
            {step === 3 && 'Create a new password'}
          </p>
        </div>

        {/* STEP 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(sanitizeInput(e.target.value));
                  setErrors({});
                }}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
                autoFocus
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Checking...' : 'Continue'}
            </button>

            <div className="signup-link">
              <p>Remember your password? <a href="#" onClick={(e) => {
                e.preventDefault();
                props.onLoginClick && props.onLoginClick();
              }}>Sign In</a></p>
            </div>
          </form>
        )}

        {/* STEP 2: Security Question */}
        {step === 2 && (
          <form onSubmit={handleSecuritySubmit} className="login-form" noValidate>
            <div className="security-question-box">
              <p className="security-question">{securityQuestion}</p>
            </div>

            <div className="form-group">
              <label htmlFor="security">Your Answer *</label>
              <input
                type="text"
                id="security"
                value={securityAnswer}
                onChange={(e) => {
                  setSecurityAnswer(sanitizeInput(e.target.value));
                  setErrors({});
                }}
                placeholder="Enter your answer"
                className={errors.security ? 'error' : ''}
                autoFocus
              />
              {errors.security && (
                <span className="error-message">{errors.security}</span>
              )}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Answer'}
            </button>

            <div className="signup-link">
              <p><a href="#" onClick={(e) => {
                e.preventDefault();
                setStep(1);
                setSecurityAnswer('');
                setErrors({});
              }}>← Try different email</a></p>
            </div>
          </form>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({});
                }}
                placeholder="Enter new password (min 6 characters)"
                className={errors.password ? 'error' : ''}
                autoFocus
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({});
                }}
                placeholder="Confirm new password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Progress Indicator */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
