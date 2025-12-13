import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerVoter } from '../services/authService';
import FileUpload from '../components/FileUpload';
import FileUploadService from '../services/fileUploadService';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import './VoterRegisterPage.css';

const VoterRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    studentId: '',
    yearLevel: '',
    school: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationFile, setVerificationFile] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  // Debug function to track file selection
  const handleFileSelect = (file) => {
    console.log('File selected in handleFileSelect:', file);
    console.log('File details:', file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    } : 'No file');
    setVerificationFile(file);
    
    // Clear any previous toast when file is selected
    if (file && toast) {
      hideToast();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (toast) hideToast();
  };

  const validateForm = () => {
    // Check each field individually for better error messages
    if (!formData.firstName) {
      showToast('First Name is required', 'warning');
      return false;
    }
    if (!formData.lastName) {
      showToast('Last Name is required', 'warning');
      return false;
    }
    if (!formData.birthdate) {
      showToast('Birthdate is required', 'warning');
      return false;
    }
    if (!formData.studentId) {
      showToast('Student ID is required', 'warning');
      return false;
    }
    if (!formData.yearLevel) {
      showToast('Year Level is required', 'warning');
      return false;
    }
    if (!formData.school) {
      showToast('School is required', 'warning');
      return false;
    }
    if (!formData.email) {
      showToast('Email is required', 'warning');
      return false;
    }
    if (!formData.password) {
      showToast('Password is required', 'warning');
      return false;
    }
    if (!formData.confirmPassword) {
      showToast('Confirm Password is required', 'warning');
      return false;
    }

    if (!verificationFile) {
      showToast('Please upload a verification document', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@ntc\.edu\.ph$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please use your NTC email address (@ntc.edu.ph)', 'warning');
      return false;
    }

    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters long', 'warning');
      return false;
    }

    // Validate password complexity
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      showToast('Password must contain uppercase, lowercase, number, and symbol', 'warning');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideToast();
    setLoading(true);

    // Debug: Log form data and file
    console.log('Form data:', formData);
    console.log('Verification file:', verificationFile);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
      
      console.log('Starting voter registration process...');
      console.log('Registration data:', {
        fullName,
        studentId: formData.studentId,
        email: formData.email,
        yearLevel: formData.yearLevel,
        school: formData.school
      });
      
      // First register the voter to get the user ID
      console.log('Calling registerVoter function...');
      const registrationResult = await registerVoter({
        fullName,
        studentId: formData.studentId,
        birthdate: formData.birthdate,
        yearLevel: formData.yearLevel,
        school: formData.school,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration result:', registrationResult);

      // Upload verification document using the voter ID
      let verificationDocUrl = '';
      if (verificationFile && registrationResult.voterId) {
        try {
          console.log('Starting verification document upload...');
          console.log('File details:', {
            name: verificationFile.name,
            size: verificationFile.size,
            type: verificationFile.type
          });
          console.log('Voter ID:', registrationResult.voterId);
          
          // Add a small delay to ensure authentication is propagated
          console.log('Waiting for authentication to propagate...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          verificationDocUrl = await FileUploadService.uploadVerificationDocument(
            verificationFile, 
            registrationResult.voterId
          );
          
          console.log('Upload successful, URL:', verificationDocUrl);
          
          // Update the voter record with the verification document URL
          const { updateDoc, doc } = await import('firebase/firestore');
          const { db } = await import('../config/firebase');
          
          const updateData = {
            verificationDocUrl: verificationDocUrl,
            verificationDocName: verificationFile.name,
            updatedAt: new Date()
          };
          
          console.log('Updating voter record with:', updateData);
          
          await updateDoc(doc(db, 'voters', registrationResult.voterId), updateData);
          
          console.log('Verification document uploaded and voter updated successfully');
        } catch (uploadError) {
          console.error('Error uploading verification document:', uploadError);
          showToast('Registration successful, but document upload failed. Please contact admin.', 'warning');
          // Continue with registration even if upload fails
        }
      } else {
        console.log('No verification file or voter ID:', {
          hasFile: !!verificationFile,
          voterId: registrationResult.voterId
        });
      }

      showToast('Registration successful! Your account is pending admin approval. You will receive an email once approved.', 'success');
      
      // Navigate after a short delay to allow user to see the success message
      setTimeout(() => {
        navigate('/voter/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      if (err.code === 'auth/email-already-in-use') {
        showToast('This email is already registered', 'error');
      } else if (err.code === 'auth/invalid-email') {
        showToast('Invalid email address', 'error');
      } else if (err.code === 'auth/weak-password') {
        showToast('Password is too weak. Please use a stronger password', 'error');
      } else if (err.code === 'permission-denied') {
        showToast('Permission denied. Please check your account permissions.', 'error');
      } else if (err.message && err.message.includes('Missing or insufficient permissions')) {
        showToast('Database permission error. Please contact administrator.', 'error');
      } else {
        showToast(err.message || 'Registration failed. Please try again', 'error');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Title */}
        <h1 className="register-title">Voter Registration</h1>
        <p className="register-subtitle">Complete the form below to register as a voter</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* First Name */}
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              disabled={loading}
              className="form-input"
            />
          </div>

          {/* Middle Name */}
          <div className="form-group">
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Middle Name"
              disabled={loading}
              className="form-input"
            />
            <span className="optional-label">Optional</span>
          </div>

          {/* Last Name */}
          <div className="form-group">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              disabled={loading}
              className="form-input"
            />
          </div>

          {/* Birthdate */}
          <div className="form-group">
            <label className="field-label">Birthdate</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              max="2007-12-31"
            />
            <p className="field-hint">You must be at least 18 years old to register</p>
          </div>

          {/* Student ID */}
          <div className="form-group">
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Student ID Number"
              disabled={loading}
              className="form-input"
            />
            <span className="helper-text">Number only</span>
          </div>

          {/* Year Level */}
          <div className="form-group">
            <select
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              style={{ color: formData.yearLevel ? '#333' : '#999' }}
            >
              <option value="">Select Year Level</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          {/* School */}
          <div className="form-group">
            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              style={{ color: formData.school ? '#333' : '#999' }}
            >
              <option value="">Select School</option>
              <option value="SOB">School of Business (SOB)</option>
              <option value="SOTE">School of Teacher Education (SOTE)</option>
              <option value="SOAST">School of Arts, Sciences and Technology (SOAST)</option>
              <option value="SOCJ">School of Criminal Justice (SOCJ)</option>
            </select>
          </div>

          {/* Email */}
          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="NTC Email"
                disabled={loading}
                className="form-input with-icon"
              />
            </div>
            <span className="helper-text">Must end with @ntc.edu.ph</span>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                disabled={loading}
                className="form-input with-icon"
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
            <span className="helper-text">Min 8 chars, uppercase, lowercase, number, symbol</span>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                disabled={loading}
                className="form-input with-icon"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? (
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

          {/* Upload Verification Document */}
          <div className="form-group">
            <label className="upload-label">Upload Verification Document</label>
            <p className="upload-description">Document (Image/PDF) - Required</p>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx"
              maxSize={10 * 1024 * 1024}
              placeholder="Upload verification document"
              uploadType="document"
              showPreview={false}
              currentFile={verificationFile}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>

          {/* Back to Login */}
          <div className="back-to-login">
            <Link to="/voter/login">Back to Login</Link>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default VoterRegisterPage;
