import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import './AdminForgotPasswordPage.css';

const AdminForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-success-container">
        <div className="admin-success-card">
          <div className="admin-success-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="admin-success-title">Email Sent!</h2>
          <p className="admin-success-message">
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <button
            onClick={() => navigate('/admin/login')}
            className="admin-btn-reset"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-forgot-password-container">
      <div className="admin-forgot-password-card">
        {/* Logo - Inside card, centered above title */}
        <div className="logo-container">
          <img src="/ntc-logo.png" alt="NTC Logo" className="ntc-logo" />
        </div>

        {/* Title */}
        <h1 className="admin-forgot-password-title">Forgot Password?</h1>
        <p className="admin-forgot-password-subtitle">
          Enter your admin email address and we'll send you a link to reset your password
        </p>

        <form onSubmit={handleSubmit} className="admin-forgot-password-form">
          {/* Email Field */}
          <div className="admin-form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="Admin Email"
              disabled={loading}
              className="admin-form-input"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}

          {/* Reset Button */}
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-reset"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {/* Back to Login Link */}
          <Link to="/admin/login" className="admin-btn-back">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;
