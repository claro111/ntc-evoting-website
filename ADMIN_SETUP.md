# Admin Account Setup Guide

This guide explains how to set up admin accounts for the NTC E-Voting system.

## Prerequisites

- Firebase project set up
- Firebase Console access
- Firestore database created

## Step 1: Create Admin User in Firebase Authentication

1. Go to Firebase Console → Authentication → Users
2. Click "Add User"
3. Enter admin email (e.g., `admin@ntc.edu.ph`)
4. Enter a secure password
5. Click "Add User"
6. Copy the User UID (you'll need this for Step 2)

## Step 2: Add Admin Document to Firestore

1. Go to Firebase Console → Firestore Database
2. Create a new collection called `admins` (if it doesn't exist)
3. Add a new document with the following structure:

```
Document ID: [Use the User UID from Step 1]

Fields:
- email: "admin@ntc.edu.ph" (string)
- name: "Admin Name" (string)
- role: "admin" (string)
- createdAt: [Current timestamp]
- mfaEnabled: false (boolean)
```

### Example using Firebase Console:

1. Click "Start collection"
2. Collection ID: `admins`
3. Document ID: `[paste the User UID]`
4. Add fields:
   - Field: `email`, Type: string, Value: `admin@ntc.edu.ph`
   - Field: `name`, Type: string, Value: `Admin Name`
   - Field: `role`, Type: string, Value: `admin`
   - Field: `createdAt`, Type: timestamp, Value: [current date/time]
   - Field: `mfaEnabled`, Type: boolean, Value: `false`

## Step 3: Test Admin Login

1. Navigate to `/admin/login` in your application
2. Enter the admin email and password
3. Click "Sign In"
4. You should be redirected to the admin dashboard

## Creating Additional Admin Accounts

Repeat Steps 1 and 2 for each additional admin account you want to create.

## Security Notes

- Admin passwords should be strong and unique
- Store admin credentials securely
- Consider enabling MFA for admin accounts in production
- Regularly review admin access logs
- Remove admin access for users who no longer need it

## Firestore Security Rules

Ensure your Firestore security rules protect the `admins` collection:

```javascript
match /admins/{adminId} {
  // Only authenticated admins can read admin documents
  allow read: if request.auth != null && 
              exists(/databases/$(database)/documents/admins/$(request.auth.uid));
  
  // No one can write to admins collection from client
  // (use Firebase Console or Cloud Functions only)
  allow write: if false;
}
```

## Troubleshooting

### "Access denied. Admin credentials required."

This error means the user exists in Firebase Authentication but not in the `admins` collection. Follow Step 2 to add the admin document.

### "Invalid email or password"

Check that:
- The email is correct
- The password is correct
- The user exists in Firebase Authentication

### Cannot access admin dashboard

Verify that:
- The admin document exists in Firestore
- The document ID matches the user's UID
- The `role` field is set to "admin"
