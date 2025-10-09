import React from 'react';

const LimitReachedModal = ({ show, onClose, onUpgrade }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '15px',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>
          Monthly Limit Reached!
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          You've used all <strong>10 free transactions</strong> this month.
          Upgrade to Premium for unlimited transactions!
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.8rem 1.5rem',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
          </button>
          <button 
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            style={{
              padding: '0.8rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⭐ Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;
