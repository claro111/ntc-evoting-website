import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    alreadyVoted: 0,
    notYetVoted: 0,
    voterTurnout: 0,
  });
  const [votingStatus, setVotingStatus] = useState('CLOSED');
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [yearLevelData, setYearLevelData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);

  useEffect(() => {
    console.log('AdminDashboard: Setting up real-time listeners');
    
    // Real-time listeners for positions, candidates, and votes
    const unsubscribePositions = onSnapshot(
      collection(db, 'positions'),
      (snapshot) => {
        console.log('Positions updated:', snapshot.size);
        const positionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPositions(positionsData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      },
      (error) => {
        console.error('Error in positions listener:', error);
      }
    );

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

    const unsubscribeVotes = onSnapshot(
      collection(db, 'votes'),
      (snapshot) => {
        console.log('Votes updated:', snapshot.size);
        const votesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVotes(votesData);
      },
      (error) => {
        console.error('Error in votes listener:', error);
      }
    );

    // Real-time listener for voters to update statistics and demographics
    const unsubscribeVoters = onSnapshot(
      collection(db, 'voters'),
      (snapshot) => {
        console.log('Voters updated:', snapshot.size);
        fetchDashboardData();
        fetchDemographicsData();
      },
      (error) => {
        console.error('Error in voters listener:', error);
      }
    );

    // Real-time listener for elections to update voting status
    const electionsRef = collection(db, 'elections');
    const unsubscribeElection = onSnapshot(
      electionsRef,
      (electionSnapshot) => {
        console.log('Elections updated:', electionSnapshot.size);
        const activeElection = electionSnapshot.docs.find(doc => doc.data().status === 'active');
        
        if (activeElection) {
          const electionData = activeElection.data();
          const now = new Date();
          const startTime = electionData.startTime?.toDate();
          const endTime = electionData.endTime?.toDate();

          if (startTime && endTime && now >= startTime && now <= endTime) {
            setVotingStatus('OPEN');
          } else {
            setVotingStatus('CLOSED');
          }
        } else {
          setVotingStatus('CLOSED');
        }
      },
      (error) => {
        console.error('Error in elections listener:', error);
      }
    );

    // Initial fetch
    fetchDashboardData();
    fetchDemographicsData();

    return () => {
      console.log('AdminDashboard: Cleaning up listeners');
      unsubscribePositions();
      unsubscribeCandidates();
      unsubscribeVotes();
      unsubscribeVoters();
      unsubscribeElection();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch voter statistics
      const votersRef = collection(db, 'voters');

      // Total registered voters
      const registeredQuery = query(
        votersRef,
        where('status', '==', 'registered'),
        where('emailVerified', '==', true)
      );
      const registeredSnapshot = await getCountFromServer(registeredQuery);
      const totalRegistered = registeredSnapshot.data().count;

      // Already voted
      const votedQuery = query(
        votersRef,
        where('status', '==', 'registered'),
        where('hasVoted', '==', true)
      );
      const votedSnapshot = await getCountFromServer(votedQuery);
      const alreadyVoted = votedSnapshot.data().count;

      // Not yet voted
      const notYetVoted = totalRegistered - alreadyVoted;

      // Voter turnout percentage
      const voterTurnout = totalRegistered > 0 ? (alreadyVoted / totalRegistered) * 100 : 0;

      setStats({
        totalRegistered,
        alreadyVoted,
        notYetVoted,
        voterTurnout: voterTurnout.toFixed(1),
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const fetchDemographicsData = async () => {
    try {
      // Fetch all registered voters
      const votersRef = collection(db, 'voters');
      const registeredQuery = query(
        votersRef,
        where('status', '==', 'registered'),
        where('emailVerified', '==', true)
      );
      const votersSnapshot = await getDocs(registeredQuery);
      const voters = votersSnapshot.docs.map((doc) => doc.data());

      // Define all possible year levels
      const allYearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      
      // Initialize year level stats with all possible values
      const yearLevelStats = {};
      allYearLevels.forEach((yearLevel) => {
        yearLevelStats[yearLevel] = { total: 0, voted: 0 };
      });

      // Process Year Level data
      voters.forEach((voter) => {
        const yearLevel = voter.yearLevel || 'Unknown';
        if (!yearLevelStats[yearLevel]) {
          yearLevelStats[yearLevel] = { total: 0, voted: 0 };
        }
        yearLevelStats[yearLevel].total += 1;
        if (voter.hasVoted) {
          yearLevelStats[yearLevel].voted += 1;
        }
      });

      const yearLevelChartData = allYearLevels.map((yearLevel) => ({
        name: yearLevel,
        'Voted': yearLevelStats[yearLevel].voted,
        'Not Voted': yearLevelStats[yearLevel].total - yearLevelStats[yearLevel].voted,
      }));

      setYearLevelData(yearLevelChartData);

      // Define all possible schools
      const allSchools = ['SOB', 'SOTE', 'SOAST', 'SOCJ'];
      
      // Initialize school stats with all possible values
      const schoolStats = {};
      allSchools.forEach((school) => {
        schoolStats[school] = { total: 0, voted: 0 };
      });

      // Process School data
      voters.forEach((voter) => {
        const school = voter.school || 'Unknown';
        if (!schoolStats[school]) {
          schoolStats[school] = { total: 0, voted: 0 };
        }
        schoolStats[school].total += 1;
        if (voter.hasVoted) {
          schoolStats[school].voted += 1;
        }
      });

      const schoolChartData = allSchools.map((school) => ({
        name: school,
        'Voted': schoolStats[school].voted,
        'Not Voted': schoolStats[school].total - schoolStats[school].voted,
      }));

      setSchoolData(schoolChartData);
    } catch (err) {
      console.error('Error fetching demographics data:', err);
    }
  };

  const handleExportReports = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented in a future update');
  };

  // Calculate vote counts for each candidate
  const getCandidateVotes = (candidateId) => {
    return votes.filter((vote) => vote.candidateId === candidateId).length;
  };

  // Get candidates for a specific position with vote counts
  const getCandidatesForPosition = (positionName) => {
    const positionCandidates = candidates
      .filter((c) => c.position === positionName)
      .map((candidate) => ({
        ...candidate,
        voteCount: getCandidateVotes(candidate.id),
      }))
      .sort((a, b) => b.voteCount - a.voteCount); // Sort by votes descending

    const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);

    return positionCandidates.map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
      percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0,
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>

      {/* Top Section: Welcome and Voting Status */}
      <div className="dashboard-top-section">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome!</h2>
          <p className="welcome-subtitle">Admin Dashboard</p>
          <p className="welcome-description">Real-time voting monitoring system</p>
        </div>

        {/* Voting Status Card */}
        <div className="voting-status-card">
          <h3 className="voting-status-title">Voting Status</h3>
          <div className="voting-status-badge">{votingStatus}</div>
          <button className="publish-button">Publish Results in App</button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics-header">
        <h3 className="statistics-title">Voting Statistics</h3>
        <button onClick={handleExportReports} className="export-button">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export All Reports ▼
        </button>
      </div>

      <div className="statistics-grid">
        {/* Total Registered Voters */}
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Registered Voters</div>
            <div className="stat-value">{stats.totalRegistered}</div>
          </div>
        </div>

        {/* Already Voted */}
        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Already Voted</div>
            <div className="stat-value">{stats.alreadyVoted}</div>
          </div>
        </div>

        {/* Not Yet Voted */}
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Not Yet Voted</div>
            <div className="stat-value">{stats.notYetVoted}</div>
          </div>
        </div>

        {/* Voter Turnout */}
        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Voter Turnout</div>
            <div className="stat-value">{stats.voterTurnout}%</div>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="demographics-section">
        <h3 className="demographics-title">Voting Statistics by Demographics</h3>
        <div className="demographics-grid">
          <div className="chart-card">
            <h4 className="chart-title">Voting by Year Level</h4>
            {yearLevelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearLevelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Voted" fill="#48bb78" />
                  <Bar dataKey="Not Voted" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">No data available</div>
            )}
          </div>
          <div className="chart-card">
            <h4 className="chart-title">Voting by School</h4>
            {schoolData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={schoolData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Voted" fill="#48bb78" />
                  <Bar dataKey="Not Voted" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Live Vote Results */}
      <div className="live-results-section">
        <div className="live-results-header">
          <h3 className="live-results-title">Live Vote Results</h3>
          <select className="position-filter">
            <option>All Positions</option>
          </select>
        </div>

        {positions.length === 0 ? (
          <div className="empty-state">
            <p>No positions created yet. Go to Manage Candidates to add positions.</p>
          </div>
        ) : (
          positions.map((position) => {
            const positionCandidates = getCandidatesForPosition(position.name);
            const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);

            return (
              <div key={position.id} className="position-section">
                <div className="position-header">
                  <h4 className="position-name">{position.name}</h4>
                  <p className="position-info">
                    Total Votes: {totalVotes} | Winners Needed: {position.maxSelection || 1}
                  </p>
                </div>
                <div className="candidate-list">
                  {positionCandidates.length === 0 ? (
                    <p className="no-candidates">No candidates for this position yet</p>
                  ) : (
                    positionCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className={`candidate-item ${candidate.rank === 1 ? 'first-place' : ''}`}
                      >
                        <div className={`candidate-rank ${candidate.rank === 1 ? 'first' : 'other'}`}>
                          #{candidate.rank}
                        </div>
                        <div className="candidate-name">{candidate.name}</div>
                        <div className="candidate-votes">{candidate.voteCount} votes</div>
                        <div className="vote-bar">
                          <div
                            className="vote-bar-fill"
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                        <div className="candidate-percentage">{candidate.percentage}%</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
