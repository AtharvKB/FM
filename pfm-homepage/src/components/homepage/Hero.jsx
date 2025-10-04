import React from 'react';
import './Hero.css';

const Hero = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Master Your <span className="highlight">Financial Future</span> with Smart Financial Management
          </h1>
          <p className="hero-description">
            Track expenses, manage budgets, analyze spending patterns, and make informed financial decisions with our comprehensive Personal Finance Management platform.
          </p>
          <div className="hero-buttons">
            <button onClick={scrollToPricing} className="btn-primary">
              Start Free Trial →
            </button>
            <button onClick={scrollToPricing} className="btn-secondary">
              Get Premium ✨
            </button>
          </div>
          <div className="hero-features">
            <div className="feature-badge">
              <span className="badge-icon">🔒</span>
              <span>Bank-level Security</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">📊</span>
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">💰</span>
              <span>Smart Budgeting</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="dashboard-preview">
            <div className="dashboard-header">
              <span className="dots">• • •</span>
              <span className="dashboard-title">PFM Dashboard</span>
            </div>
            <div className="balance-card">
              <div className="balance-label">Total Balance</div>
              <div className="balance-amount">₹2,45,680</div>
              <div className="balance-change">+12.5% this month</div>
            </div>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-label">Income</div>
                <div className="stat-value">₹85,000</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Expenses</div>
                <div className="stat-value">₹42,320</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Savings</div>
                <div className="stat-value">₹42,680</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
