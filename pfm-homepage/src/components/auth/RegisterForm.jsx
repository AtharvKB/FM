import React, { useState } from 'react';
import { isValidEmail, validatePassword, isRequired, sanitizeInput } from '../../utils/validators';
import { API_URL } from '../../utils/constants';

const RegisterForm = (props) => {
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityAnswer: ''
  });
  
  // State for form validation
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation using utility functions
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!isRequired(formData.name)) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!isRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    // Confirm Password validation
    if (!isRequired(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Security Answer validation
    if (!isRequired(formData.securityAnswer)) {
      newErrors.securityAnswer = 'Please answer the security question';
    } else if (formData.securityAnswer.length < 2) {
      newErrors.securityAnswer = 'Answer must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Make actual API call to backend
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          securityAnswer: formData.securityAnswer
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Registration successful:', data);
        
        // ✅ STORE TOKEN AND USER DATA IN LOCALSTORAGE (AUTO-LOGIN)
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          isPremium: data.data.isPremium
        }));
        
        console.log('✅ Token stored:', data.data.token.substring(0, 20) + '...');
        console.log('✅ Auto-login successful! Redirecting to dashboard...');
        
        // Show success message
        alert('✅ Registration successful! Redirecting to dashboard...');
        
        // Reset form
        setFormData({ 
          name: '', 
          email: '', 
          password: '', 
          confirmPassword: '',
          securityAnswer: ''
        });
        
        // ✅ REDIRECT TO DASHBOARD (Auto-login)
        props.onLoginSuccess && props.onLoginSuccess(data.data.email);
        
      } else {
        // Handle registration failure
        setErrors({
          email: data.message || 'Registration failed. Please try again.',
          password: ' ' // Keep fields highlighted
        });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        email: 'Connection failed. Please check if the server is running.',
        password: ' '
      });
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
        ← Back to Home
      </button>

      <div className="login-card">
        <div className="login-header">
          <h2>Create Account</h2>
          <p>Join FM and start managing your finances</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
              autoComplete="name"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              className={errors.password ? 'error' : ''}
              autoComplete="new-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && errors.password.trim() && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            {errors.confirmPassword && (
              <span id="confirm-password-error" className="error-message" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Security Question Field */}
          <div className="form-group">
            <label htmlFor="securityAnswer">Security Question *</label>
            <p style={{ 
              fontSize: '0.85rem', 
              color: '#64748b', 
              marginBottom: '0.5rem',
              marginTop: '0.25rem'
            }}>
              What is your favorite color? (For password recovery)
            </p>
            <input
              type="text"
              id="securityAnswer"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={handleChange}
              placeholder="Enter your favorite color"
              className={errors.securityAnswer ? 'error' : ''}
              autoComplete="off"
              aria-invalid={errors.securityAnswer ? 'true' : 'false'}
              aria-describedby={errors.securityAnswer ? 'security-answer-error' : undefined}
            />
            {errors.securityAnswer && (
              <span id="security-answer-error" className="error-message" role="alert">
                {errors.securityAnswer}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div className="signup-link">
            <p>Already have an account? <a href="#" onClick={(e) => {
              e.preventDefault();
              props.onLoginClick && props.onLoginClick();
            }}>Sign In</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
