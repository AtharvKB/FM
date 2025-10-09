import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton skeleton-header"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
    );
  }

  if (type === 'transaction') {
    return (
      <div className="skeleton-transaction">
        <div className="skeleton skeleton-circle"></div>
        <div className="skeleton-transaction-details">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
        <div className="skeleton skeleton-amount"></div>
      </div>
    );
  }

  return (
    <div className="skeleton skeleton-default"></div>
  );
};

export default LoadingSkeleton;
