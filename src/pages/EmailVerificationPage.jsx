import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail as verifyEmailToken } from '../services/voterService';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Verification Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* NTC Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-blue-600">
            <svg className="w-12 h-12 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.96-7-5.54-7-10V8.3l7-3.11 7 3.11V10c0 4.46-3.14 9.04-7 10z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Email Verification</h2>

        {/* Status Icon and Message */}
        <div className="text-center mb-8">
          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold mb-2">Success!</p>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold mb-2">Verification Failed</p>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          )}

          {status === 'expired' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold mb-2">Link Expired</p>
              <p className="text-gray-600 text-sm mb-4">{message}</p>
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(status === 'success' || status === 'error') && (
          <div className="space-y-3">
            <Link
              to="/voter/login"
              className="block w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition text-center shadow-md"
            >
              Go to Login
            </Link>
            
            {status === 'error' && (
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:bg-gray-100"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact the administrator at{' '}
            <a href="mailto:admin@ntc.edu.ph" className="text-blue-600 hover:underline">
              admin@ntc.edu.ph
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
