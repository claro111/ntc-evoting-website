import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Check if user is an admin
      const adminRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        // Not an admin
        await auth.signOut();
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      // Admin verified, redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Logo */}
        <div className="admin-login-logo">
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="48" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="50" cy="50" r="35" fill="#fbbf24" />
            <circle cx="50" cy="50" r="20" fill="#1e3a8a" />
            <circle cx="50" cy="50" r="8" fill="#fbbf24" />
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x1 = 50 + 20 * Math.cos(angle);
              const y1 = 50 + 20 * Math.sin(angle);
              const x2 = 50 + 35 * Math.cos(angle);
              const y2 = 50 + 35 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#1e3a8a"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>

        {/* Title */}
        <h2 className="admin-login-title">Admin Sign In</h2>

        {/* Error Message */}
        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          {/* Email Field */}
          <div className="admin-form-group">
            <label className="admin-form-label">NTC Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@ntc.edu.ph"
              required
              className="admin-form-input"
            />
          </div>

          {/* Password Field */}
          <div className="admin-form-group">
            <label className="admin-form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
              required
              className="admin-form-input"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="admin-forgot-password">
            <button
              type="button"
              onClick={() => navigate('/admin/forgot-password')}
              className="admin-forgot-link"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="admin-signin-button"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
