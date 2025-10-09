import React from 'react';
import '../../styles/PolicyModal.css';

const PolicyModal = ({ show, onClose, title, content }) => {
  if (!show) return null;

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <h2>{title}</h2>
          <button className="policy-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="policy-modal-body">
          {content}
        </div>
        <div className="policy-modal-footer">
          <button className="policy-modal-btn" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
