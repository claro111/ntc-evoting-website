import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import FloatingCountdownTimer from '../components/FloatingCountdownTimer';
import PositionTabs from '../components/PositionTabs';
import CandidateCarousel from '../components/CandidateCarousel';
import CandidateDetailModal from '../components/CandidateDetailModal';
import FloatingBottomNavbar from '../components/FloatingBottomNavbar';
import Logo from '../components/Logo';
import './VoterHomepage.css';

const VoterHomepage = () => {
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState('closed'); // 'closed', 'active', 'upcoming'
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winners, setWinners] = useState([]);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [voterSchool, setVoterSchool] = useState('');

  useEffect(() => {
    // Fetch voter's school
    const fetchVoterSchool = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const voterRef = doc(db, 'voters', user.uid);
          const voterDoc = await getDoc(voterRef);
          if (voterDoc.exists()) {
            setVoterSchool(voterDoc.data().school || '');
          }
        } catch (error) {
          console.error('Error fetching voter school:', error);
        }
      }
    };

    fetchVoterSchool();
  }, []);

  useEffect(() => {
    console.log('VoterHomepage: Setting up real-time listeners');

    // Set up real-time listener for the current election document
    const electionRef = doc(db, 'elections', 'current');

    const unsubscribeElection = onSnapshot(
      electionRef,
      (electionDoc) => {
        if (electionDoc.exists()) {
          const electionData = {
            id: electionDoc.id,
            ...electionDoc.data(),
          };

          setElection(electionData);
          const published = electionData.resultsPublished || false;
          console.log('VoterHomepage - Election Data:', electionData);
          console.log('VoterHomepage - Results Published Flag:', published);
          setResultsPublished(published);

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
        } else {
          setElection(null);
          setVotingStatus('closed');
          setResultsPublished(false);
        }

        setLoading(false);
      },
      (err) => {
        console.error('Error fetching election data:', err);
        setError('Failed to load election information');
        setLoading(false);
      }
    );

    // Set up real-time listener for positions
    const unsubscribePositions = onSnapshot(
      collection(db, 'positions'),
      (snapshot) => {
        console.log('Positions updated:', snapshot.size);
        const positionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const sortedPositions = positionsData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPositions(sortedPositions);
        
        // Set first position as default if not already set
        if (sortedPositions.length > 0 && !selectedPosition) {
          setSelectedPosition(sortedPositions[0].name);
        }
      },
      (error) => {
        console.error('Error in positions listener:', error);
      }
    );

    // Set up real-time listener for candidates
    const unsubscribeCandidates = onSnapshot(
      collection(db, 'candidates'),
      (snapshot) => {
        console.log('Candidates updated:', snapshot.size);
        const candidatesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCandidates(candidatesData);
      },
      (error) => {
        console.error('Error in candidates listener:', error);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      console.log('VoterHomepage: Cleaning up listeners');
      unsubscribeElection();
      unsubscribePositions();
      unsubscribeCandidates();
    };
  }, []);

  // No longer need winners calculation - will show top 3 per position instead
  useEffect(() => {
    console.log('VoterHomepage - Results Published:', resultsPublished);
  }, [resultsPublished]);

  const handleSeeMore = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleSelectPosition = (position) => {
    setSelectedPosition(position);
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

  // Filter candidates by selected position
  const getFilteredCandidates = () => {
    if (!selectedPosition) {
      return [];
    }
    let positionCandidates = candidates.filter((c) => c.position === selectedPosition);
    
    // Filter Representatives by voter's school
    if (selectedPosition === 'Representatives' && voterSchool) {
      positionCandidates = positionCandidates.filter((c) => c.school === voterSchool);
    }
    
    // If results are published, sort by manual winner first, then vote count, and return top 3 with winner flag
    if (resultsPublished) {
      const sorted = [...positionCandidates].sort((a, b) => {
        // If one candidate is manually selected as winner, they should be ranked first
        if (a.manuallySelectedWinner && !b.manuallySelectedWinner) return -1;
        if (!a.manuallySelectedWinner && b.manuallySelectedWinner) return 1;
        // Otherwise sort by vote count
        return (b.voteCount || 0) - (a.voteCount || 0);
      });
      const top3 = sorted.slice(0, 3).map((candidate, index) => ({
        ...candidate,
        isWinner: true,
        rank: index + 1,
        position: selectedPosition
      }));
      
      // Reorder: [2nd place (left), 1st place (center), 3rd place (right)]
      if (top3.length === 3) {
        return [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
      } else if (top3.length === 2) {
        return [top3[1], top3[0]]; // 2nd, 1st
      }
      return top3;
    }
    
    return positionCandidates;
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

  const filteredCandidates = getFilteredCandidates();

  return (
    <div className="voter-homepage">
      {/* Logo */}
      <Logo />
      
      {/* Floating Countdown Timer */}
      <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={votingStatus} />

      {/* Position Tabs - Always show */}
      {resultsPublished && (
        <div className="results-header">
          <h2 className="results-title">🏆 Election Results - Top 3 Per Position 🏆</h2>
        </div>
      )}
      <PositionTabs
        positions={positions}
        selectedPosition={selectedPosition}
        onSelectPosition={handleSelectPosition}
      />

      {/* Main Content */}
      <div className="homepage-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading candidates...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
          </div>
        ) : (
          <div className="positions-container">
            <div className="position-section">
              <CandidateCarousel
                candidates={filteredCandidates}
                onSeeMore={handleSeeMore}
              />
            </div>
        </div>
      )}
      </div>

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Floating Bottom Navbar */}
      <FloatingBottomNavbar />
    </div>
  );
};

export default VoterHomepage;
