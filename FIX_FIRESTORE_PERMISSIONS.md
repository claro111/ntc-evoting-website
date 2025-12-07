# Fix: Missing or Insufficient Permissions

## ❌ Error You're Seeing:
```
Missing or insufficient permissions
```

This error means your Firestore security rules are blocking the operation. This happens because:
1. You're not logged in as an admin with proper permissions
2. Your admin account doesn't exist in the `admins` collection in Firestore

---

## ✅ Solution: Set Up Your Admin Account in Firestore

### Step 1: Deploy Updated Firestore Rules

I've updated your `firestore.rules` file to include the `email_verifications` collection.

**Deploy the new rules:**

```bash
firebase deploy --only firestore:rules
```

### Step 2: Create Your Admin Account in Firestore

You need to manually add your admin account to Firestore:

#### Option A: Using Firebase Console (Recommended)

1. Go to https://console.firebase.google.com/
2. Select your project: **ntc-evoting-website**
3. Click **"Firestore Database"** (left sidebar)
4. Click **"Start collection"** (if this is your first collection)
5. Collection ID: `admins`
6. Click **"Next"**

7. **Add your first admin document:**
   - Document ID: **Use your Firebase Auth UID** (see below how to get it)
   - Add fields:
     ```
     email: "your-admin-email@ntc.edu.ph" (string)
     name: "Admin Name" (string)
     role: "admin" (string)
     createdAt: [Click "timestamp" and select current time]
     ```
8. Click **"Save"**

#### How to Get Your Firebase Auth UID:

**Method 1: From Firebase Console**
1. Go to Firebase Console → **Authentication**
2. Click **"Users"** tab
3. Find your admin email
4. Copy the **User UID** (long string like: `abc123xyz456...`)

**Method 2: From Browser Console**
1. Login to your app as admin
2. Open browser console (F12)
3. Type: `firebase.auth().currentUser.uid`
4. Copy the UID

#### Option B: Using Firebase CLI

```bash
# Login to Firebase
firebase login

# Open Firestore in browser
firebase firestore:shell

# Add admin document (replace YOUR_UID and YOUR_EMAIL)
db.collection('admins').doc('YOUR_UID').set({
  email: 'your-admin-email@ntc.edu.ph',
  name: 'Admin Name',
  role: 'admin',
  createdAt: new Date()
})
```

---

## 🔍 Verify Your Setup

### Check 1: Firestore Rules Deployed

```bash
firebase deploy --only firestore:rules
```

You should see:
```
✔  Deploy complete!
```

### Check 2: Admin Document Exists

1. Go to Firebase Console → Firestore Database
2. Look for `admins` collection
3. You should see a document with your UID
4. Document should have: `email`, `name`, `role: "admin"`

### Check 3: Test Admin Login

1. Logout from your app
2. Login again with your admin email
3. The system will check if you exist in `admins` collection
4. If successful, you'll be redirected to admin dashboard

---

## 🧪 Test Approving a Voter

After setting up your admin account:

1. Login as admin
2. Go to "Manage Voters"
3. Click "Review" on a pending voter
4. Set expiration date
5. Click "Approve"
6. Should work without "insufficient permissions" error! ✅

---

## 📋 Complete Setup Checklist

- [ ] Updated `firestore.rules` file (already done!)
- [ ] Deployed Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Got your Firebase Auth UID
- [ ] Created `admins` collection in Firestore
- [ ] Added your admin document with correct UID
- [ ] Verified admin document has `role: "admin"`
- [ ] Logged out and logged back in
- [ ] Tested approving a voter
- [ ] No more "insufficient permissions" error! ✅

---

## ⚠️ Common Issues

### Issue 1: "Still getting permission error"

**Solution:** Make sure the document ID in `admins` collection matches your Firebase Auth UID exactly!

To verify:
1. Login to your app
2. Open browser console (F12)
3. Type: `firebase.auth().currentUser.uid`
4. Compare with document ID in Firestore `admins` collection
5. They must match EXACTLY!

### Issue 2: "Can't find my UID"

**Solution:** 
1. Go to Firebase Console → Authentication → Users
2. Your UID is in the "User UID" column
3. It's a long string like: `xYz123AbC456DeF789...`

### Issue 3: "Rules not updating"

**Solution:**
```bash
# Force deploy rules
firebase deploy --only firestore:rules --force
```

---

## 🎯 Quick Fix Summary

1. **Deploy rules:** `firebase deploy --only firestore:rules`
2. **Get your UID:** Firebase Console → Authentication → Users
3. **Add admin:** Firestore → Create `admins` collection → Add document with your UID
4. **Set fields:** `email`, `name`, `role: "admin"`
5. **Test:** Login and try approving a voter

---

## 💡 Pro Tip

Once you have one admin set up, you can create a feature in your admin panel to add more admins without manually editing Firestore!

---

## 🆘 Still Not Working?

If you're still getting the error:

1. **Check browser console (F12)** for detailed error messages
2. **Verify your UID** matches the document ID in `admins` collection
3. **Make sure you deployed the rules:** `firebase deploy --only firestore:rules`
4. **Try logging out and back in** to refresh your authentication

Let me know if you need help with any of these steps! 🚀
