import React, { useState } from 'react';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - UPDATED TO USE BACKEND AND REDIRECT TO DASHBOARD
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Make actual API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
        
        // Store the email for dashboard use
        const userEmail = formData.email;
        
        // Reset form
        setFormData({ email: '', password: '' });
        
        // Redirect to dashboard by passing email to parent
        props.onLoginSuccess && props.onLoginSuccess(userEmail);
        
      } else {
        // Handle login failure
        alert('Login failed: ' + (data.message || 'Invalid credentials'));
      }
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 🆕 BACK BUTTON */}
      <button 
        className="back-button" 
        onClick={() => props.onBack && props.onBack()}
      >
        ← Back to Home
      </button>

      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your FM account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
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
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#forgot" className="forgot-link">Forgot password?</a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
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
