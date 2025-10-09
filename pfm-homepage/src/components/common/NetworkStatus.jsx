import React, { useState, useEffect } from 'react';
import './NetworkStatus.css';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
      <div className="network-status-content">
        {isOnline ? (
          <>
            <span className="network-icon">✅</span>
            <span className="network-message">Back online!</span>
          </>
        ) : (
          <>
            <span className="network-icon">⚠️</span>
            <span className="network-message">No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
