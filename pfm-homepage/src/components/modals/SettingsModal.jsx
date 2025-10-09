import React, { useState } from 'react';

const SettingsModal = ({ show, onClose, isDarkMode, toggleTheme }) => {
  if (!show) return null;

  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {/* Appearance */}
          <div className="settings-section">
            <h3>🎨 Appearance</h3>
            <div className="setting-item">
              <label>
                <span>Dark Mode</span>
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
            <h3>💱 Currency</h3>
            <div className="setting-item">
              <label>
                <span>Default Currency</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
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
            <h3>🔔 Notifications</h3>
            <div className="setting-item">
              <label>
                <span>Email Notifications</span>
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
            <h3>🔒 Privacy & Security</h3>
            <button className="settings-btn">Change Password</button>
            <button className="settings-btn secondary">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
