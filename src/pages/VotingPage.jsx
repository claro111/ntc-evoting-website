import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import CandidateCard from '../components/CandidateCard';

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [votingClosed, setVotingClosed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState(null);

  useEffect(() => {
    // Set up real-time listener for active election
    const electionsRef = collection(db, 'elections');
    const activeElectionQuery = query(
      electionsRef,
      where('status', '==', 'active')
    );

    const unsubscribeElection = onSnapshot(
      activeElectionQuery,
      (electionSnapshot) => {
        if (!electionSnapshot.empty) {
          const electionData = {
            id: electionSnapshot.docs[0].id,
            ...electionSnapshot.docs[0].data(),
          };

          setElection(electionData);

          // Check if voting is currently active
          const now = new Date();
          const startTime = electionData.startTime?.toDate();
          const endTime = electionData.endTime?.toDate();

          if (startTime && endTime && now >= startTime && now <= endTime) {
            setVotingClosed(false);
          } else {
            setVotingClosed(true);
          }

          // Set up real-time listener for positions
          const positionsRef = collection(db, 'positions');
          const positionsQuery = query(
            positionsRef,
            where('electionId', '==', electionData.id)
          );
          
          const unsubscribePositions = onSnapshot(positionsQuery, (positionsSnapshot) => {
            const positionsData = positionsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPositions(positionsData);
          });

          // Set up real-time listener for candidates
          const candidatesRef = collection(db, 'candidates');
          const candidatesQuery = query(
            candidatesRef,
            where('electionId', '==', electionData.id)
          );
          
          const unsubscribeCandidates = onSnapshot(candidatesQuery, async (candidatesSnapshot) => {
            const candidatesData = await Promise.all(
              candidatesSnapshot.docs.map(async (candidateDoc) => {
                const candidateData = {
                  id: candidateDoc.id,
                  ...candidateDoc.data(),
                };

                // Fetch position name
                if (candidateData.positionId) {
                  const positionDoc = await getDoc(
                    doc(db, 'positions', candidateData.positionId)
                  );
                  if (positionDoc.exists()) {
                    candidateData.positionName = positionDoc.data().name;
                  }
                }

                return candidateData;
              })
            );

            setCandidates(candidatesData);
            setLoading(false);
          });

          // Store unsubscribe functions for cleanup
          return () => {
            unsubscribePositions();
            unsubscribeCandidates();
          };
        } else {
          setElection(null);
          setVotingClosed(true);
          setCandidates([]);
          setPositions([]);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching election data:', err);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribeElection();
  }, []);

  const handleVoteSelection = (candidate) => {
    if (votingClosed) return;

    setSelectedVotes((prev) => {
      const newVotes = { ...prev };

      // Check if this position already has a selection
      if (newVotes[candidate.positionId] === candidate.id) {
        // Deselect if clicking the same candidate
        delete newVotes[candidate.positionId];
      } else {
        // Select this candidate for this position
        newVotes[candidate.positionId] = candidate.id;
      }

      return newVotes;
    });
  };

  const handleProceedToReview = () => {
    // Store selected votes in sessionStorage for review page
    const selectedCandidates = candidates.filter((c) =>
      Object.values(selectedVotes).includes(c.id)
    );
    sessionStorage.setItem(
      'selectedVotes',
      JSON.stringify(selectedCandidates)
    );
    navigate('/voter/review-vote');
  };

  const filterCandidates = () => {
    return candidates.filter((candidate) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Position filter
      const matchesPosition =
        positionFilter === 'all' || candidate.positionId === positionFilter;

      return matchesSearch && matchesPosition;
    });
  };

  const groupCandidatesByPosition = () => {
    const filtered = filterCandidates();
    const grouped = {};

    filtered.forEach((candidate) => {
      if (!grouped[candidate.positionId]) {
        grouped[candidate.positionId] = {
          position: positions.find((p) => p.id === candidate.positionId),
          candidates: [],
        };
      }
      grouped[candidate.positionId].candidates.push(candidate);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  const groupedCandidates = groupCandidatesByPosition();
  const hasSelections = Object.keys(selectedVotes).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Candidates</h1>
          {votingClosed && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold text-center">
                Voting is currently closed
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Position Filter */}
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Positions</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidates by Position */}
        <div className="space-y-8">
          {Object.keys(groupedCandidates).length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No candidates found</p>
            </div>
          ) : (
            Object.entries(groupedCandidates).map(
              ([positionId, { position, candidates: positionCandidates }]) => (
                <div key={positionId} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {position?.name || 'Unknown Position'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positionCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        showVoteButton={!votingClosed}
                        onVote={handleVoteSelection}
                        isSelected={selectedVotes[candidate.positionId] === candidate.id}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Review Selections Button */}
        {!votingClosed && hasSelections && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleProceedToReview}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Review Selections
              <span className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {Object.keys(selectedVotes).length}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;
