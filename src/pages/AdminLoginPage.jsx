import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
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

  // Check if user is already authenticated as admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            // User is already logged in as admin, redirect to dashboard
            navigate('/admin/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error checking admin auth status:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
      navigate('/admin/dashboard', { replace: true });
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
          <img src="/ntc-logo.png" alt="NTC Logo" />
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
