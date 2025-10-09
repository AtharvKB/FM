import React, { useState } from 'react';
import { isValidEmail, validatePassword, sanitizeInput } from '../../utils/validators';
import { API_URL } from '../../utils/constants';

const LoginForm = (props) => {
  // State for form inputs
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful:', data);
        
        // ✅ STORE TOKEN AND USER DATA IN LOCALSTORAGE
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          isPremium: data.data.isPremium,
          premiumEndDate: data.data.premiumEndDate
        }));
        
        console.log('✅ Token stored:', data.data.token.substring(0, 20) + '...');
        
        // Store the email for dashboard use
        const userEmail = formData.email;
        
        // Reset form
        setFormData({ email: '', password: '' });
        
        // Redirect to dashboard by passing email to parent
        props.onLoginSuccess && props.onLoginSuccess(userEmail);
        
      } else {
        // Handle login failure
        setErrors({ 
          email: data.message || 'Invalid credentials',
          password: ' ' // Keep password field highlighted
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
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
          <h2>Welcome Back</h2>
          <p>Sign in to your FM account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
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
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && errors.password.trim() && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

         {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" aria-label="Remember me" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#" className="forgot-link" onClick={(e) => {
              e.preventDefault();
              props.onForgotPassword && props.onForgotPassword();
            }}>Forgot password?</a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <div className="signup-link">
            <p>Don't have an account? <a href="#" onClick={(e) => {
              e.preventDefault();
              props.onSignUpClick && props.onSignUpClick();
            }}>Create Account</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
