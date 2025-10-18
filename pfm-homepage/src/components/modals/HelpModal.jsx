import React from 'react';

const HelpModal = ({ show, onClose, isDarkMode }) => {
  if (!show) return null;

  const darkStyles = {
    overlay: {
      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(0, 0, 0, 0.5)'
    },
    modal: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f1f5f9' : '#1a202c'
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={darkStyles.overlay}>
      <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()} style={darkStyles.modal}>
        <div className="modal-header">
          <h2 style={{ color: isDarkMode ? '#f1f5f9' : '#667eea' }}>❓ Help & Support</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="help-content">
          <div className="help-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>📚 Getting Started</h3>
            <ul>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>How to add transactions</li>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Setting up budgets</li>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Understanding analytics</li>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Export your data</li>
            </ul>
          </div>

          <div className="help-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>💎 Premium Features</h3>
            <ul>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Unlimited transactions</li>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Advanced analytics</li>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Priority support</li>
              <li style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Custom reports</li>
            </ul>
          </div>

          <div className="help-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>📧 Contact Support</h3>
            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Need help? Reach out to us!</p>
            <button className="help-btn" style={{ color: 'white' }}>Email Support</button>
            <button className="help-btn" style={{ color: 'white' }}>Chat with Us</button>
          </div>

          <div className="help-section">
  <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>📱 Resources</h3>
  <a 
    href="#" 
    className="help-link" 
    style={{ 
      color: isDarkMode ? '#818cf8' : '#667eea',
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9'
    }}
  >
    📖 User Guide
  </a>
  <a 
    href="#" 
    className="help-link" 
    style={{ 
      color: isDarkMode ? '#818cf8' : '#667eea',
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9'
    }}
  >
    🎥 Video Tutorials
  </a>
  <a 
    href="#" 
    className="help-link" 
    style={{ 
      color: isDarkMode ? '#818cf8' : '#667eea',
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9'
    }}
  >
    ❓ FAQ
  </a>
  <a 
    href="#" 
    className="help-link" 
    style={{ 
      color: isDarkMode ? '#818cf8' : '#667eea',
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9'
    }}
  >
    🐛 Report a Bug
  </a>
</div>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;
