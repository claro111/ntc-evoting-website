import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Check voting status
      const electionsRef = collection(db, 'elections');
      const activeElectionQuery = query(
        electionsRef,
        where('status', '==', 'active')
      );
      const electionSnapshot = await getDocs(activeElectionQuery);

      if (!electionSnapshot.empty) {
        const electionData = electionSnapshot.docs[0].data();
        const now = new Date();
        const startTime = electionData.startTime?.toDate();
        const endTime = electionData.endTime?.toDate();

        if (startTime && endTime && now >= startTime && now <= endTime) {
          setVotingStatus('OPEN');
        } else {
          setVotingStatus('CLOSED');
        }
      }

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

  const handleExportReports = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented in a future update');
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
            <div className="chart-placeholder">Chart will be displayed here</div>
          </div>
          <div className="chart-card">
            <h4 className="chart-title">Voting by School</h4>
            <div className="chart-placeholder">Chart will be displayed here</div>
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

        {/* President Position */}
        <div className="position-section">
          <div className="position-header">
            <h4 className="position-name">President</h4>
            <p className="position-info">Total Votes: 0 | Winners Needed: 1</p>
          </div>
          <div className="candidate-list">
            <div className="candidate-item">
              <div className="candidate-rank first">#1</div>
              <div className="candidate-name">Sarah Lim</div>
              <div className="candidate-votes">0 votes</div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="candidate-percentage">0%</div>
            </div>
            <div className="candidate-item">
              <div className="candidate-rank other">#2</div>
              <div className="candidate-name">Maria Santos</div>
              <div className="candidate-votes">0 votes</div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="candidate-percentage">0%</div>
            </div>
            <div className="candidate-item">
              <div className="candidate-rank other">#3</div>
              <div className="candidate-name">Juan dela Cruz</div>
              <div className="candidate-votes">0 votes</div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="candidate-percentage">0%</div>
            </div>
          </div>
        </div>

        {/* Vice President Position */}
        <div className="position-section">
          <div className="position-header">
            <h4 className="position-name">Vice President</h4>
            <p className="position-info">Total Votes: 0 | Winners Needed: 1</p>
          </div>
          <div className="candidate-list">
            <div className="candidate-item">
              <div className="candidate-rank first">#1</div>
              <div className="candidate-name">Miguel Reyes</div>
              <div className="candidate-votes">0 votes</div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="candidate-percentage">0%</div>
            </div>
            <div className="candidate-item">
              <div className="candidate-rank other">#2</div>
              <div className="candidate-name">David Chen</div>
              <div className="candidate-votes">0 votes</div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="candidate-percentage">0%</div>
            </div>
            <div className="candidate-item">
              <div className="candidate-rank other">#3</div>
              <div className="candidate-name">Andrea Tan</div>
              <div className="candidate-votes">0 votes</div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: '0%' }}></div>
              </div>
              <div className="candidate-percentage">0%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
