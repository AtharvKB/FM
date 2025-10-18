import React, { useState } from 'react';

const SettingsModal = ({ show, onClose, isDarkMode, toggleTheme }) => {
  if (!show) return null;

  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState(true);

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={darkStyles.modal}>
        <div className="modal-header">
          <h2 style={{ color: isDarkMode ? '#f1f5f9' : '#667eea' }}>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {/* Appearance */}
          <div className="settings-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>🎨 Appearance</h3>
            <div className="setting-item">
              <label>
                <span style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Dark Mode</span>
                <input 
                  type="checkbox" 
                  checked={isDarkMode} 
                  onChange={toggleTheme}
                />
              </label>
            </div>
          </div>

          {/* Currency */}
          <div className="settings-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>💱 Currency</h3>
            <div className="setting-item">
              <label>
                <span style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Default Currency</span>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                    color: isDarkMode ? '#f1f5f9' : '#1a202c',
                    borderColor: isDarkMode ? '#475569' : '#e2e8f0'
                  }}
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>🔔 Notifications</h3>
            <div className="setting-item">
              <label>
                <span style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>Email Notifications</span>
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="settings-section">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>🔒 Privacy & Security</h3>
            <button className="settings-btn" style={{ color: 'white' }}>Change Password</button>
            <button 
              className="settings-btn secondary" 
              style={{ 
                color: '#ef4444',
                backgroundColor: 'transparent',
                borderColor: '#ef4444'
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
