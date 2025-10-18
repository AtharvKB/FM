import React from 'react';

const ProfileModal = ({ show, onClose, userEmail, isPremium, isDarkMode }) => {
  if (!show) return null;

  const darkStyles = {
    overlay: {
      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(0, 0, 0, 0.5)'
    },
    modal: {
      backgroundColor: isDarkMode ? '#1e293b !important' : '#ffffff !important',
      color: isDarkMode ? '#f1f5f9 !important' : '#1a202c !important'
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={darkStyles.overlay}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={darkStyles.modal}>
        <div className="modal-header">
          <h2 style={{ color: isDarkMode ? '#f1f5f9' : '#667eea' }}>👤 Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-content">
          <div className="profile-avatar">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          
          <div className="profile-info">
            <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>{userEmail.split('@')[0]}</h3>
            <p className="profile-email" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{userEmail}</p>
            {isPremium && (
              <span className="premium-badge">👑 Premium Member</span>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-box" style={{ 
              backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
              borderColor: isDarkMode ? '#475569' : '#e2e8f0'
            }}>
              <h4 style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>ACCOUNT TYPE</h4>
              <p style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>{isPremium ? 'Premium' : 'Free'}</p>
            </div>
            <div className="stat-box" style={{ 
              backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
              borderColor: isDarkMode ? '#475569' : '#e2e8f0'
            }}>
              <h4 style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>MEMBER SINCE</h4>
              <p style={{ color: isDarkMode ? '#f1f5f9' : '#1a202c' }}>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-btn" style={{ color: 'white' }}>Edit Profile</button>
            <button className="profile-btn secondary" style={{ 
              backgroundColor: isDarkMode ? '#334155' : 'transparent',
              color: isDarkMode ? '#667eea' : '#667eea',
              borderColor: '#667eea'
            }}>Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
