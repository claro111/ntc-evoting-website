import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [tieBreakingData, setTieBreakingData] = useState({});
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('all');
  const [resultsPublished, setResultsPublished] = useState(false);

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

    // Real-time listener for elections to update voting status and results published flag
    const electionRef = doc(db, 'elections', 'current');
    const unsubscribeElection = onSnapshot(
      electionRef,
      (electionDoc) => {
        console.log('Election updated');
        if (electionDoc.exists()) {
          const electionData = electionDoc.data();
          const now = new Date();
          const startTime = electionData.startTime?.toDate();
          const endTime = electionData.endTime?.toDate();

          // Update voting status
          if (electionData.status === 'active' && startTime && endTime && now >= startTime && now <= endTime) {
            setVotingStatus('OPEN');
          } else {
            setVotingStatus('CLOSED');
          }

          // Update results published flag
          setResultsPublished(electionData.resultsPublished || false);
        } else {
          setVotingStatus('CLOSED');
          setResultsPublished(false);
        }
      },
      (error) => {
        console.error('Error in election listener:', error);
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

  const handleExportPDF = () => {
    setShowExportMenu(false);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('NTC E-VOTING SYSTEM', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('COMPREHENSIVE REPORT', pageWidth / 2, 22, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
      
      let yPos = 38;
      
      // Voting Statistics
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('VOTING STATISTICS', 14, yPos);
      yPos += 8;
      
      const statsData = [
        ['Total Registered Voters', stats.totalRegistered.toString()],
        ['Already Voted', stats.alreadyVoted.toString()],
        ['Not Yet Voted', stats.notYetVoted.toString()],
        ['Voter Turnout', `${stats.voterTurnout}%`]
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Live Vote Results
      positions.forEach((position) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        const positionCandidates = getCandidatesForPosition(position.name);
        const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(position.name, 14, yPos);
        yPos += 5;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Votes: ${totalVotes} | Winners Needed: ${position.maxSelection || 1}`, 14, yPos);
        yPos += 5;
        
        const candidateData = positionCandidates.map(c => {
          const nameWithIndicator = c.manuallySelectedWinner ? `${c.name} (Manual Winner)` : c.name;
          return [
            `#${c.rank}`,
            nameWithIndicator,
            c.voteCount.toString(),
            `${c.percentage}%`
          ];
        });
        
        autoTable(doc, {
          startY: yPos,
          head: [['Rank', 'Candidate Name', 'Votes', 'Percentage']],
          body: candidateData,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      });
      
      doc.save(`NTC_Voting_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    
    const workbook = XLSX.utils.book_new();
    
    // Statistics Sheet
    const statsData = [
      ['NTC E-VOTING SYSTEM - COMPREHENSIVE REPORT'],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['VOTING STATISTICS'],
      ['Metric', 'Value'],
      ['Total Registered Voters', stats.totalRegistered],
      ['Already Voted', stats.alreadyVoted],
      ['Not Yet Voted', stats.notYetVoted],
      ['Voter Turnout', `${stats.voterTurnout}%`]
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    
    // Results Sheet
    const resultsData = [['Position', 'Rank', 'Candidate Name', 'Votes', 'Percentage', 'Manual Winner']];
    
    positions.forEach(position => {
      const positionCandidates = getCandidatesForPosition(position.name);
      positionCandidates.forEach(c => {
        resultsData.push([
          position.name,
          `#${c.rank}`,
          c.name,
          c.voteCount,
          `${c.percentage}%`,
          c.manuallySelectedWinner ? 'YES' : 'NO'
        ]);
      });
    });
    
    const resultsSheet = XLSX.utils.aoa_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results');
    
    // Demographics Sheet
    const demographicsData = [
      ['VOTING BY YEAR LEVEL'],
      ['Year Level', 'Voted', 'Not Voted'],
      ...yearLevelData.map(d => [d.name, d.Voted, d['Not Voted']]),
      [],
      ['VOTING BY SCHOOL'],
      ['School', 'Voted', 'Not Voted'],
      ...schoolData.map(d => [d.name, d.Voted, d['Not Voted']])
    ];
    
    const demographicsSheet = XLSX.utils.aoa_to_sheet(demographicsData);
    XLSX.utils.book_append_sheet(workbook, demographicsSheet, 'Demographics');
    
    XLSX.writeFile(workbook, `NTC_Voting_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    setShowExportMenu(false);
    // Generate detailed CSV
    let csvContent = 'Position,Rank,Candidate Name,Votes,Percentage,Manual Winner\n';
    
    positions.forEach(position => {
      const positionCandidates = getCandidatesForPosition(position.name);
      positionCandidates.forEach(c => {
        const manualWinner = c.manuallySelectedWinner ? 'YES' : 'NO';
        csvContent += `"${position.name}",${c.rank},"${c.name}",${c.voteCount},${c.percentage}%,${manualWinner}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NTC_Voting_Results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReportData = () => {
    return {
      stats,
      positions: positions.map(position => ({
        ...position,
        candidates: getCandidatesForPosition(position.name)
      }))
    };
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
      .sort((a, b) => {
        // If one candidate is manually selected as winner, they should be ranked first
        if (a.manuallySelectedWinner && !b.manuallySelectedWinner) return -1;
        if (!a.manuallySelectedWinner && b.manuallySelectedWinner) return 1;
        // Otherwise sort by vote count
        return b.voteCount - a.voteCount;
      });

    const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);

    return positionCandidates.map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
      percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0,
      isWinner: candidate.manuallySelectedWinner || index === 0, // Winner if manually selected or ranked first
    }));
  };

  // Detect ties in voting results
  const detectTies = (positionName, maxSelection = 1) => {
    const positionCandidates = getCandidatesForPosition(positionName);
    
    if (positionCandidates.length === 0) return null;

    // Find candidates at the winning threshold
    const winningThreshold = positionCandidates[Math.min(maxSelection - 1, positionCandidates.length - 1)]?.voteCount;
    
    // Get all candidates with the winning vote count (excluding those with 0 votes)
    const tiedCandidates = positionCandidates.filter(c => c.voteCount === winningThreshold && c.voteCount > 0);
    
    // Check if a winner has been manually selected
    const hasManualSelection = tiedCandidates.some(c => c.manuallySelectedWinner === true);
    
    // Show tie section if more than one candidate has the winning vote count
    if (tiedCandidates.length > 1) {
      return {
        position: positionName,
        voteCount: winningThreshold,
        candidates: tiedCandidates,
        maxSelection,
        hasManualSelection
      };
    }
    
    return null;
  };

  // Handle manual winner selection for ties
  const handleSelectWinner = async (positionName, candidateId) => {
    try {
      // Get all candidates for this position
      const positionCandidates = candidates.filter(c => c.position === positionName);
      
      // First, clear any existing manual winner selections for this position
      const clearPromises = positionCandidates.map(async (candidate) => {
        if (candidate.manuallySelectedWinner) {
          const candidateRef = doc(db, 'candidates', candidate.id);
          await updateDoc(candidateRef, {
            manuallySelectedWinner: false,
            selectedAt: null
          });
        }
      });
      
      await Promise.all(clearPromises);
      
      // Then set the selected candidate as winner
      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, {
        manuallySelectedWinner: true,
        selectedAt: new Date()
      });
      
      alert('Winner selected successfully! Other tied candidates have been deselected.');
    } catch (error) {
      console.error('Error selecting winner:', error);
      alert('Failed to select winner. Please try again.');
    }
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
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics-header">
        <h3 className="statistics-title">Voting Statistics</h3>
        <div className="statistics-actions">
          <button 
            onClick={() => resultsPublished && navigate('/admin/archive')} 
            className={`archive-button ${!resultsPublished ? 'disabled' : ''}`}
            disabled={!resultsPublished}
            title={!resultsPublished ? 'Available only after results are published' : 'View archived election results'}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            Archived Results
          </button>
          <div className="export-dropdown-container">
          <button 
            onClick={() => resultsPublished && setShowExportMenu(!showExportMenu)} 
            className={`export-button ${!resultsPublished ? 'disabled' : ''}`}
            disabled={!resultsPublished}
            title={!resultsPublished ? 'Available only after results are published' : 'Export reports'}
          >
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
          {showExportMenu && resultsPublished && (
            <div className="export-dropdown-menu">
              <button onClick={handleExportPDF} className="export-menu-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Export as PDF
              </button>
              <button onClick={handleExportExcel} className="export-menu-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export as Excel
              </button>
              <button onClick={handleExportCSV} className="export-menu-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export as CSV
              </button>
            </div>
          )}
          </div>
        </div>
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
          <select 
            className="position-filter"
            value={selectedPositionFilter}
            onChange={(e) => setSelectedPositionFilter(e.target.value)}
          >
            <option value="all">All Positions</option>
            {positions.map((position) => (
              <option key={position.id} value={position.name}>
                {position.name}
              </option>
            ))}
          </select>
        </div>

        {positions.length === 0 ? (
          <div className="empty-state">
            <p>No positions created yet. Go to Manage Candidates to add positions.</p>
          </div>
        ) : (
          positions
            .filter((position) => selectedPositionFilter === 'all' || position.name === selectedPositionFilter)
            .map((position) => {
            const positionCandidates = getCandidatesForPosition(position.name);
            const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);
            const tieInfo = detectTies(position.name, position.maxSelection || 1);

            return (
              <div key={position.id} className="position-section">
                <div className="position-header">
                  <h4 className="position-name">{position.name}</h4>
                  <p className="position-info">
                    Total Votes: {totalVotes} | Winners Needed: {position.maxSelection || 1}
                  </p>
                </div>

                {/* Tie Detection Warning - Only show when voting is closed and results not published */}
                {tieInfo && votingStatus === 'CLOSED' && !resultsPublished && (
                  <div className={`tie-warning-banner ${tieInfo.hasManualSelection ? 'resolved' : ''}`}>
                    <div className="tie-warning-icon">{tieInfo.hasManualSelection ? '✓' : '⚠️'}</div>
                    <div className="tie-warning-content">
                      <strong>{tieInfo.hasManualSelection ? 'Tie Resolved - Winner Selected' : 'Tie Detected - Manual Selection Required'}</strong>
                      <p>
                        {tieInfo.hasManualSelection 
                          ? `A winner has been manually selected from the tied candidates. You can reselect a different winner if needed.`
                          : `The following candidates are tied with ${tieInfo.voteCount} votes each. You need to manually select ${tieInfo.maxSelection} winner(s) from the tied candidates.`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Results Published - Tie Finalized Banner */}
                {tieInfo && votingStatus === 'CLOSED' && resultsPublished && tieInfo.hasManualSelection && (
                  <div className="tie-finalized-banner">
                    <div className="tie-finalized-icon">🔒</div>
                    <div className="tie-finalized-content">
                      <strong>Tie Resolved - Results Published</strong>
                      <p>
                        The manual winner selection has been finalized and published. Changes are no longer allowed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tied Candidates Selection - Only show when voting is closed and results not published */}
                {tieInfo && votingStatus === 'CLOSED' && !resultsPublished && (
                  <div className="tied-candidates-section">
                    {tieInfo.candidates.map((candidate) => {
                      const isSelected = candidate.manuallySelectedWinner === true;
                      
                      return (
                        <div key={candidate.id} className={`tied-candidate-item ${isSelected ? 'selected' : ''}`}>
                          <div className="tied-candidate-info">
                            <span className="tied-candidate-name">
                              {candidate.name}
                              {isSelected && <span className="selected-badge">✓ Selected</span>}
                            </span>
                            <span className="tied-candidate-votes">{candidate.voteCount} votes</span>
                          </div>
                          <button
                            className={`btn-select-winner ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectWinner(position.name, candidate.id)}
                          >
                            {isSelected ? 'Selected as Winner' : 'Select as Winner'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tied Candidates Display Only - Show when results are published */}
                {tieInfo && votingStatus === 'CLOSED' && resultsPublished && (
                  <div className="tied-candidates-section finalized">
                    {tieInfo.candidates.map((candidate) => {
                      const isSelected = candidate.manuallySelectedWinner === true;
                      
                      return (
                        <div key={candidate.id} className={`tied-candidate-item ${isSelected ? 'selected finalized' : 'finalized'}`}>
                          <div className="tied-candidate-info">
                            <span className="tied-candidate-name">
                              {candidate.name}
                              {isSelected && <span className="selected-badge finalized">✓ Winner</span>}
                            </span>
                            <span className="tied-candidate-votes">{candidate.voteCount} votes</span>
                          </div>
                          {isSelected && (
                            <div className="finalized-badge">
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              Finalized
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="candidate-list">
                  {positionCandidates.length === 0 ? (
                    <p className="no-candidates">No candidates for this position yet</p>
                  ) : (
                    positionCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className={`candidate-item ${candidate.rank === 1 ? 'first-place' : ''} ${candidate.manuallySelectedWinner ? 'manually-selected' : ''}`}
                      >
                        <div className={`candidate-rank ${candidate.rank === 1 ? 'first' : 'other'}`}>
                          #{candidate.rank}
                        </div>
                        <div className="candidate-name">
                          {candidate.name}
                          {candidate.manuallySelectedWinner && (
                            <span className="manual-winner-badge">⚠️ Manually Selected</span>
                          )}
                        </div>
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
