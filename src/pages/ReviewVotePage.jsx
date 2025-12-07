import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const ReviewVotePage = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Retrieve selected votes from sessionStorage
    const storedVotes = sessionStorage.getItem('selectedVotes');
    if (storedVotes) {
      setSelectedCandidates(JSON.parse(storedVotes));
    } else {
      // If no votes found, redirect back to voting page
      navigate('/voter/voting');
    }
  }, [navigate]);

  const groupByPosition = () => {
    const grouped = {};
    selectedCandidates.forEach((candidate) => {
      const positionName = candidate.positionName || 'Unknown Position';
      if (!grouped[positionName]) {
        grouped[positionName] = [];
      }
      grouped[positionName].push(candidate);
    });
    return grouped;
  };

  const handleBackToVoting = () => {
    navigate('/voter/voting');
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  const handleSubmitVote = async () => {
    try {
      setSubmitting(true);
      setError('');

      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get voter document
      const voterRef = doc(db, 'voters', user.uid);
      const voterDoc = await getDoc(voterRef);

      if (!voterDoc.exists()) {
        throw new Error('Voter record not found');
      }

      const voterData = voterDoc.data();

      // Check if voter has already voted
      if (voterData.hasVoted) {
        throw new Error('You have already voted');
      }

      // Create anonymized vote records (no voter ID)
      const votePromises = selectedCandidates.map((candidate) =>
        addDoc(collection(db, 'votes'), {
          candidateId: candidate.id,
          positionId: candidate.positionId,
          electionId: candidate.electionId,
          timestamp: serverTimestamp(),
        })
      );

      await Promise.all(votePromises);

      // Create vote receipt (with voter ID)
      await addDoc(collection(db, 'vote_receipts'), {
        voterId: user.uid,
        candidates: selectedCandidates.map((c) => ({
          candidateId: c.id,
          candidateName: c.name,
          positionName: c.positionName,
        })),
        timestamp: serverTimestamp(),
      });

      // Update voter's hasVoted status
      await updateDoc(voterRef, {
        hasVoted: true,
        votedAt: serverTimestamp(),
      });

      // Clear session storage
      sessionStorage.removeItem('selectedVotes');

      // Navigate to confirmation page
      navigate('/voter/vote-confirmation');
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err.message || 'Failed to submit vote. Please try again.');
      setSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const groupedCandidates = groupByPosition();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Review Your Vote
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Please review your selections before submitting
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Selected Candidates by Position */}
        <div className="space-y-6 mb-6">
          {Object.entries(groupedCandidates).map(([positionName, candidates]) => (
            <div key={positionName} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-blue-600 mb-4">{positionName}</h2>
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {/* Candidate Photo */}
                    {candidate.photoUrl ? (
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                        <span className="text-blue-600 text-xl font-bold">
                          {candidate.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {candidate.name}
                      </h3>
                      {candidate.partylist && (
                        <p className="text-sm text-blue-600 font-medium">
                          {candidate.partylist}
                        </p>
                      )}
                    </div>

                    {/* Checkmark */}
                    <div className="flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBackToVoting}
            disabled={submitting}
            className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Back to Voting
          </button>
          <button
            onClick={handleConfirmSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Confirm and Submit Vote
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Vote Submission
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your vote? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCancelConfirm}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitVote}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    'Yes, Submit'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewVotePage;
