import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const VoteReceiptPage = () => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVoteReceipt();
  }, []);

  const fetchVoteReceipt = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch vote receipt for current user
      const receiptsRef = collection(db, 'vote_receipts');
      const receiptQuery = query(receiptsRef, where('voterId', '==', user.uid));
      const receiptSnapshot = await getDocs(receiptQuery);

      if (!receiptSnapshot.empty) {
        const receiptData = {
          id: receiptSnapshot.docs[0].id,
          ...receiptSnapshot.docs[0].data(),
        };
        setReceipt(receiptData);
      } else {
        setError('No vote receipt found. You may not have voted yet.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching vote receipt:', err);
      setError('Failed to load vote receipt');
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/voter/profile');
  };

  const groupByPosition = () => {
    if (!receipt || !receipt.candidates) return {};

    const grouped = {};
    receipt.candidates.forEach((candidate) => {
      const positionName = candidate.positionName || 'Unknown Position';
      if (!grouped[positionName]) {
        grouped[positionName] = [];
      }
      grouped[positionName].push(candidate);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const groupedCandidates = groupByPosition();
  const timestamp = receipt?.timestamp?.toDate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
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
            <h1 className="text-3xl font-bold text-gray-800">VOTE RECEIPT</h1>
          </div>

          {/* Message Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              This receipt confirms your vote was successfully recorded.
            </p>
            {timestamp && (
              <p className="text-sm text-blue-600 text-center mt-2">
                Submitted on {timestamp.toLocaleDateString()} at{' '}
                {timestamp.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Your Votes Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Votes</h2>

          <div className="space-y-6">
            {Object.entries(groupedCandidates).map(([positionName, candidates]) => (
              <div key={positionName} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">
                  {positionName}
                </h3>
                <div className="space-y-2">
                  {candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-green-600"
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
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {candidate.candidateName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                Important Notice
              </p>
              <p className="text-sm text-yellow-700">
                Your vote has been recorded and cannot be changed. This receipt is for
                your records only and does not affect the anonymity of your vote.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};

export default VoteReceiptPage;
