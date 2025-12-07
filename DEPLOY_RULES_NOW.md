# Deploy Firestore Rules NOW

## 🚨 CRITICAL: Your Firestore rules are NOT deployed yet!

The verification link is failing because the app can't read from the `email_verifications` collection.

## ⚡ Quick Fix (30 seconds)

### Option 1: Firebase CLI (Fastest)
```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/ntc-evoting-website/overview
```

### Option 2: Firebase Console (If CLI doesn't work)

1. Go to: https://console.firebase.google.com/project/ntc-evoting-website/firestore/rules

2. Replace the rules with this:
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY PERMISSIVE RULES FOR TESTING
    // TODO: Restore secure rules from firestore.rules.backup after testing
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## ✅ Verify It Worked

1. Go to your admin panel
2. Try to approve a voter
3. Should see: "Voter approved successfully"
4. Click the verification link
5. Should see: "Success! Your email has been successfully verified!"

## 🔄 After Testing

Once everything works, restore the secure rules:
```bash
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
```

---

**Do this NOW before testing the verification link!**
