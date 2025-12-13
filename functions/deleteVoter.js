const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

/**
 * Simple Cloud Function to permanently delete a voter
 * HTTP endpoint with CORS support
 */
exports.deleteVoterPermanently = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Get the authorization token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No valid token provided' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Check if user is an admin
      const adminDoc = await admin.firestore().collection('admins').doc(decodedToken.uid).get();
      if (!adminDoc.exists) {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const { voterId } = req.body;
      if (!voterId) {
        res.status(400).json({ error: 'voterId is required' });
        return;
      }

      const voterRef = admin.firestore().collection('voters').doc(voterId);
      const voterDoc = await voterRef.get();

      if (!voterDoc.exists) {
        res.status(404).json({ error: 'Voter not found' });
        return;
      }

      const voterData = voterDoc.data();

      // Delete user from Firebase Authentication if they have an auth account
      let authDeleted = false;
      try {
        await admin.auth().deleteUser(voterId);
        console.log(`Successfully deleted user ${voterId} from Firebase Auth`);
        authDeleted = true;
      } catch (authError) {
        console.log(`User ${voterId} not found in Firebase Auth or already deleted:`, authError.message);
        // Continue with Firestore deletion even if auth deletion fails
      }

      // Delete verification documents from storage if they exist
      if (voterData.verificationDocuments && voterData.verificationDocuments.length > 0) {
        const bucket = admin.storage().bucket();
        for (const docUrl of voterData.verificationDocuments) {
          try {
            // Extract file path from URL
            const filePath = docUrl.split('/o/')[1]?.split('?')[0];
            if (filePath) {
              const decodedPath = decodeURIComponent(filePath);
              await bucket.file(decodedPath).delete();
              console.log(`Deleted verification document: ${decodedPath}`);
            }
          } catch (storageError) {
            console.error('Error deleting verification document:', storageError);
            // Continue even if storage deletion fails
          }
        }
      }

      // Delete related data from other collections
      const batch = admin.firestore().batch();

      // Delete email verification tokens
      const emailVerificationsQuery = await admin.firestore()
        .collection('email_verifications')
        .where('voterId', '==', voterId)
        .get();
      
      emailVerificationsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete vote receipts (keep votes anonymous but remove receipts)
      const voteReceiptsQuery = await admin.firestore()
        .collection('vote_receipts')
        .where('voterId', '==', voterId)
        .get();
      
      voteReceiptsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete the voter document from Firestore
      batch.delete(voterRef);

      // Commit all deletions
      await batch.commit();

      // Log admin action
      await admin.firestore().collection('audit_logs').add({
        adminId: decodedToken.uid,
        action: 'delete_voter_permanently',
        entityType: 'voter',
        entityId: voterId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          voterEmail: voterData.email,
          voterName: voterData.fullName,
          deletedFromAuth: authDeleted,
          deletedFromFirestore: true,
        },
      });

      const message = authDeleted 
        ? 'Voter permanently deleted from all systems including Firebase Authentication.'
        : 'Voter deleted from Firestore. Firebase Auth account may not exist or was already deleted.';

      res.status(200).json({
        success: true,
        message: message,
        authDeleted: authDeleted
      });

    } catch (error) {
      console.error('Error permanently deleting voter:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
});