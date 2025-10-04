import React from 'react';
import './Features.css';

const Features = ({ onRegisterClick, onPremiumClick }) => {
  return (
    <>
      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">Powerful Features for Complete Financial Control</h2>
          <p className="section-subtitle">Everything you need to manage your finances effectively</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Expense Tracking</h3>
              <p>Track every transaction automatically and categorize expenses for better insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Budget Management</h3>
              <p>Set budgets for different categories and receive alerts when approaching limits.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Financial Reports</h3>
              <p>Generate detailed reports with visualizations to understand spending patterns.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Goal Setting</h3>
              <p>Set financial goals and track progress with intelligent recommendations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Alerts</h3>
              <p>Get notified about bills, unusual spending, and budget limits.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Bank-level Security</h3>
              <p>Your data is protected with industry-standard encryption and security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About Our Platform</h2>
              <p className="about-description">
                Financial Management Platform is a comprehensive personal finance solution designed to help individuals take control of their financial lives. Built with modern technology and user-centric design, our platform simplifies complex financial management tasks.
              </p>
              <p className="about-description">
                We believe that everyone deserves access to powerful financial tools. Our mission is to democratize financial management by providing an intuitive, secure, and feature-rich platform that empowers users to make informed financial decisions.
              </p>
              <div className="about-stats">
                <div className="stat-box">
                  <div className="stat-number">50,000+</div>
                  <div className="stat-text">Active Users</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">₹500Cr+</div>
                  <div className="stat-text">Managed</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-text">Uptime</div>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="about-card">
                <h3>Why Choose Us?</h3>
                <ul className="about-list">
                  <li>✓ Easy-to-use interface</li>
                  <li>✓ Real-time synchronization</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Mobile & web access</li>
                  <li>✓ 24/7 customer support</li>
                  <li>✓ Regular updates & improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-container">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle">Select the perfect plan for your financial journey</p>
          <div className="pricing-grid">
            {/* FREE PLAN */}
            <div className="pricing-card">
              <div className="plan-header">
                <h3>Free</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li>✓ Basic expense tracking</li>
                <li>✓ Up to 3 budget categories</li>
                <li>✓ Monthly reports</li>
                <li>✓ Mobile app access</li>
                <li>✗ Advanced analytics</li>
                <li>✗ Goal tracking</li>
                <li>✗ Priority support</li>
              </ul>
              <button onClick={onRegisterClick} className="btn-plan">Start Free</button>
            </div>

            {/* 🆕 PREMIUM PLAN - UPDATED */}
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="plan-header">
                <h3>Premium</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">299</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li>✓ Unlimited expense tracking</li>
                <li>✓ Unlimited budget categories</li>
                <li>✓ Advanced analytics & insights</li>
                <li>✓ Goal tracking & recommendations</li>
                <li>✓ Custom reports</li>
                <li>✓ Bill reminders</li>
                <li>✓ Priority support</li>
              </ul>
              {/* 🆕 CHANGED: Now calls onPremiumClick instead of onRegisterClick */}
              <button onClick={onPremiumClick} className="btn-plan">Get Premium</button>
            </div>

            {/* BUSINESS PLAN */}
            <div className="pricing-card">
              <div className="plan-header">
                <h3>Business</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">999</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li>✓ Everything in Premium</li>
                <li>✓ Multi-user access (5 users)</li>
                <li>✓ Business expense management</li>
                <li>✓ Tax preparation tools</li>
                <li>✓ API access</li>
                <li>✓ Dedicated account manager</li>
                <li>✓ Custom integrations</li>
              </ul>
              <button onClick={onRegisterClick} className="btn-plan">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Have questions? We'd love to hear from you</p>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>Email Us</h3>
                <p>support@financialmanagement.com</p>
                <p>sales@financialmanagement.com</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Call Us</h3>
                <p>+91 22 1234 5678</p>
                <p>Mon-Fri, 9:00 AM - 6:00 PM IST</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Visit Us</h3>
                <p>Ramrao Adik Institute of Technology</p>
                <p>Navi Mumbai, Maharashtra</p>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Subject" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn-submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
