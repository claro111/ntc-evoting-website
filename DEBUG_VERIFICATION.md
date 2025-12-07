# Debug Verification Issue

## Steps to Debug

### 1. Check Browser Console

1. Click the verification link
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for error messages (in red)

**Common errors:**

- `Missing or insufficient permissions` → Firestore rules not deployed
- `Invalid verification token` → Token not found in database
- `Token has expired` → Token older than 24 hours
- `Token has already been used` → Token was already used

### 2. Check Firestore Rules in Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: **ntc-evoting-website**
3. Click **Firestore Database** → **Rules** tab
4. Check if rules look like this:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

If NOT, update them and click **Publish**.

### 3. Check if Token Exists in Firestore

1. Go to Firebase Console → Firestore Database
2. Click on **`email_verifications`** collection
3. Look for a document with your token
4. Check these fields:
   - `token`: Should match the token in your URL
   - `used`: Should be `false`
   - `expiresAt`: Should be in the future

### 4. Try Logging In First

The verification might require you to be logged in. Try this:

1. **Login as the voter** (use the email/password you registered with)
2. **Then click the verification link**
3. See if it works now

### 5. Get a Fresh Token

The token might be expired or invalid. Get a new one:

1. Login as **admin**
2. Go to **Manage Voters**
3. Find the voter
4. Click **"Review"** → **"Approve"** again
5. Copy the new verification link from the success message
6. Try the new link

### 6. Check if User is Authenticated

The Firestore rules require `request.auth != null`, which means the user must be logged in.

**Solution:** The voter needs to **login first** before clicking the verification link!

Try this:
1. Login as the voter
2. Then click the verification link
3. Should work now!

---

## Quick Fix

The most likely issue is that **the voter needs to be logged in** to verify their email because of the Firestore rules.

### Option A: Login First (Recommended)

1. Go to voter login page
2. Login with your email and password
3. Then click the verification link
4. Should work!

### Option B: Make Verification Public (Not Recommended for Production)

Update Firestore rules to allow unauthenticated verification:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow unauthenticated access to email_verifications for verification
    match /email_verifications/{verificationId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // All other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Most Likely Solution

**The voter needs to login BEFORE clicking the verification link!**

Current flow (NOT WORKING):
1. Voter receives email
2. Clicks verification link (not logged in)
3. ❌ Fails because Firestore rules require authentication

Correct flow (WORKING):
1. Voter receives email
2. **Voter logs in first**
3. Clicks verification link (now logged in)
4. ✅ Works!

---

## Alternative: Allow Unauthenticated Verification

If you want voters to verify WITHOUT logging in first, update the Firestore rules to allow public read access to the `email_verifications` collection.

See Option B above for the rules.

---

## Summary

Try logging in as the voter FIRST, then click the verification link. That should fix it!
