import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@ntc\.edu\.ph$/;
    if (!emailRegex.test(email)) {
      setError('Please use your NTC email address (@ntc.edu.ph)');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Logo - Inside card, centered above title */}
        <div className="logo-container">
          <img src="/ntc-logo.png" alt="NTC Logo" className="ntc-logo" />
        </div>

        {/* Title */}
        <h1 className="forgot-password-title">Forgot Password?</h1>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you a link to reset your password
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            {/* Email Field */}
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="NTC Email"
                disabled={loading}
                className="form-input"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {/* Back to Login Link */}
            <div className="back-to-login">
              <Link to="/voter/login">
                <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="success-container">
            <div className="success-icon-wrapper">
              <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h3 className="success-title">Check Your Email</h3>
            <p className="success-message">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>

            <div className="info-box">
              <p className="info-title">Didn't receive the email?</p>
              <p className="info-text">Check your spam folder or try again in a few minutes.</p>
            </div>

            <Link to="/voter/login" className="btn-back">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
