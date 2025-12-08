# 🔧 Fix Announcements Not Showing on Voter Page

## Problem

Announcements created in the admin panel are not showing on the voter announcement page.

## Root Causes

1. **Missing Firestore Index**: The query `where('isActive', '==', true) + orderBy('createdAt', 'desc')` requires a composite index
2. **Firestore Rules**: Announcements require authentication, but voters need to read them

## Solutions

### Solution 1: Deploy Firestore Index (REQUIRED)

The index has been added to `firestore.indexes.json`. You need to deploy it:

```bash
cd ntc-evoting
firebase deploy --only firestore:indexes
```

**Expected output:**
```
✔  Deploy complete!
```

### Solution 2: Update Firestore Rules (OPTIONAL - for better security)

Currently, announcements require authentication. If you want unauthenticated users to see announcements, update the rules:

**Current rule:**
```javascript
match /announcements/{announcementId} {
  allow read: if request.auth != null;  // Requires login
  allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

**Recommended rule (if you want public announcements):**
```javascript
match /announcements/{announcementId} {
  allow read: if true;  // Anyone can read announcements
  allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

Then deploy:
```bash
firebase deploy --only firestore:rules
```

## Step-by-Step Fix

### Step 1: Open Terminal in ntc-evoting folder

```bash
cd ntc-evoting
```

### Step 2: Deploy the Firestore Index

```bash
firebase deploy --only firestore:indexes
```

Wait for deployment to complete (may take 1-2 minutes).

### Step 3: Test the Fix

1. **Open the debug tool**: Open `ntc-evoting/DEBUG_ANNOUNCEMENTS.html` in your browser
2. **Click "Run Diagnostics"**
3. **Check the results**:
   - Should show all announcements
   - Should show active announcements
   - Should indicate if index is ready

### Step 4: Verify on Voter Page

1. **Login as a voter**
2. **Go to Announcements page**
3. **You should see your announcements**

## Alternative: Simplify the Query (Quick Fix)

If you don't want to deal with indexes, you can simplify the voter page query:

**Option A: Remove the isActive filter**

In `src/pages/AnnouncementPage.jsx`, change:

```javascript
// FROM:
const announcementsQuery = query(
  announcementsRef,
  where('isActive', '==', true),
  orderBy('createdAt', 'desc')
);

// TO:
const announcementsQuery = query(
  announcementsRef,
  orderBy('createdAt', 'desc')
);
```

This will show ALL announcements (no filtering by isActive).

**Option B: Filter in JavaScript instead of Firestore**

```javascript
const announcementsQuery = query(
  announcementsRef,
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(
  announcementsQuery,
  (snapshot) => {
    const announcementsData = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))
      .filter(announcement => announcement.isActive === true);  // Filter in JS
    
    setAnnouncements(announcementsData);
    setLoading(false);
  }
);
```

## Debugging

### Use the Debug Tool

Open `DEBUG_ANNOUNCEMENTS.html` in your browser to check:

1. ✅ Are announcements in the database?
2. ✅ Do they have `isActive: true`?
3. ✅ Is the Firestore index ready?
4. ✅ Are there any permission errors?

### Check Browser Console

Open the voter announcement page and check the browser console (F12) for errors:

- **"Missing or insufficient permissions"** → Firestore rules issue
- **"The query requires an index"** → Index not deployed yet
- **No errors but no announcements** → Check if announcements have `isActive: true`

## Expected Behavior After Fix

✅ **Admin creates announcement** → Appears immediately on voter page  
✅ **Admin edits announcement** → Updates immediately on voter page  
✅ **Admin deletes announcement** → Removes immediately from voter page  
✅ **Real-time sync** → No page refresh needed  

## Files Modified

- ✅ `firestore.indexes.json` - Added composite index for announcements
- 📄 `DEBUG_ANNOUNCEMENTS.html` - Created diagnostic tool
- 📄 `FIX_ANNOUNCEMENTS_SYNC.md` - This file

## Commands Summary

```bash
# Deploy index (REQUIRED)
cd ntc-evoting
firebase deploy --only firestore:indexes

# Deploy rules (OPTIONAL - if you updated them)
firebase deploy --only firestore:rules

# Deploy both
firebase deploy --only firestore
```

## Verification Checklist

- [ ] Firestore index deployed
- [ ] Announcements have `isActive: true` field
- [ ] Voter is logged in (if rules require auth)
- [ ] Browser console shows no errors
- [ ] Announcements appear on voter page
- [ ] Real-time sync works (add announcement in admin, see it on voter page)

---

**Next Step**: Run `firebase deploy --only firestore:indexes` to deploy the index! 🚀
