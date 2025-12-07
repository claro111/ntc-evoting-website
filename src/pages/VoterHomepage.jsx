import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import CountdownTimer from '../components/CountdownTimer';
import CandidateCard from '../components/CandidateCard';

const VoterHomepage = () => {
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState('closed'); // 'closed', 'active', 'upcoming'
  const [featuredCandidate, setFeaturedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up real-time listener for elections
    const electionsRef = collection(db, 'elections');
    const activeElectionQuery = query(
      electionsRef,
      where('status', 'in', ['active', 'draft']),
      limit(1)
    );
    
    const unsubscribe = onSnapshot(
      activeElectionQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const electionData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          };
          
          setElection(electionData);
          
          // Determine voting status
          const now = new Date();
          const startTime = electionData.startTime?.toDate();
          const endTime = electionData.endTime?.toDate();
          
          if (electionData.status === 'active' && startTime && endTime) {
            if (now >= startTime && now <= endTime) {
              setVotingStatus('active');
            } else if (now < startTime) {
              setVotingStatus('upcoming');
            } else {
              setVotingStatus('closed');
            }
          } else {
            setVotingStatus('closed');
          }
          
          // Fetch featured candidate
          fetchFeaturedCandidate(electionData.id);
        } else {
          setElection(null);
          setVotingStatus('closed');
          setFeaturedCandidate(null);
        }
        
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching election data:', err);
        setError('Failed to load election information');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const fetchFeaturedCandidate = async (electionId) => {
    try {
      const candidatesRef = collection(db, 'candidates');
      const candidateQuery = query(
        candidatesRef,
        where('electionId', '==', electionId),
        limit(1)
      );
      
      const candidateSnapshot = await getDocs(candidateQuery);
      
      if (!candidateSnapshot.empty) {
        const candidateData = {
          id: candidateSnapshot.docs[0].id,
          ...candidateSnapshot.docs[0].data()
        };
        
        // Fetch position name
        if (candidateData.positionId) {
          const positionDoc = await getDoc(doc(db, 'positions', candidateData.positionId));
          if (positionDoc.exists()) {
            candidateData.positionName = positionDoc.data().name;
          }
        }
        
        setFeaturedCandidate(candidateData);
      }
    } catch (err) {
      console.error('Error fetching featured candidate:', err);
    }
  };

  const handleVoteNowClick = () => {
    if (votingStatus === 'active') {
      navigate('/voter/voting');
    }
  };

  const getTargetDate = () => {
    if (!election) return null;
    
    if (votingStatus === 'upcoming' && election.startTime) {
      return election.startTime.toDate();
    } else if (votingStatus === 'active' && election.endTime) {
      return election.endTime.toDate();
    }
    
    return null;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold">NTC E-Voting</h1>
        <p className="text-blue-100 mt-1">Welcome to the voting system</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Voting Status Message */}
        {votingStatus === 'closed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-semibold">Voting is closed</p>
            <p className="text-red-600 text-sm mt-1">
              There are no active elections at this time
            </p>
          </div>
        )}

        {votingStatus === 'upcoming' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-semibold">Voting is closed</p>
            <p className="text-yellow-600 text-sm mt-1">
              Voting will begin soon
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        {(votingStatus === 'upcoming' || votingStatus === 'active') && getTargetDate() && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {votingStatus === 'upcoming' ? 'Voting starts in:' : 'Voting ends in:'}
            </h2>
            <CountdownTimer targetDate={getTargetDate()} votingStatus={votingStatus} />
          </div>
        )}

        {/* Featured Candidate */}
        {featuredCandidate && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Featured Candidate</h2>
            <CandidateCard candidate={featuredCandidate} />
          </div>
        )}

        {/* Vote Now Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={handleVoteNowClick}
            disabled={votingStatus !== 'active'}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              votingStatus === 'active'
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Vote Now
          </button>
          <p className="text-center text-gray-500 text-sm mt-2">{getCurrentDate()}</p>
        </div>

        {/* Election Info */}
        {election && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{election.title}</h2>
            <p className="text-gray-600 text-sm">{election.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterHomepage;
