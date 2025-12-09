import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  title = 'Confirm Action',
  message, 
  warningText,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  type = 'danger' // danger, warning, info
}) => {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-container" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close" onClick={onCancel}>
          ✕
        </button>
        
        <div className="confirm-content">
          <div className={`confirm-icon confirm-icon-${type}`}>
            {type === 'danger' && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'warning' && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === 'info' && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h3 className="confirm-title">{title}</h3>
          
          <p className="confirm-message">{message}</p>
          
          {warningText && (
            <p className="confirm-warning">{warningText}</p>
          )}
        </div>
        
        <div className="confirm-actions">
          <button 
            className={`confirm-btn confirm-btn-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
