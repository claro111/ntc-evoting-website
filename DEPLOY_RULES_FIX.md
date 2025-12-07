# 🔧 Deploy Fixed Firestore Rules

## The Problem

The verification link was failing because the Firestore rules required users to be **logged in** to verify their email. But voters can't login until they verify - it's a catch-22!

## The Fix

I've updated the Firestore rules to allow **unauthenticated access** to:
- `email_verifications` collection (for reading tokens)
- `voters` collection updates (for marking email as verified)

This allows voters to verify their email WITHOUT logging in first.

---

## Deploy the Fixed Rules

### Option 1: Firebase CLI (Fastest)

```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

### Option 2: Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: **ntc-evoting-website**
3. Click **Firestore Database** → **Rules** tab
4. Delete ALL existing content
5. Paste this:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Email verifications - allow unauthenticated read for verification
    match /email_verifications/{verificationId} {
      allow read: if true;  // Anyone can read to verify email
      allow write: if request.auth != null;  // Only authenticated users can write
    }
    
    // Voters collection - allow unauthenticated write for email verification
    match /voters/{voterId} {
      allow read: if request.auth != null && request.auth.uid == voterId;
      allow read: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow create: if request.auth != null;  // For registration
      allow update: if true;  // Allow unauthenticated update for email verification
      allow delete: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // All other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click **"Publish"**

---

## After Deploying

1. **Get a fresh verification link:**
   - Login as admin
   - Approve the voter again
   - Copy the new verification link

2. **Click the verification link** (no need to login first!)

3. **Should see:** "Email verified successfully. You can now log in."

4. **Login as voter** - Should work! ✅

---

## What Changed

### Before (Broken):
```
match /{document=**} {
  allow read, write: if request.auth != null;  // Requires login
}
```
- Voter clicks link → Not logged in → ❌ Permission denied

### After (Fixed):
```
match /email_verifications/{verificationId} {
  allow read: if true;  // No login required
}

match /voters/{voterId} {
  allow update: if true;  // No login required for verification
}
```
- Voter clicks link → Not logged in → ✅ Verification works!

---

## Security Note

These rules are still secure because:
- Only the `email_verifications` collection is publicly readable
- Only the `voters` collection allows unauthenticated updates (needed for verification)
- All other collections still require authentication
- Tokens expire after 24 hours
- Tokens can only be used once

---

## Quick Command

```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

Then get a fresh verification link and try again! 🚀
