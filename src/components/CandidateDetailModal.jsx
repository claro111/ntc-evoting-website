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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-header">
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
          <h2 className="modal-candidate-name">{candidate.name}</h2>
          <p className="modal-candidate-position">{candidate.position}</p>
          {candidate.school && (
            <p className="modal-candidate-school">School: {candidate.school}</p>
          )}
        </div>

        <div className="modal-body">
          {candidate.bio && (
            <div className="modal-section">
              <h3 className="section-title">Bio</h3>
              <div
                className="section-content"
                dangerouslySetInnerHTML={{ __html: candidate.bio }}
              />
            </div>
          )}

          {candidate.platform && (
            <div className="modal-section">
              <h3 className="section-title">Platform</h3>
              <div
                className="section-content"
                dangerouslySetInnerHTML={{ __html: candidate.platform }}
              />
            </div>
          )}

          {!candidate.bio && !candidate.platform && (
            <p className="no-info">No additional information available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
