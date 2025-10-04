import React from 'react';

const PremiumStatusPage = ({ userEmail, premiumEndDate, onBack }) => {
  const daysLeft = Math.ceil((new Date(premiumEndDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👑</div>
        
        <h1 style={{ color: '#667eea', marginBottom: '1rem' }}>
          You're Already Premium!
        </h1>
        
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Logged in as: <strong>{userEmail}</strong>
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          padding: '2rem',
          borderRadius: '15px',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
            {daysLeft} Days Left
          </div>
          <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Valid until: {new Date(premiumEndDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Your Premium Benefits:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0', color: '#4b5563' }}>✅ Unlimited expense tracking</li>
            <li style={{ padding: '0.5rem 0', color: '#4b5563' }}>✅ Advanced analytics & AI insights</li>
            <li style={{ padding: '0.5rem 0', color: '#4b5563' }}>✅ Goal tracking & recommendations</li>
            <li style={{ padding: '0.5rem 0', color: '#4b5563' }}>✅ Custom reports & exports</li>
            <li style={{ padding: '0.5rem 0', color: '#4b5563' }}>✅ Priority customer support</li>
          </ul>
        </div>

        <button 
          onClick={onBack}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PremiumStatusPage;
