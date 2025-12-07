# Testing Mode Setup - Bypass Firestore Permissions

## ⚠️ Quick Fix for Testing

You're getting "Missing or insufficient permissions" because your admin account isn't set up in Firestore yet. Here's a quick way to test without setting up the admin account:

---

## 🚀 Option 1: Use Testing Rules (Fastest)

### Step 1: Replace Firestore Rules

**Temporarily replace your rules with testing rules:**

```bash
# Backup your current rules
cp firestore.rules firestore.rules.backup

# Use testing rules
cp firestore.rules.testing firestore.rules

# Deploy testing rules
firebase deploy --only firestore:rules
```

### Step 2: Test Your App

Now you can:
- ✅ Approve/reject voters without permission errors
- ✅ Test all admin functionality
- ✅ Create positions and candidates
- ✅ Test the entire workflow

### Step 3: Restore Production Rules (IMPORTANT!)

**When you're done testing, restore the secure rules:**

```bash
# Restore production rules
cp firestore.rules.backup firestore.rules

# Deploy production rules
firebase deploy --only firestore:rules
```

---

## 🔒 Option 2: Set Up Admin Account Properly (Recommended for Production)

### Step 1: Get Your Firebase Auth UID

**Method A: From Firebase Console**
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click **Authentication** → **Users**
4. Find your admin email
5. Copy the **User UID**

**Method B: From Browser Console**
1. Login to your app
2. Press F12 (open console)
3. Type: `firebase.auth().currentUser.uid`
4. Copy the UID

### Step 2: Create Admin Document in Firestore

1. Go to Firebase Console → **Firestore Database**
2. Click **"Start collection"** (or add to existing)
3. Collection ID: `admins`
4. Document ID: **Paste your UID from Step 1**
5. Add fields:
   ```
   email: "your-email@ntc.edu.ph" (string)
   name: "Your Name" (string)
   role: "admin" (string)
   createdAt: [current timestamp]
   ```
6. Click **"Save"**

### Step 3: Deploy Production Rules

```bash
firebase deploy --only firestore:rules
```

### Step 4: Test

1. Logout and login again
2. Try approving a voter
3. Should work! ✅

---

## 📋 Quick Command Reference

### Use Testing Rules:
```bash
cp firestore.rules.testing firestore.rules
firebase deploy --only firestore:rules
```

### Restore Production Rules:
```bash
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
```

### Check Current Rules:
```bash
cat firestore.rules | head -5
```

If you see `// ⚠️ TESTING RULES`, you're using testing rules.

---

## ⚠️ IMPORTANT WARNINGS

### Testing Rules Are NOT Secure!

The testing rules (`firestore.rules.testing`) allow **ANY authenticated user** to:
- ✅ Read all data
- ✅ Modify all data
- ✅ Delete data
- ✅ Act as admin

**DO NOT use testing rules in production!**

### When to Use Testing Rules:

- ✅ Local development
- ✅ Testing features
- ✅ Quick prototyping
- ❌ **NEVER in production!**

### When to Use Production Rules:

- ✅ Production deployment
- ✅ After setting up admin accounts
- ✅ When security matters
- ✅ For the actual election

---

## 🎯 Recommended Workflow

### For Testing (Now):
1. Use testing rules
2. Test all features
3. Make sure everything works

### Before Production:
1. Set up admin accounts properly
2. Switch back to production rules
3. Test admin login
4. Verify permissions work correctly

---

## 🔍 How to Tell Which Rules You're Using

### Check the first few lines of `firestore.rules`:

**Testing Rules:**
```javascript
// ⚠️ TESTING RULES - DO NOT USE IN PRODUCTION! ⚠️
```

**Production Rules:**
```javascript
// Helper function to check if user is admin
function isAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/admins/$(request.auth.uid))
```

---

## 💡 Pro Tips

### Tip 1: Keep Both Files

Keep both `firestore.rules` (production) and `firestore.rules.testing` (testing) in your project. Switch between them as needed.

### Tip 2: Use Git

```bash
# Don't commit testing rules to production branch
git add firestore.rules.backup
git add firestore.rules.testing
```

### Tip 3: Document Your Admin UIDs

Keep a list of admin UIDs so you can easily add them to Firestore:

```
Admin 1: abc123xyz456... (admin@ntc.edu.ph)
Admin 2: def789uvw012... (admin2@ntc.edu.ph)
```

---

## 🆘 Still Having Issues?

### Error: "Missing or insufficient permissions" (with testing rules)

1. Make sure you deployed the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Check which rules are deployed:
   - Go to Firebase Console → Firestore Database → Rules tab
   - Look for the comment at the top

3. Try logging out and back in

### Error: "Permission denied" (with production rules)

1. Make sure your admin document exists in Firestore
2. Make sure the document ID matches your Firebase Auth UID exactly
3. Make sure the document has `role: "admin"`

---

## ✅ Quick Start for Testing

**Just run these commands:**

```bash
# Use testing rules
cp firestore.rules.testing firestore.rules
firebase deploy --only firestore:rules

# Test your app - everything should work now!

# When done testing, restore production rules
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
```

That's it! You can now test without permission errors! 🎉

---

## 📞 Need Help?

If you're still stuck, let me know:
- Which rules you're using (testing or production)
- The exact error message
- What you're trying to do

Good luck! 🚀
