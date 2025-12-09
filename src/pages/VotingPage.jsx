import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Logo from '../components/Logo';
import FloatingBottomNavbar from '../components/FloatingBottomNavbar';
import FloatingCountdownTimer from '../components/FloatingCountdownTimer';
import './VotingPage.css';

const VotingPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [abstainedPositions, setAbstainedPositions] = useState({});
  const [votingClosed, setVotingClosed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activePositionTab, setActivePositionTab] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [election, setElection] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [voterSchool, setVoterSchool] = useState('');

  useEffect(() => {
    // Check if user has already voted and get voter's school
    const checkVotingStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const voterRef = doc(db, 'voters', user.uid);
          const voterDoc = await getDoc(voterRef);
          if (voterDoc.exists()) {
            const voterData = voterDoc.data();
            setHasVoted(voterData.hasVoted || false);
            setVoterSchool(voterData.school || '');
          }
        } catch (error) {
          console.error('Error checking voting status:', error);
        }
      }
    };

    checkVotingStatus();
  }, []);

  useEffect(() => {
    // Set up real-time listener for positions
    const positionsRef = collection(db, 'positions');
    const unsubscribePositions = onSnapshot(positionsRef, (positionsSnapshot) => {
      const positionsData = positionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPositions(positionsData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    });

    // Set up real-time listener for candidates
    const candidatesRef = collection(db, 'candidates');
    const unsubscribeCandidates = onSnapshot(candidatesRef, (candidatesSnapshot) => {
      const candidatesData = candidatesSnapshot.docs.map((candidateDoc) => ({
        id: candidateDoc.id,
        ...candidateDoc.data(),
        positionName: candidateDoc.data().position,
      }));

      setCandidates(candidatesData);
      setLoading(false);
    });

    // Set up real-time listener for the current election document
    const electionRef = doc(db, 'elections', 'current');

    const unsubscribeElection = onSnapshot(electionRef, (electionDoc) => {
      if (electionDoc.exists()) {
        const electionData = {
          id: electionDoc.id,
          ...electionDoc.data(),
        };

        setElection(electionData);
        const published = electionData.resultsPublished || false;
        console.log('VotingPage - Election Data:', electionData);
        console.log('VotingPage - Results Published Flag:', published);
        setResultsPublished(published);

        const now = new Date();
        const startTime = electionData.startTime?.toDate();
        const endTime = electionData.endTime?.toDate();

        if (electionData.status === 'active' && startTime && endTime && now >= startTime && now <= endTime) {
          setVotingClosed(false);
        } else {
          setVotingClosed(true);
        }
      } else {
        setElection(null);
        setVotingClosed(true);
        setResultsPublished(false);
      }
    });

    return () => {
      unsubscribePositions();
      unsubscribeCandidates();
      unsubscribeElection();
    };
  }, []);

  const handleVoteSelection = (candidate) => {
    if (votingClosed) return;

    setSelectedVotes((prev) => {
      const newVotes = { ...prev };
      const positionKey = candidate.position || candidate.positionName;
      
      // Clear abstain if voting for this position
      setAbstainedPositions((prevAbstain) => {
        const newAbstain = { ...prevAbstain };
        delete newAbstain[positionKey];
        return newAbstain;
      });
      
      // Find the position to get maxSelection
      const position = positions.find(p => p.name === positionKey);
      const maxSelection = position?.maxSelection || 1;

      if (maxSelection === 1) {
        // Single selection - toggle behavior
        if (newVotes[positionKey] === candidate.id) {
          delete newVotes[positionKey];
        } else {
          newVotes[positionKey] = candidate.id;
        }
      } else {
        // Multiple selection - array behavior
        const currentSelections = newVotes[positionKey] || [];
        const candidateIndex = currentSelections.indexOf(candidate.id);

        if (candidateIndex > -1) {
          // Remove if already selected
          const updatedSelections = currentSelections.filter(id => id !== candidate.id);
          if (updatedSelections.length === 0) {
            delete newVotes[positionKey];
          } else {
            newVotes[positionKey] = updatedSelections;
          }
        } else {
          // Add if not at max
          if (currentSelections.length < maxSelection) {
            newVotes[positionKey] = [...currentSelections, candidate.id];
          }
        }
      }

      return newVotes;
    });
  };

  const handleAbstain = (positionName) => {
    if (votingClosed) return;

    setAbstainedPositions((prev) => {
      const newAbstain = { ...prev };
      
      if (newAbstain[positionName]) {
        // Toggle off abstain
        delete newAbstain[positionName];
      } else {
        // Set abstain and clear any votes for this position
        newAbstain[positionName] = true;
        setSelectedVotes((prevVotes) => {
          const newVotes = { ...prevVotes };
          delete newVotes[positionName];
          return newVotes;
        });
      }
      
      return newAbstain;
    });
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleProceedToReview = () => {
    // Collect all selected candidate IDs from both single values and arrays
    const selectedCandidateIds = [];
    Object.values(selectedVotes).forEach(vote => {
      if (Array.isArray(vote)) {
        selectedCandidateIds.push(...vote);
      } else {
        selectedCandidateIds.push(vote);
      }
    });

    const selectedCandidates = candidates
      .filter((c) => selectedCandidateIds.includes(c.id))
      .map((candidate) => ({
        ...candidate,
        positionName: candidate.position || candidate.positionName,
      }));
    
    sessionStorage.setItem('selectedVotes', JSON.stringify(selectedCandidates));
    sessionStorage.setItem('abstainedPositions', JSON.stringify(abstainedPositions));
    navigate('/voter/review-vote');
  };

  const getCandidatesForPosition = (positionName) => {
    let filteredCandidates = candidates.filter((c) => c.position === positionName);
    
    // Filter Representatives by voter's school
    if (positionName === 'Representatives' && voterSchool) {
      filteredCandidates = filteredCandidates.filter((c) => c.school === voterSchool);
    }
    
    return filteredCandidates;
  };

  const getDisplayedPositions = () => {
    if (activePositionTab === null) {
      return positions;
    }
    return [positions[activePositionTab]];
  };

  const getTargetDate = () => {
    if (!election) return null;
    
    const now = new Date();
    const startTime = election.startTime?.toDate();
    const endTime = election.endTime?.toDate();

    if (startTime && now < startTime) {
      return startTime;
    } else if (endTime && now < endTime) {
      return endTime;
    }
    
    return null;
  };

  const getVotingStatus = () => {
    if (!election) return 'closed';
    
    // Check if admin manually closed the voting
    if (election.status === 'closed') return 'closed';
    
    const now = new Date();
    const startTime = election.startTime?.toDate();
    const endTime = election.endTime?.toDate();

    if (startTime && endTime) {
      if (now < startTime) return 'upcoming';
      if (now >= startTime && now <= endTime) return 'active';
    }
    
    return 'closed';
  };

  if (loading) {
    return (
      <div className="voting-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading candidates...</p>
      </div>
    );
  }

  const displayedPositions = getDisplayedPositions();

  return (
    <div className="voting-page">
      {/* Logo */}
      <Logo />

      {/* Floating Countdown Timer */}
      <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={getVotingStatus()} />

      {/* Progress Bar */}
      <div className="voting-progress-container">
        <div className="voting-progress-bar">
          <div className="progress-fill"></div>
        </div>
        <div className="voting-progress-steps">
          <div className="progress-step active">
            <span>SELECT</span>
          </div>
          <div className="progress-step">
            <span>REVIEW</span>
          </div>
          <div className="progress-step">
            <span>CONFIRMATION</span>
          </div>
        </div>
      </div>

      {/* Position Tabs */}
      <div className="voting-position-tabs-container">
        <div className="voting-position-tabs">
          <button
            className={`voting-position-tab ${activePositionTab === null ? 'active' : ''}`}
            onClick={() => setActivePositionTab(null)}
          >
            ALL
          </button>
          {positions.map((position, index) => (
            <button
              key={position.id}
              className={`voting-position-tab ${activePositionTab === index ? 'active' : ''}`}
              onClick={() => setActivePositionTab(index)}
            >
              {position.name}
            </button>
          ))}
        </div>
      </div>

      {/* Voting Closed or Already Voted Banner */}
      {(votingClosed || hasVoted) && (
        <div className="voting-closed-banner" style={hasVoted ? { backgroundColor: '#e0f2fe', borderColor: '#0ea5e9', color: '#0369a1' } : {}}>
          {hasVoted 
            ? 'You have already submitted your vote. You can browse candidates but cannot vote again.'
            : 'Voting is currently closed'}
        </div>
      )}

      {/* Main Content */}
      {resultsPublished ? (
        // Results View
        <div className="results-content">
          <h2 className="results-title">Election Results</h2>
          {displayedPositions.map((position) => {
            const positionCandidates = getCandidatesForPosition(position.name)
              .sort((a, b) => {
                // If one candidate is manually selected as winner, they should be ranked first
                if (a.manuallySelectedWinner && !b.manuallySelectedWinner) return -1;
                if (!a.manuallySelectedWinner && b.manuallySelectedWinner) return 1;
                // Otherwise sort by vote count
                return (b.voteCount || 0) - (a.voteCount || 0);
              });
            const totalVotes = positionCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
            const winner = positionCandidates[0];

            return (
              <div key={position.id} className="results-position-section">
                <h3 className="results-position-title">{position.name}</h3>
                <div className="results-candidates-list">
                  {positionCandidates.map((candidate, index) => {
                    const voteCount = candidate.voteCount || 0;
                    const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                    const isWinner = candidate.manuallySelectedWinner || candidate.id === winner?.id;

                    return (
                      <div key={candidate.id} className={`results-candidate-card ${isWinner ? 'winner' : ''}`}>
                        <div className="results-rank">#{index + 1}</div>
                        <div className="results-candidate-photo">
                          {candidate.photoUrl ? (
                            <img src={candidate.photoUrl} alt={candidate.name} />
                          ) : (
                            <div className="results-photo-placeholder">
                              {candidate.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="results-candidate-info">
                          <h4>{candidate.name}</h4>
                          {isWinner && <span className="winner-badge">🏆 Winner</span>}
                        </div>
                        <div className="results-stats">
                          <div className="results-votes">{voteCount} votes</div>
                          <div className="results-percentage">{percentage}%</div>
                        </div>
                        <div className="results-bar">
                          <div className="results-bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Original Voting View
        <div className="voting-content">
          {displayedPositions.map((position) => {
            const positionCandidates = getCandidatesForPosition(position.name);
            const maxSelection = position.maxSelection || 1;
            const positionVotes = selectedVotes[position.name];
            const selectedCount = Array.isArray(positionVotes) ? positionVotes.length : (positionVotes ? 1 : 0);

            const isAbstained = abstainedPositions[position.name];

            return (
              <div key={position.id} className="voting-position-section">
              {/* Position Header */}
              <div className="voting-position-header">
                <div className="position-info">
                  <h2 className="position-title">{position.name}</h2>
                  {position.name === 'Representatives' && voterSchool && (
                    <p className="position-school-info">Showing candidates from your school: {voterSchool}</p>
                  )}
                  <p className="position-selected">
                    {isAbstained ? 'ABSTAINED' : `${selectedCount} SELECTED`}
                  </p>
                </div>
                <div className="position-badge">Select up to {maxSelection}</div>
              </div>

              {/* Candidates Heading */}
              <h3 className="voting-candidates-heading">
                Choose your preferred candidate(s) or abstain:
              </h3>
              <p className="voting-position-label">{position.name.toUpperCase()}</p>

              {/* Abstain Button */}
              <div className="voting-abstain-container">
                <button
                  className={`voting-btn-abstain ${isAbstained ? 'abstained' : ''}`}
                  onClick={() => handleAbstain(position.name)}
                  disabled={votingClosed || hasVoted}
                >
                  {isAbstained ? '✓ ABSTAINED' : 'ABSTAIN FROM VOTING'}
                </button>
                {isAbstained && (
                  <p className="abstain-note">You chose not to vote for this position</p>
                )}
              </div>

              {/* Candidates List */}
              <div className={`voting-candidates-list ${isAbstained ? 'abstained' : ''}`}>
                {positionCandidates.map((candidate) => {
                  const positionVotes = selectedVotes[position.name];
                  const isSelected = Array.isArray(positionVotes) 
                    ? positionVotes.includes(candidate.id)
                    : positionVotes === candidate.id;

                  return (
                    <div
                      key={candidate.id}
                      className={`voting-candidate-card ${isSelected ? 'selected' : ''} ${isAbstained ? 'disabled' : ''}`}
                    >
                      <div className="voting-candidate-avatar">
                        {candidate.photoUrl ? (
                          <img src={candidate.photoUrl} alt={candidate.name} />
                        ) : (
                          <div className="voting-avatar-placeholder">
                            {candidate.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="voting-candidate-info">
                        <h4>{candidate.name}</h4>
                        <p>{position.name}{candidate.school ? ` - ${candidate.school}` : ''}</p>
                      </div>
                      <div className="voting-candidate-actions">
                        <button
                          className="voting-btn-view"
                          onClick={() => handleViewCandidate(candidate)}
                        >
                          VIEW
                        </button>
                        <button
                          className="voting-btn-vote"
                          onClick={() => handleVoteSelection(candidate)}
                          disabled={votingClosed || hasVoted || isAbstained}
                        >
                          {(votingClosed || hasVoted) ? 'VOTED' : (isSelected ? 'SELECTED' : 'VOTE')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Review Selections Button - Floating above navbar */}
      {!votingClosed && !hasVoted && !resultsPublished && (
        <div className="voting-review-button-container">
          <button 
            className="voting-btn-review" 
            onClick={handleProceedToReview}
            disabled={Object.keys(selectedVotes).length === 0 && Object.keys(abstainedPositions).length === 0}
          >
            Review Selections
            {(Object.keys(selectedVotes).length > 0 || Object.keys(abstainedPositions).length > 0) && (
              <span className="vote-count-badge">
                {(() => {
                  // Count total selected candidates (handle both single values and arrays)
                  let totalCount = 0;
                  Object.values(selectedVotes).forEach(vote => {
                    if (Array.isArray(vote)) {
                      totalCount += vote.length;
                    } else {
                      totalCount += 1;
                    }
                  });
                  // Add abstained positions count
                  totalCount += Object.keys(abstainedPositions).length;
                  return totalCount;
                })()}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Floating Bottom Navbar */}
      <FloatingBottomNavbar />

      {/* View Candidate Modal */}
      {viewModalOpen && selectedCandidate && (
        <div className="voting-modal-overlay" onClick={closeViewModal}>
          <div className="voting-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="voting-modal-close" onClick={closeViewModal}>
              ✕
            </button>

            <div className="voting-modal-header">
              <div className="voting-modal-avatar">
                {selectedCandidate.photoUrl ? (
                  <img src={selectedCandidate.photoUrl} alt={selectedCandidate.name} />
                ) : (
                  <div className="voting-avatar-placeholder">
                    {selectedCandidate.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <h2>{selectedCandidate.name}</h2>
              <p className="voting-modal-position">{selectedCandidate.position}</p>
              {selectedCandidate.school && (
                <p className="voting-modal-school">School: {selectedCandidate.school}</p>
              )}
            </div>

            <div className="voting-modal-body">
              {selectedCandidate.bio && (
                <div className="voting-modal-section">
                  <h3>Bio</h3>
                  <div
                    className="voting-modal-text"
                    dangerouslySetInnerHTML={{ __html: selectedCandidate.bio }}
                  />
                </div>
              )}

              {selectedCandidate.platform && (
                <div className="voting-modal-section">
                  <h3>Platform</h3>
                  <div
                    className="voting-modal-text"
                    dangerouslySetInnerHTML={{ __html: selectedCandidate.platform }}
                  />
                </div>
              )}

              {!selectedCandidate.bio && !selectedCandidate.platform && (
                <p className="voting-no-info">No additional information available.</p>
              )}
            </div>

            <div className="voting-modal-footer">
              <button
                className="voting-btn-modal-vote"
                onClick={() => {
                  handleVoteSelection(selectedCandidate);
                  closeViewModal();
                }}
                disabled={votingClosed || hasVoted}
              >
                {(() => {
                  const positionVotes = selectedVotes[selectedCandidate.position];
                  const isSelected = Array.isArray(positionVotes)
                    ? positionVotes.includes(selectedCandidate.id)
                    : positionVotes === selectedCandidate.id;
                  return isSelected ? 'SELECTED' : 'VOTE FOR THIS CANDIDATE';
                })()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
