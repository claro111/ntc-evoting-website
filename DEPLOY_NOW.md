# 🚨 DEPLOY FIRESTORE RULES NOW

## The Problem

You're getting permission errors because:
1. **Firestore rules haven't been deployed** - still using old rules
2. **You might not be registered as an admin** in the database

## STEP 1: Deploy Firestore Rules (REQUIRED)

Open terminal and run:

```bash
cd ntc-evoting
firebase deploy --only firestore
```

Wait for it to complete. You should see:
```
✔  Deploy complete!
```

## STEP 2: Check if You're an Admin

After deploying, you need to verify you're registered as an admin in Firestore.

### Option A: Check in Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project: `ntc-evoting-website`
3. Go to **Firestore Database**
4. Look for `admins` collection
5. Check if your admin email exists there

### Option B: Use the Admin Setup

If you're not in the admins collection:

1. **Login to your admin panel**
2. **Check the browser console** (F12)
3. **Look for your user ID**
4. **Manually add yourself to Firestore**:
   - Go to Firebase Console → Firestore
   - Create collection: `admins`
   - Add document with your UID as the document ID
   - Add fields: `email`, `createdAt`, etc.

## STEP 3: Test Again

After deploying:

1. **Refresh your admin page** (Ctrl+Shift+R)
2. **Try posting an announcement**
3. **Should work now!**

## Quick Commands

```bash
# Deploy everything
cd ntc-evoting
firebase deploy --only firestore

# Or deploy separately
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Still Not Working?

Check the browser console (F12) for the exact error message and share it with me.

---

**DO THIS NOW**: Run `firebase deploy --only firestore` 🚀
