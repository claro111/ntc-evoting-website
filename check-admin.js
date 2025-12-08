#!/usr/bin/env node

/**
 * Quick script to check if admin document exists in Firestore
 * 
 * Usage:
 *   node check-admin.js <user-uid>
 * 
 * Example:
 *   node check-admin.js abc123def456ghi789
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAdmin(uid) {
  try {
    console.log('\n🔍 Checking admin status...\n');
    console.log(`User UID: ${uid}\n`);

    // Check if admin document exists
    const adminRef = db.collection('admins').doc(uid);
    const adminDoc = await adminRef.get();

    if (!adminDoc.exists) {
      console.log('❌ Admin document NOT FOUND\n');
      console.log('📋 To fix this:\n');
      console.log('1. Go to Firebase Console → Firestore Database');
      console.log('2. Create/open the "admins" collection');
      console.log('3. Add a document with ID:', uid);
      console.log('4. Add these fields:');
      console.log('   - email (string): your@email.com');
      console.log('   - name (string): Your Name');
      console.log('   - role (string): admin');
      console.log('   - createdAt (timestamp): current date/time');
      console.log('   - mfaEnabled (boolean): false\n');
      process.exit(1);
    }

    const adminData = adminDoc.data();
    console.log('✅ Admin document FOUND\n');
    console.log('Admin Details:');
    console.log('─────────────────────────────────');
    console.log(`Name:         ${adminData.name || 'N/A'}`);
    console.log(`Email:        ${adminData.email || 'N/A'}`);
    console.log(`Role:         ${adminData.role || 'N/A'}`);
    console.log(`MFA Enabled:  ${adminData.mfaEnabled ? 'Yes' : 'No'}`);
    console.log(`Created At:   ${adminData.createdAt ? adminData.createdAt.toDate().toLocaleString() : 'N/A'}`);
    console.log('─────────────────────────────────\n');

    // Verify role is correct
    if (adminData.role !== 'admin') {
      console.log('⚠️  WARNING: Role is not set to "admin"');
      console.log('   Current role:', adminData.role);
      console.log('   Expected role: admin\n');
    } else {
      console.log('🎉 Admin account is properly configured!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get UID from command line argument
const uid = process.argv[2];

if (!uid) {
  console.error('\n❌ Error: User UID is required\n');
  console.log('Usage: node check-admin.js <user-uid>\n');
  console.log('Example: node check-admin.js abc123def456ghi789\n');
  console.log('To get your User UID:');
  console.log('1. Go to Firebase Console → Authentication → Users');
  console.log('2. Find your email and copy the User UID');
  console.log('3. OR open CHECK_ADMIN_STATUS.html in your browser\n');
  process.exit(1);
}

checkAdmin(uid);
