import React from 'react';

const Toast = ({ show, message, type }) => {
  if (!show) return null;

  return (
    <div className={`toast ${type}`}>
      {type === 'success' && '✅ '}
      {type === 'error' && '❌ '}
      {message}
    </div>
  );
};

export default Toast;
