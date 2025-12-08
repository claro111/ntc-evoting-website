import { useEffect } from 'react';
import './CandidateDetailModal.css';

const CandidateDetailModal = ({ candidate, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Handle ESC key press
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
          <svg
            className="close-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="modal-content">
          <div className="modal-photo-container">
            {candidate.photoUrl ? (
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
                className="modal-candidate-photo"
              />
            ) : (
              <div className="modal-photo-placeholder">
                <span className="modal-candidate-initials">
                  {candidate.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>

          <div className="modal-info">
            <h2 className="modal-candidate-name">{candidate.name}</h2>
            <p className="modal-candidate-position">{candidate.position}</p>
            {candidate.partylist && (
              <p className="modal-candidate-partylist">
                <span className="partylist-label">Partylist:</span> {candidate.partylist}
              </p>
            )}
          </div>

          {candidate.bio && (
            <div className="modal-platform">
              <h3 className="platform-title">Platform</h3>
              <div
                className="platform-content"
                dangerouslySetInnerHTML={{ __html: candidate.bio }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
