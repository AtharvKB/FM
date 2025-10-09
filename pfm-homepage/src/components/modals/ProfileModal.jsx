import React from 'react';

const ProfileModal = ({ show, onClose, userEmail, isPremium }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-content">
          <div className="profile-avatar">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          
          <div className="profile-info">
            <h3>{userEmail.split('@')[0]}</h3>
            <p className="profile-email">{userEmail}</p>
            {isPremium && (
              <span className="premium-badge">👑 Premium Member</span>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-box">
              <h4>Account Type</h4>
              <p>{isPremium ? 'Premium' : 'Free'}</p>
            </div>
            <div className="stat-box">
              <h4>Member Since</h4>
              <p>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-btn">Edit Profile</button>
            <button className="profile-btn secondary">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
