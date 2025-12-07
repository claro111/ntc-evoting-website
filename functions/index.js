require('dotenv').config();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Cloud Function to approve a voter registration
 * Generates verification token and sends verification email
 */
exports.approveVoter = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to approve voters.'
    );
  }

  const { voterId, expirationDate } = data;

  if (!voterId || !expirationDate) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'voterId and expirationDate are required.'
    );
  }

  try {
    const voterRef = admin.firestore().collection('voters').doc(voterId);
    const voterDoc = await voterRef.get();

    if (!voterDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Voter not found.');
    }

    const voterData = voterDoc.data();

    // Generate email verification token
    const verificationToken = admin.firestore().collection('email_verifications').doc();
    const tokenId = verificationToken.id;

    // Store verification token
    await verificationToken.set({
      voterId: voterId,
      email: voterData.email,
      token: tokenId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      ),
      used: false,
    });

    // Update voter status
    await voterRef.update({
      status: 'approved_pending_verification',
      expirationDate: admin.firestore.Timestamp.fromDate(new Date(expirationDate)),
      verificationToken: tokenId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send verification email
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${tokenId}`;
    
    const mailOptions = {
      from: `"NTC E-Voting" <${process.env.EMAIL_USER}>`,
      to: voterData.email,
      subject: 'NTC E-Voting - Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to NTC E-Voting!</h1>
            </div>
            <div class="content">
              <p>Hello ${voterData.fullName},</p>
              <p>Your voter registration has been approved by the administrator. Please verify your email address to complete your registration.</p>
              <p><strong>Important:</strong> Your account will expire on ${new Date(expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px;">${verificationLink}</p>
              <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
              <p>If you did not register for NTC E-Voting, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} NTC E-Voting System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Log admin action
    await admin.firestore().collection('audit_logs').add({
      adminId: context.auth.uid,
      action: 'approve_voter',
      entityType: 'voter',
      entityId: voterId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        voterEmail: voterData.email,
        expirationDate: expirationDate,
      },
    });

    return {
      success: true,
      message: 'Voter approved and verification email sent successfully.',
    };
  } catch (error) {
    console.error('Error approving voter:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function to reject a voter registration
 * Updates status and optionally sends rejection email
 */
exports.rejectVoter = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is an admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to reject voters.'
    );
  }

  const { voterId, reason } = data;

  if (!voterId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'voterId is required.'
    );
  }

  try {
    const voterRef = admin.firestore().collection('voters').doc(voterId);
    const voterDoc = await voterRef.get();

    if (!voterDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Voter not found.');
    }

    const voterData = voterDoc.data();

    // Update voter status
    await voterRef.update({
      status: 'deactivated',
      rejectionReason: reason || 'Registration rejected by administrator',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send rejection email (optional)
    const mailOptions = {
      from: `"NTC E-Voting" <${process.env.EMAIL_USER}>`,
      to: voterData.email,
      subject: 'NTC E-Voting - Registration Status Update',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Status Update</h1>
            </div>
            <div class="content">
              <p>Hello ${voterData.fullName},</p>
              <p>We regret to inform you that your voter registration for NTC E-Voting has not been approved at this time.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>If you believe this is an error or have questions, please contact the administrator.</p>
              <p>Thank you for your understanding.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} NTC E-Voting System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Log admin action
    await admin.firestore().collection('audit_logs').add({
      adminId: context.auth.uid,
      action: 'reject_voter',
      entityType: 'voter',
      entityId: voterId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        voterEmail: voterData.email,
        reason: reason,
      },
    });

    return {
      success: true,
      message: 'Voter rejected and notification email sent.',
    };
  } catch (error) {
    console.error('Error rejecting voter:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function to verify email token
 * Updates voter status from approved_pending_verification to registered
 */
exports.verifyEmail = functions.https.onCall(async (data, context) => {
  const { token } = data;

  if (!token) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Verification token is required.'
    );
  }

  try {
    const tokenRef = admin.firestore().collection('email_verifications').doc(token);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invalid verification token.');
    }

    const tokenData = tokenDoc.data();

    // Check if token is already used
    if (tokenData.used) {
      throw new functions.https.HttpsError('failed-precondition', 'Token has already been used.');
    }

    // Check if token is expired
    const now = admin.firestore.Timestamp.now();
    if (tokenData.expiresAt < now) {
      throw new functions.https.HttpsError('failed-precondition', 'Token has expired.');
    }

    // Update voter status
    const voterRef = admin.firestore().collection('voters').doc(tokenData.voterId);
    await voterRef.update({
      status: 'registered',
      emailVerified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Mark token as used
    await tokenRef.update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
