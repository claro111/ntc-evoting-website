import { useState } from 'react';
import './InputConfirmDialog.css';

const InputConfirmDialog = ({ 
  title = 'Confirm Action',
  message, 
  subtitle,
  warningItems = [],
  confirmWord = 'RESET',
  placeholder = 'Type to confirm',
  confirmButtonText = 'Confirm',
  onConfirm, 
  onCancel
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue === confirmWord) {
      onConfirm();
    }
  };

  const isValid = inputValue === confirmWord;

  return (
    <div className="input-confirm-overlay" onClick={onCancel}>
      <div className="input-confirm-container" onClick={(e) => e.stopPropagation()}>
        <div className="input-confirm-header">
          <h3 className="input-confirm-title">{title}</h3>
          <button className="input-confirm-close" onClick={onCancel}>
            ✕
          </button>
        </div>
        
        <div className="input-confirm-body">
          {/* Warning Icon and Message */}
          <div className="input-confirm-warning-section">
            <div className="input-confirm-warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="input-confirm-message">{message}</p>
            {subtitle && <p className="input-confirm-subtitle">{subtitle}</p>}
          </div>

          {/* Warning Items */}
          {warningItems.length > 0 && (
            <div className="input-confirm-warning-box">
              <p className="input-confirm-warning-title">Important:</p>
              <ul className="input-confirm-warning-list">
                {warningItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Input Field */}
          <div className="input-confirm-field">
            <label className="input-confirm-label">
              Type <strong>{confirmWord}</strong> to confirm:
            </label>
            <input
              type="text"
              className="input-confirm-input"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        
        <div className="input-confirm-footer">
          <button 
            className={`input-confirm-btn input-confirm-btn-confirm ${!isValid ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!isValid}
          >
            {confirmButtonText}
          </button>
          <button 
            className="input-confirm-btn input-confirm-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputConfirmDialog;
