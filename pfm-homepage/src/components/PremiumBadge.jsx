import React from 'react';

const PremiumBadge = ({ isPremium, premiumEndDate }) => {
  if (!isPremium) return null;

  const daysLeft = Math.ceil((new Date(premiumEndDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#78350f',
      borderRadius: '20px',
      fontWeight: 600,
      fontSize: '0.9rem',
      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
      marginBottom: '1rem'
    }}>
      <span>👑</span>
      <span>Premium</span>
      <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
      </span>
    </div>
  );
};

export default PremiumBadge;
