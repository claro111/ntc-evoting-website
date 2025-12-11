import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import VoterLoginPage from './pages/VoterLoginPage';
import VoterRegisterPage from './pages/VoterRegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VoterLayout from './components/VoterLayout';
import VoterHomepage from './pages/VoterHomepage';
import AnnouncementPage from './pages/AnnouncementPage';
import VotingPage from './pages/VotingPage';
import ReviewVotePage from './pages/ReviewVotePage';
import VoteConfirmationPage from './pages/VoteConfirmationPage';
import VoterProfilePage from './pages/VoterProfilePage';
import VoteReceiptPage from './pages/VoteReceiptPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminForgotPasswordPage from './pages/AdminForgotPasswordPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ArchiveResultsPage from './pages/ArchiveResultsPage';
import ManageVotersPage from './pages/ManageVotersPage';
import ManageCandidatesPage from './pages/ManageCandidatesPage';
import VotingControlPage from './pages/VotingControlPage';
import ManageAnnouncementsPage from './pages/ManageAnnouncementsPage';
import ManageAdminsPage from './pages/ManageAdminsPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedVoterRoute from './components/ProtectedVoterRoute';
import ProtectedRoute from './components/ProtectedRoute';
import './components/ProtectedRoute.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Voter Routes */}
          <Route path="/" element={<Navigate to="/voter/login" replace />} />
          <Route path="/voter/login" element={<VoterLoginPage />} />
          <Route path="/voter/register" element={<VoterRegisterPage />} />
          <Route path="/voter/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Voter App Routes with Layout */}
          <Route path="/voter" element={<ProtectedVoterRoute><VoterLayout /></ProtectedVoterRoute>}>
            <Route path="home" element={<VoterHomepage />} />
            <Route path="announcements" element={<AnnouncementPage />} />
            <Route path="voting" element={<VotingPage />} />
            <Route path="profile" element={<VoterProfilePage />} />
          </Route>
          
          {/* Vote Review and Confirmation (outside layout for full-screen experience) */}
          <Route path="/voter/review-vote" element={<ProtectedVoterRoute><ReviewVotePage /></ProtectedVoterRoute>} />
          <Route path="/voter/vote-confirmation" element={<ProtectedVoterRoute><VoteConfirmationPage /></ProtectedVoterRoute>} />
          <Route path="/voter/vote-receipt" element={<ProtectedVoterRoute><VoteReceiptPage /></ProtectedVoterRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
          
          {/* Admin App Routes with Layout */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route path="dashboard" element={
              <ProtectedRoute requiredRoles={['superadmin', 'moderator']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="archive" element={
              <ProtectedRoute requiredRoles={['superadmin', 'moderator']}>
                <ArchiveResultsPage />
              </ProtectedRoute>
            } />
            <Route path="manage-voters" element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <ManageVotersPage />
              </ProtectedRoute>
            } />
            <Route path="manage-candidates" element={
              <ProtectedRoute requiredRoles={['superadmin', 'moderator']}>
                <ManageCandidatesPage />
              </ProtectedRoute>
            } />
            <Route path="voting-control" element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <VotingControlPage />
              </ProtectedRoute>
            } />
            <Route path="announcements" element={
              <ProtectedRoute requiredRoles={['superadmin', 'moderator']}>
                <ManageAnnouncementsPage />
              </ProtectedRoute>
            } />
            <Route path="manage-admins" element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <ManageAdminsPage />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
