import React, { useState, useEffect } from 'react';
import PolicyModal from './PolicyModal';
import './Footer.css'

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: null });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.body.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const openModal = (type) => {
    let title = '';
    let content = null;

    if (type === 'privacy') {
      title = '🔒 Privacy Policy';
      content = (
        <>
          <p><strong>Effective Date:</strong> October 2025</p>
          
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us when you:</p>
          <ul>
            <li>Create an account (name, email, password)</li>
            <li>Add financial transactions</li>
            <li>Make payments for premium features</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>Your information is used to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process your transactions securely</li>
            <li>Send important updates and notifications</li>
            <li>Provide customer support</li>
          </ul>

          <h3>3. Data Security</h3>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>Encrypted passwords (bcrypt)</li>
            <li>Secure JWT authentication</li>
            <li>HTTPS encryption for all communications</li>
            <li>Regular security audits</li>
          </ul>

          <h3>4. Data Sharing</h3>
          <p>We <strong>DO NOT</strong> sell or share your personal information with third parties, except:</p>
          <ul>
            <li>Payment processors (Razorpay) for premium subscriptions</li>
            <li>When required by law</li>
          </ul>

          <h3>5. Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request data deletion</li>
            <li>Update your information</li>
            <li>Export your data</li>
          </ul>

          <h3>6. Contact Us</h3>
          <p>For privacy concerns, contact us at: <strong>support@financialmanagement.com</strong></p>
        </>
      );
    } else if (type === 'terms') {
      title = '📜 Terms & Conditions';
      content = (
        <>
          <p><strong>Last Updated:</strong> October 2025</p>
          
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using this Personal Finance Management application, you accept and agree to be bound by these Terms and Conditions.</p>

          <h3>2. Use of Service</h3>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate information during registration</li>
            <li>Keep your account credentials secure</li>
            <li>Use the service for personal finance management only</li>
            <li>Not attempt to hack, reverse engineer, or misuse the service</li>
          </ul>

          <h3>3. User Accounts</h3>
          <ul>
            <li>You must be at least 18 years old to use this service</li>
            <li>One account per person</li>
            <li>You are responsible for all activity under your account</li>
          </ul>

          <h3>4. Premium Features</h3>
          <p>Premium subscriptions:</p>
          <ul>
            <li>Are billed monthly/annually as selected</li>
            <li>Auto-renew unless cancelled</li>
            <li>Provide unlimited transactions and advanced features</li>
            <li>Refunds subject to our refund policy</li>
          </ul>

          <h3>5. Limitation of Liability</h3>
          <p>We are not responsible for:</p>
          <ul>
            <li>Financial decisions made using this app</li>
            <li>Data loss due to user error</li>
            <li>Third-party service interruptions</li>
          </ul>

          <h3>6. Termination</h3>
          <p>We reserve the right to terminate accounts that violate these terms.</p>

          <h3>7. Changes to Terms</h3>
          <p>We may update these terms. Continued use means acceptance of new terms.</p>

          <h3>8. Contact</h3>
          <p>Questions? Email: <strong>support@financialmanagement.com</strong></p>
        </>
      );
    } else if (type === 'cookies') {
      title = '🍪 Cookie Policy';
      content = (
        <>
          <p><strong>Last Updated:</strong> October 2025</p>
          
          <h3>What Are Cookies?</h3>
          <p>Cookies are small text files stored on your device to help us provide a better experience.</p>

          <h3>Cookies We Use</h3>
          
          <h4>1. Essential Cookies (Required)</h4>
          <ul>
            <li><strong>Authentication Token:</strong> Keeps you logged in</li>
            <li><strong>Session Data:</strong> Maintains your session</li>
          </ul>

          <h4>2. Preference Cookies</h4>
          <ul>
            <li><strong>Theme Selection:</strong> Remembers dark/light mode</li>
            <li><strong>Language:</strong> Saves your language preference</li>
          </ul>

          <h4>3. Analytics Cookies (Optional)</h4>
          <ul>
            <li>Help us understand how you use the app</li>
            <li>Improve user experience</li>
            <li>Can be disabled in settings</li>
          </ul>

          <h3>What We DON'T Use Cookies For</h3>
          <ul>
            <li>❌ Tracking you across other websites</li>
            <li>❌ Selling your data to advertisers</li>
            <li>❌ Showing targeted ads</li>
          </ul>

          <h3>Managing Cookies</h3>
          <p>You can:</p>
          <ul>
            <li>Clear cookies from your browser settings</li>
            <li>Block cookies (but some features may not work)</li>
            <li>Manage preferences in app settings</li>
          </ul>

          <h3>Third-Party Cookies</h3>
          <p>We use cookies from:</p>
          <ul>
            <li><strong>Razorpay:</strong> For secure payment processing</li>
          </ul>

          <h3>Contact</h3>
          <p>Cookie questions? Email: <strong>support@financialmanagement.com</strong></p>
        </>
      );
    }

    setModalContent({ title, content });
    setShowModal(true);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 
              style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: isDarkMode ? '#f1f5f9' : '#1a202c',
                fontWeight: 900,
                background: 'none',
                WebkitBackgroundClip: 'initial',
                WebkitTextFillColor: isDarkMode ? '#f1f5f9' : '#1a202c'
              }}
            >
              💰 Financial Management
            </h3>
            <p>Smart budgeting made simple</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openModal('privacy'); }}>Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openModal('terms'); }}>Terms & Conditions</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openModal('cookies'); }}>Cookie Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Ramrao Adik Institute of Technology</p>
            <p>Navi Mumbai, Maharashtra</p>
            <p>support@financialmanagement.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Financial Management. All rights reserved.</p>
        </div>
      </footer>

      <PolicyModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        content={modalContent.content}
      />
    </>
  );
};

export default Footer;
