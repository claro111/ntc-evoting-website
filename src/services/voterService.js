import { doc, updateDoc, Timestamp, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendApprovalEmail, sendRejectionEmail } from './emailService';

/**
 * Generate a random verification token
 */
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Approve a voter registration
 * @param {string} voterId - The voter document ID
 * @param {string} expirationDate - The account expiration date (ISO string)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const approveVoter = async (voterId, expirationDate) => {
  try {
    // Get voter data
    const voterRef = doc(db, 'voters', voterId);
    const voterDoc = await getDoc(voterRef);
    
    if (!voterDoc.exists()) {
      throw new Error('Voter not found');
    }

    const voterData = voterDoc.data();
    
    // Generate verification token
    const token = generateToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours expiry

    // Store verification token
    await addDoc(collection(db, 'email_verifications'), {
      voterId: voterId,
      email: voterData.email,
      token: token,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(tokenExpiry),
      used: false,
    });

    // Update voter status
    await updateDoc(voterRef, {
      status: 'approved_pending_verification',
      expirationDate: Timestamp.fromDate(new Date(expirationDate)),
      verificationToken: token,
      updatedAt: Timestamp.now(),
    });

    // Send verification email
    // Use production URL from env, fallback to current origin for local testing
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;
    const formattedDate = new Date(expirationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    try {
      await sendApprovalEmail({
        toEmail: voterData.email,
        toName: voterData.fullName,
        verificationLink: verificationLink,
        expirationDate: formattedDate,
      });
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.warn('Failed to send email, but voter was approved:', emailError);
      // Continue anyway - voter is approved even if email fails
    }

    return {
      success: true,
      message: 'Voter approved successfully. Verification link: ' + verificationLink,
    };
  } catch (error) {
    console.error('Error approving voter:', error);
    throw new Error(error.message || 'Failed to approve voter');
  }
};

/**
 * Reject a voter registration
 * @param {string} voterId - The voter document ID
 * @param {string} reason - Optional rejection reason
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const rejectVoter = async (voterId, reason = '') => {
  try {
    // Get voter data
    const voterRef = doc(db, 'voters', voterId);
    const voterDoc = await getDoc(voterRef);
    
    if (!voterDoc.exists()) {
      throw new Error('Voter not found');
    }

    const voterData = voterDoc.data();

    // Update voter status
    await updateDoc(voterRef, {
      status: 'deactivated',
      rejectionReason: reason || 'Registration rejected by administrator',
      updatedAt: Timestamp.now(),
    });

    // Send rejection email
    try {
      await sendRejectionEmail({
        toEmail: voterData.email,
        toName: voterData.fullName,
        reason: reason,
      });
      console.log('Rejection email sent successfully');
    } catch (emailError) {
      console.warn('Failed to send email, but voter was rejected:', emailError);
      // Continue anyway - voter is rejected even if email fails
    }

    return {
      success: true,
      message: 'Voter rejected successfully.',
    };
  } catch (error) {
    console.error('Error rejecting voter:', error);
    throw new Error(error.message || 'Failed to reject voter');
  }
};

/**
 * Verify email using token
 * @param {string} token - The verification token
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyEmail = async (token) => {
  try {
    // Find token in email_verifications collection
    const { collection: firestoreCollection, query, where, getDocs } = await import('firebase/firestore');
    
    const verificationsRef = firestoreCollection(db, 'email_verifications');
    const q = query(verificationsRef, where('token', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid verification token');
    }

    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();

    // Check if token is already used
    if (tokenData.used) {
      throw new Error('Token has already been used');
    }

    // Check if token is expired
    const now = Timestamp.now();
    if (tokenData.expiresAt < now) {
      throw new Error('Token has expired');
    }

    // Update voter status
    const voterRef = doc(db, 'voters', tokenData.voterId);
    await updateDoc(voterRef, {
      status: 'registered',
      emailVerified: true,
      verifiedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Mark token as used
    await updateDoc(doc(db, 'email_verifications', tokenDoc.id), {
      used: true,
      usedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    throw new Error(error.message || 'Failed to verify email');
  }
};
