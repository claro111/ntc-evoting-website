const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (only if not already initialized)
try {
  initializeApp();
} catch (error) {
  // App already initialized
}

exports.deleteAdminPermanently = onRequest({
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
    
    // Check if user is a superadmin
    const adminDoc = await getFirestore().collection('admins').doc(decodedToken.uid).get();
    if (!adminDoc.exists || adminDoc.data().role !== 'superadmin') {
      res.status(403).json({ error: 'Forbidden: Superadmin access required' });
      return;
    }

    const { adminId } = req.body;
    if (!adminId) {
      res.status(400).json({ error: 'adminId is required' });
      return;
    }

    // Prevent self-deletion
    if (adminId === decodedToken.uid) {
      res.status(400).json({ error: 'Cannot delete your own admin account' });
      return;
    }

    const adminRef = getFirestore().collection('admins').doc(adminId);
    const adminDocToDelete = await adminRef.get();

    if (!adminDocToDelete.exists) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const adminData = adminDocToDelete.data();

    // Delete user from Firebase Authentication
    let authDeleted = false;
    try {
      await getAuth().deleteUser(adminId);
      console.log(`Successfully deleted admin ${adminId} from Firebase Auth`);
      authDeleted = true;
    } catch (authError) {
      console.log(`Admin ${adminId} not found in Firebase Auth:`, authError.message);
    }

    // Delete related data from Firestore
    const batch = getFirestore().batch();

    // Delete audit logs related to this admin
    const auditLogsQuery = await getFirestore()
      .collection('audit_logs')
      .where('adminId', '==', adminId)
      .get();
    
    auditLogsQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the admin document
    batch.delete(adminRef);

    // Commit all deletions
    await batch.commit();

    // Log admin action
    await getFirestore().collection('audit_logs').add({
      adminId: decodedToken.uid,
      action: 'delete_admin_permanently',
      entityType: 'admin',
      entityId: adminId,
      timestamp: new Date(),
      details: {
        adminEmail: adminData.email,
        adminName: adminData.name,
        adminRole: adminData.role,
        deletedFromAuth: authDeleted,
        deletedFromFirestore: true
      },
    });

    let message = 'Admin permanently deleted from ';
    const deletedSystems = [];
    
    if (authDeleted) deletedSystems.push('Firebase Authentication');
    deletedSystems.push('Firestore Database');
    
    message += deletedSystems.join(', ') + '.';

    res.status(200).json({
      success: true,
      message: message,
      authDeleted: authDeleted,
      deletedFromFirestore: true
    });

  } catch (error) {
    console.error('Error permanently deleting admin:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});