import { useEffect, useState } from 'react';
import './SystemNotification.css';

const SystemNotification = ({ isVisible, type, title, message, onClose, duration = 8000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible && !show) return null;

  const getIcon = () => {
    if (type === 'voting-started') {
      return (
        <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (type === 'voting-ended') {
      return (
        <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (type === 'new-announcement') {
      return (
        <svg className="notification-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`system-notification ${type} ${show ? 'show' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="notification-text">
          <div className="notification-label">{title}</div>
          <h3 className="notification-title">{message.split('\n')[0]}</h3>
          {message.split('\n')[1] && (
            <p className="notification-message">{message.split('\n')[1]}</p>
          )}
        </div>
        <button className="notification-close" onClick={handleClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default SystemNotification;
