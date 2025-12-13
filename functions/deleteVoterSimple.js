const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin (only if not already initialized)
try {
  initializeApp();
} catch (error) {
  // App already initialized
}

exports.deleteVoterPermanently = onRequest({
  cors: true,
  region: 'us-central1'
}, async (req, res) => {
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
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Check if user is an admin
    const adminDoc = await getFirestore().collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const { voterId } = req.body;
    if (!voterId) {
      res.status(400).json({ error: 'voterId is required' });
      return;
    }

    const voterRef = getFirestore().collection('voters').doc(voterId);
    const voterDoc = await voterRef.get();

    if (!voterDoc.exists) {
      res.status(404).json({ error: 'Voter not found' });
      return;
    }

    const voterData = voterDoc.data();

    // Delete user from Firebase Authentication
    let authDeleted = false;
    try {
      await getAuth().deleteUser(voterId);
      console.log(`Successfully deleted user ${voterId} from Firebase Auth`);
      authDeleted = true;
    } catch (authError) {
      console.log(`User ${voterId} not found in Firebase Auth:`, authError.message);
    }

    // Delete verification documents from Firebase Storage
    let storageDeleted = false;
    let deletedFiles = [];
    try {
      const bucket = getStorage().bucket();
      
      // Check for verification documents in voter data
      if (voterData.verificationDocuments && Array.isArray(voterData.verificationDocuments)) {
        for (const docUrl of voterData.verificationDocuments) {
          try {
            // Extract file path from URL
            const filePath = docUrl.split('/o/')[1]?.split('?')[0];
            if (filePath) {
              const decodedPath = decodeURIComponent(filePath);
              await bucket.file(decodedPath).delete();
              deletedFiles.push(decodedPath);
              console.log(`Deleted verification document: ${decodedPath}`);
            }
          } catch (fileError) {
            console.error(`Error deleting file ${docUrl}:`, fileError.message);
          }
        }
      }

      // Also check for single verification document (older format)
      if (voterData.verificationDocUrl) {
        try {
          const filePath = voterData.verificationDocUrl.split('/o/')[1]?.split('?')[0];
          if (filePath) {
            const decodedPath = decodeURIComponent(filePath);
            await bucket.file(decodedPath).delete();
            deletedFiles.push(decodedPath);
            console.log(`Deleted verification document: ${decodedPath}`);
          }
        } catch (fileError) {
          console.error(`Error deleting file ${voterData.verificationDocUrl}:`, fileError.message);
        }
      }

      // Try to delete common verification document paths for this voter
      const commonPaths = [
        `verification-documents/${voterId}`,
        `verification-documents/${voterData.email}`,
        `verification-documents/${voterData.studentId}`,
        `documents/${voterId}`,
        `uploads/${voterId}`
      ];

      for (const path of commonPaths) {
        try {
          const [files] = await bucket.getFiles({ prefix: path });
          for (const file of files) {
            await file.delete();
            deletedFiles.push(file.name);
            console.log(`Deleted verification document: ${file.name}`);
          }
        } catch (pathError) {
          // Ignore errors for paths that don't exist
        }
      }

      if (deletedFiles.length > 0) {
        storageDeleted = true;
        console.log(`Successfully deleted ${deletedFiles.length} files from Firebase Storage`);
      }
    } catch (storageError) {
      console.error('Error deleting verification documents from storage:', storageError.message);
    }

    // Delete related data from Firestore
    const batch = getFirestore().batch();

    // Delete email verification tokens
    const emailVerificationsQuery = await getFirestore()
      .collection('email_verifications')
      .where('voterId', '==', voterId)
      .get();
    
    emailVerificationsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete vote receipts
    const voteReceiptsQuery = await getFirestore()
      .collection('vote_receipts')
      .where('voterId', '==', voterId)
      .get();
    
    voteReceiptsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the voter document
    batch.delete(voterRef);

    // Commit all deletions
    await batch.commit();

    // Log admin action
    await getFirestore().collection('audit_logs').add({
      adminId: decodedToken.uid,
      action: 'delete_voter_permanently',
      entityType: 'voter',
      entityId: voterId,
      timestamp: new Date(),
      details: {
        voterEmail: voterData.email,
        voterName: voterData.fullName,
        deletedFromAuth: authDeleted,
        deletedFromFirestore: true,
        deletedFromStorage: storageDeleted,
        deletedFiles: deletedFiles,
        storageFilesCount: deletedFiles.length
      },
    });

    let message = 'Voter permanently deleted from ';
    const deletedSystems = [];
    
    if (authDeleted) deletedSystems.push('Firebase Authentication');
    deletedSystems.push('Firestore Database');
    if (storageDeleted) deletedSystems.push(`Firebase Storage (${deletedFiles.length} files)`);
    
    message += deletedSystems.join(', ') + '.';

    res.status(200).json({
      success: true,
      message: message,
      authDeleted: authDeleted,
      storageDeleted: storageDeleted,
      deletedFilesCount: deletedFiles.length,
      deletedFiles: deletedFiles
    });

  } catch (error) {
    console.error('Error permanently deleting voter:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});