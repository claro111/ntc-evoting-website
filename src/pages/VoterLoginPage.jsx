import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginVoter } from '../services/authService';
import './VoterLoginPage.css';

const VoterLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (statusMessage) setStatusMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@ntc\.edu\.ph$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please use your NTC email address (@ntc.edu.ph)');
      setLoading(false);
      return;
    }

    try {
      const { voterData } = await loginVoter(formData.email, formData.password);

      if (voterData.status === 'pending') {
        setStatusMessage('Your account is pending admin approval. Please wait for approval.');
        setLoading(false);
        return;
      }

      if (voterData.status === 'approved_pending_verification') {
        setStatusMessage('Please verify your email. Check your inbox for the verification link.');
        setLoading(false);
        return;
      }

      if (voterData.status === 'deactivated') {
        setError('Your account has been deactivated. Please contact the administrator.');
        setLoading(false);
        return;
      }

      if (voterData.status === 'registered' && voterData.emailVerified) {
        navigate('/voter/home');
      } else {
        setError('Your account is not fully verified. Please contact the administrator.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError(err.message || 'Login failed. Please try again');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo - Inside card, centered above title */}
        <div className="logo-container">
          <img src="/ntc-logo.png" alt="NTC Logo" className="ntc-logo" />
        </div>

        {/* Title */}
        <h1 className="login-title">NTC E-Voting</h1>
        <p className="login-subtitle">Voter Login</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="NTC Email"
                disabled={loading}
                className="form-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                disabled={loading}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <Link to="/voter/forgot-password">Forgot Password?</Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="status-message">
              {statusMessage}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-login"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Register Button */}
          <Link to="/voter/register" className="btn-register">
            Register
          </Link>
        </form>
      </div>
    </div>
  );
};

export default VoterLoginPage;
