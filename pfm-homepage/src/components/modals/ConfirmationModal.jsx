import React from 'react';

const ConfirmationModal = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  isDeleting 
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirmation-modal">
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="confirmation-body">
          <div className="warning-icon">⚠️</div>
          <p>{message}</p>
        </div>
        <div className="confirmation-actions">
          <button 
            className="cancel-btn" 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="confirm-btn danger" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
