import './CandidateCard.css';

const CandidateCard = ({ candidate, showVoteButton = false, onVote, isSelected = false }) => {
  if (!candidate) return null;

  const handleVoteClick = () => {
    if (onVote) {
      onVote(candidate);
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 transition-all ${
      isSelected ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Candidate Photo */}
          <div className="candidate-photo">
            {candidate.photoUrl ? (
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
              />
            ) : (
              <div className="candidate-photo-placeholder">
                <span>
                  {candidate.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
            {candidate.positionName && (
              <p className="text-sm text-gray-600">{candidate.positionName}</p>
            )}
          </div>

          {/* Vote Button or Selected Indicator */}
          {showVoteButton && (
            <div className="flex-shrink-0">
              {isSelected ? (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Selected
                </div>
              ) : (
                <button
                  onClick={handleVoteClick}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Vote
                </button>
              )}
            </div>
          )}
        </div>

        {/* Candidate Bio (if available) */}
        {candidate.bio && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div 
              className="text-sm text-gray-600 line-clamp-3 candidate-bio-preview"
              dangerouslySetInnerHTML={{ __html: candidate.bio }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
