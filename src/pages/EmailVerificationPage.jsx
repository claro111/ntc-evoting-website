import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail as verifyEmailToken } from '../services/voterService';
import './EmailVerificationPage.css';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('Verifying your email...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    try {
      console.log('Verifying token:', token);
      
      // Use the custom token verification from voterService
      const result = await verifyEmailToken(token);

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Your email has been successfully verified! You can now log in to your account.');
      } else {
        setStatus('error');
        setMessage(result.message || 'Failed to verify email.');
      }

    } catch (error) {
      console.error('Email verification error:', error);

      const errorMessage = error.message || 'Failed to verify email';
      
      if (errorMessage.includes('expired')) {
        setStatus('expired');
        setMessage('This verification link has expired. Please contact the administrator for a new link.');
      } else if (errorMessage.includes('already been used')) {
        setStatus('error');
        setMessage('This verification link has already been used. Please try logging in.');
      } else if (errorMessage.includes('Invalid')) {
        setStatus('error');
        setMessage('This verification link is invalid. Please contact the administrator.');
      } else {
        setStatus('error');
        setMessage('Failed to verify email. Please try again or contact support.');
      }
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    // This would typically call a Cloud Function to resend the verification email
    // For now, we'll just show a message
    alert('Please contact the administrator to resend your verification email.');
    setLoading(false);
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        {/* NTC Logo */}
        <div className="logo-container">
          <img src="/ntc-logo.png" alt="NTC Logo" className="ntc-logo" />
        </div>

        {/* Title */}
        <h1 className="verification-title">NTC E-Voting</h1>
        <h2 className="verification-subtitle">Email Verification</h2>

        {/* Status Icon and Message */}
        <div className="status-container">
          {status === 'verifying' && (
            <div className="status-content">
              <div className="loading-spinner"></div>
              <p className="status-message">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="status-content">
              <div className="status-icon success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="status-title success">Success!</p>
              <p className="status-message">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="status-content">
              <div className="status-icon error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="status-title error">Verification Failed</p>
              <p className="status-message">{message}</p>
            </div>
          )}

          {status === 'expired' && (
            <div className="status-content">
              <div className="status-icon warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="status-title warning">Link Expired</p>
              <p className="status-message">{message}</p>
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="btn-resend"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(status === 'success' || status === 'error') && (
          <div className="action-buttons">
            <Link to="/voter/login" className="btn-login">
              Go to Login
            </Link>
            
            {status === 'error' && (
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="btn-resend secondary"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="help-text">
          <p>
            Need help? Contact the administrator at{' '}
            <a href="mailto:admin@ntc.edu.ph">admin@ntc.edu.ph</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
