import React from 'react';

const HelpModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>❓ Help & Support</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="help-content">
          <div className="help-section">
            <h3>📚 Getting Started</h3>
            <ul>
              <li>How to add transactions</li>
              <li>Setting up budgets</li>
              <li>Understanding analytics</li>
              <li>Export your data</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>💎 Premium Features</h3>
            <ul>
              <li>Unlimited transactions</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>Custom reports</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>📧 Contact Support</h3>
            <p>Need help? Reach out to us!</p>
            <button className="help-btn">Email Support</button>
            <button className="help-btn">Chat with Us</button>
          </div>

          <div className="help-section">
            <h3>📱 Resources</h3>
            <a href="#" className="help-link">📖 User Guide</a>
            <a href="#" className="help-link">🎥 Video Tutorials</a>
            <a href="#" className="help-link">❓ FAQ</a>
            <a href="#" className="help-link">🐛 Report a Bug</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
