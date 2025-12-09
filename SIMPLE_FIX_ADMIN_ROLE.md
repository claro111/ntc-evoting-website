# Simple Fix: Add Admin Role via Firebase Console

## The Problem
The Firestore security rules prevent updating admin documents unless you're already a superadmin. So we need to add the `role` field manually through Firebase Console.

## ✅ Step-by-Step Solution (5 minutes)

### Step 1: Get Your User ID

1. Open your admin panel in the browser
2. Press **F12** to open Developer Console
3. Go to the **Console** tab
4. Type this and press Enter:
   ```javascript
   firebase.auth().currentUser.uid
   ```
5. **Copy the ID** that appears (it looks like: `abc123xyz456...`)

**OR** get it from Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/project/ntc-evoting-website/authentication/users)
2. Click **Authentication** → **Users**
3. Find your email
4. Copy the **User UID**

---

### Step 2: Open Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/ntc-evoting-website/firestore)
2. Click **Firestore Database** in the left menu
3. You should see your collections

---

### Step 3: Find or Create Your Admin Document

**If `admins` collection exists:**
1. Click on the `admins` collection
2. Look for a document with ID matching your User UID
3. Click on that document

**If `admins` collection doesn't exist OR your document doesn't exist:**
1. Click **"Start collection"** (if no collections exist)
2. Collection ID: `admins`
3. Document ID: **Paste your User UID here**
4. Click **"Save"** (we'll add fields next)

---

### Step 4: Add/Update Fields

Click **"Add field"** or **"Edit"** and add these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | Your admin email (e.g., `admin@ntc.edu.ph`) |
| `name` | string | Your name (e.g., `Admin User`) |
| `role` | string | `superadmin` |
| `permissions` | array | See below ⬇️ |
| `createdAt` | timestamp | Click "Set to current time" |
| `updatedAt` | timestamp | Click "Set to current time" |
| `mfaEnabled` | boolean | `false` |

**For the `permissions` array field:**
1. Type: **array**
2. Click **"Add item"** for each permission:
   - `Approve Voters`
   - `View Dashboard`
   - `Export Reports`
   - `Edit Admins`
   - `Delete Voters`
   - `View Candidates`
   - `Reset Votes`
   - `View Announcements`

---

### Step 5: Save and Test

1. Click **"Update"** or **"Save"**
2. Go back to your admin panel
3. **Log out** completely
4. **Log back in**
5. Navigate to **"Manage Admins"**
6. You should now see the page! ✅

---

## Visual Guide

### What Your Admin Document Should Look Like:

```
Document ID: abc123xyz456... (your User UID)

Fields:
├─ email: "admin@ntc.edu.ph"
├─ name: "Admin User"
├─ role: "superadmin"
├─ permissions: [
│   "Approve Voters",
│   "View Dashboard",
│   "Export Reports",
│   "Edit Admins",
│   "Delete Voters",
│   "View Candidates",
│   "Reset Votes",
│   "View Announcements"
│  ]
├─ createdAt: December 9, 2025 at 10:30:00 AM UTC+8
├─ updatedAt: December 9, 2025 at 10:30:00 AM UTC+8
└─ mfaEnabled: false
```

---

## Quick Links

- [Firebase Console - Authentication](https://console.firebase.google.com/project/ntc-evoting-website/authentication/users)
- [Firebase Console - Firestore](https://console.firebase.google.com/project/ntc-evoting-website/firestore)

---

## Troubleshooting

### "I can't find my User UID"
- Log into your admin panel
- Press F12 → Console tab
- Type: `firebase.auth().currentUser.uid`
- Copy the result

### "The admins collection doesn't exist"
- That's okay! Create it:
- Click "Start collection"
- Collection ID: `admins`
- Add your first document with your User UID

### "I added the fields but still get permission errors"
- Make sure the document ID matches your User UID exactly
- Log out and log back in
- Clear browser cache (Ctrl+Shift+Delete)
- Check that `role` field is exactly `"superadmin"` (lowercase, no spaces)

### "I see the page but no admins show up"
- That's normal if you're the only admin
- The yellow banner should show your info
- Try clicking "Add New Admin" to add another admin

---

## After This Works

Once you can access the Manage Admins page:
- ✅ You can add more admins through the UI
- ✅ You can assign roles (Super Admin or Moderator)
- ✅ You can manage permissions
- ✅ No more manual Firebase Console edits needed!

---

**Need Help?** Take a screenshot of your Firestore admin document and check that all fields match the example above.
