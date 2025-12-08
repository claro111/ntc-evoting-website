# 🚀 Deploy Announcements Fix - QUICK GUIDE

## Problem
"Missing or insufficient permissions" error when trying to view announcements.

## Solution
Deploy the updated Firestore rules and indexes.

## Commands to Run

Open your terminal in the `ntc-evoting` folder and run:

```bash
# Navigate to project folder
cd ntc-evoting

# Deploy BOTH rules and indexes
firebase deploy --only firestore
```

**OR deploy them separately:**

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## What This Does

1. **Firestore Rules**: Allows authenticated voters to read announcements
2. **Firestore Index**: Creates composite index for `isActive + createdAt` query

## After Deployment

### Test 1: Login and Check

1. **Login as a voter** on your voter website
2. **Go to Announcements page**
3. **You should see announcements**

### Test 2: Run Debug Tool

1. **Login as admin or voter first**
2. **Open `DEBUG_ANNOUNCEMENTS.html`** in browser
3. **Click "Run Diagnostics"**
4. **Should show your announcements**

### Test 3: Real-Time Sync

1. **Keep voter announcement page open**
2. **Login as admin in another tab**
3. **Create a new announcement**
4. **Watch it appear on voter page automatically**

## Troubleshooting

### Still Getting Permission Error?

**Make sure you're logged in!**
- Announcements require authentication
- Login as voter or admin first
- Then try viewing announcements

### Announcements Still Not Showing?

1. **Check if announcements exist**:
   - Login as admin
   - Go to Manage Announcements
   - Create at least one announcement

2. **Check browser console** (F12):
   - Look for errors
   - "Missing index" → Wait a few minutes for index to build
   - "Permission denied" → Make sure you're logged in

3. **Hard refresh the page**:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### Index Taking Too Long?

Firestore indexes can take 1-5 minutes to build. If it's taking longer:

1. **Check Firebase Console**:
   - Go to https://console.firebase.google.com
   - Select your project
   - Go to Firestore Database → Indexes
   - Check if index is "Building" or "Enabled"

2. **Wait for "Enabled" status**
3. **Then test again**

## Expected Behavior

✅ **Voter logs in** → Can see announcements  
✅ **Admin creates announcement** → Appears on voter page immediately  
✅ **Admin edits announcement** → Updates on voter page immediately  
✅ **Admin deletes announcement** → Removes from voter page immediately  
✅ **Real-time sync** → No page refresh needed  

## Quick Checklist

- [ ] Run `firebase deploy --only firestore`
- [ ] Wait for deployment to complete
- [ ] Login as voter
- [ ] Go to announcements page
- [ ] Verify announcements are visible
- [ ] Test real-time sync (add announcement in admin)

---

**Next Step**: Run the deployment command now! 🚀

```bash
cd ntc-evoting
firebase deploy --only firestore
```
