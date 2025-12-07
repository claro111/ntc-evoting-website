import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Sign in a voter with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: Object, voterData?: Object, error?: string}>}
 */
export const loginVoter = async (email, password) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch voter data from Firestore
    const voterDoc = await getDoc(doc(db, 'voters', user.uid));
    
    if (!voterDoc.exists()) {
      return {
        success: false,
        error: 'Voter account not found'
      };
    }

    const voterData = voterDoc.data();

    // Check voter status
    if (voterData.status === 'pending') {
      return {
        success: false,
        error: 'Your account is pending admin approval. Please check your email after approval.'
      };
    }

    if (voterData.status === 'approved_pending_verification' || !voterData.emailVerified) {
      return {
        success: false,
        error: 'Please verify your email address. Check your inbox for the verification link.'
      };
    }

    if (voterData.status === 'deactivated') {
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact support.'
      };
    }

    if (voterData.status !== 'registered') {
      return {
        success: false,
        error: 'Invalid account status. Please contact support.'
      };
    }

    return {
      success: true,
      user,
      voterData
    };
  } catch (error) {
    console.error('Login error:', error);
    
    // Return generic error message without revealing which credential was invalid
    return {
      success: false,
      error: 'Invalid credentials. Please try again.'
    };
  }
};

/**
 * Register a new voter
 * @param {Object} voterData - Voter registration data
 * @returns {Promise<{user, voterId}>}
 */
export const registerVoter = async (voterData) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      voterData.email, 
      voterData.password
    );
    const user = userCredential.user;

    // Create voter document in Firestore
    const voterDoc = {
      fullName: voterData.fullName,
      studentId: voterData.studentId,
      email: voterData.email,
      birthdate: voterData.birthdate,
      yearLevel: voterData.yearLevel,
      school: voterData.school,
      status: 'pending', // pending, approved_pending_verification, registered, deactivated
      emailVerified: false,
      hasVoted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'voters', user.uid), voterDoc);

    return {
      user,
      voterId: user.uid
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Update user password
 * @param {string} newPassword 
 * @returns {Promise<void>}
 */
export const changePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Get current user's voter data
 * @returns {Promise<Object>}
 */
export const getCurrentVoterData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    const voterDoc = await getDoc(doc(db, 'voters', user.uid));
    
    if (!voterDoc.exists()) {
      throw new Error('Voter data not found');
    }

    return voterDoc.data();
  } catch (error) {
    console.error('Get voter data error:', error);
    throw error;
  }
};
