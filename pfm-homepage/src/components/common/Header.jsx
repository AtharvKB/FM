import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ onLoginClick }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('homepage-theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme); // ✅ Use body, not html
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('homepage-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme); // ✅ Use body, not html
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">Financial Management Platform</span>
        </div>
        <nav className="nav-links">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <button onClick={onLoginClick} className="btn-signin">Sign In</button>
          <button onClick={scrollToPricing} className="btn-getstarted">Get Started</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
