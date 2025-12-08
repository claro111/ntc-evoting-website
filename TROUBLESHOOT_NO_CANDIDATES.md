# 🔧 Troubleshooting: No Candidates Showing

## Problem

Candidates added in admin panel are not showing on voter website (homepage or voting page shows "No candidates found").

## Quick Diagnostic

**Open this file in your browser**: `DEBUG_CANDIDATE_SYNC.html`

This tool will check:
- ✅ Are you logged in?
- ✅ Do positions exist?
- ✅ Do candidates exist?
- ✅ Do position names match?
- ✅ Is there an active election?

## Common Causes & Solutions

### Cause 1: Not Logged In as Voter

**Symptom**: Voting page shows "No candidates found"

**Why**: Firestore rules require authentication to read candidates

**Solution**:
1. Go to `/voter/login`
2. Log in with voter credentials
3. Go back to voting page or homepage

### Cause 2: No Positions Created

**Symptom**: Can't add candidates or candidates have no position

**Why**: Candidates must be assigned to a position

**Solution**:
1. Go to Admin Panel → Manage Candidates
2. Click "Positions" tab
3. Add positions:
   - President
   - Vice President
   - Secretary
   - Treasurer
   - etc.
4. Then add candidates and assign them to these positions

### Cause 3: No Candidates in Database

**Symptom**: "No candidates found" on voter website

**Why**: No candidates have been added yet

**Solution**:
1. Go to Admin Panel → Manage Candidates
2. Click "Candidates" tab
3. Click "Add Candidate"
4. Fill in ALL fields:
   - Name: Required
   - Position: Required (select from dropdown)
   - Bio: Required
   - Platform: Required
   - Photo: Optional but recommended
5. Click "Save"
6. Verify candidate appears in the list

### Cause 4: Position Name Mismatch

**Symptom**: Candidates exist but don't show on voter website

**Why**: Candidate's position doesn't match any position name exactly

**Example**:
- Position in database: "President"
- Candidate's position: "president" ❌ (lowercase)
- Result: Won't match!

**Solution**:
1. Check position names in Positions tab
2. Make sure candidate positions match EXACTLY (case-sensitive)
3. Edit candidates if needed to fix position names

### Cause 5: No Active Election

**Symptom**: Voting page shows "Voting is currently closed"

**Why**: Voting page requires an active election

**Note**: Homepage should still show featured candidates even without an active election

**Solution**:
1. Go to Admin Panel → Voting Control
2. Create an election
3. Set status to "active"
4. Set start and end dates
5. Make sure current time is between start and end dates

### Cause 6: Permission Errors

**Symptom**: Browser console shows "Missing or insufficient permissions"

**Why**: Admin document missing in Firestore (see earlier fix)

**Solution**: See `READ_ME_FIRST.md` for admin setup

### Cause 7: Page Not Refreshed

**Symptom**: Added candidates but they don't appear

**Why**: Sometimes the real-time listener doesn't establish on first load

**Solution**:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Or close and reopen the browser tab
3. Or clear browser cache

## Step-by-Step Verification

### Step 1: Check Admin Panel

1. **Go to**: `/admin/candidates`
2. **Click**: "Positions" tab
3. **Verify**: At least one position exists
4. **Click**: "Candidates" tab
5. **Verify**: At least one candidate exists
6. **Check**: Each candidate has a position assigned

### Step 2: Check Firestore Database

1. **Go to**: Firebase Console → Firestore Database
2. **Check `positions` collection**:
   - Should have documents
   - Each document should have `name` field
3. **Check `candidates` collection**:
   - Should have documents
   - Each document should have:
     - `name` (string)
     - `position` (string) - must match a position name
     - `bio` (string)
     - `platform` (string)
     - `photoUrl` (string, optional)

### Step 3: Check Voter Website

1. **Log in as voter**: `/voter/login`
2. **Go to homepage**: `/voter/home`
3. **Check**: "Featured Candidates" section
   - Should show President if one exists
   - Should show Vice President if one exists
4. **Go to voting page**: `/voter/voting`
5. **Check**: Candidates grouped by position

### Step 4: Check Browser Console

1. **Press F12** to open Developer Tools
2. **Go to Console tab**
3. **Look for errors**:
   - Red error messages
   - Permission denied errors
   - Network errors
4. **Share errors** if you need help

## Database Structure Check

Your candidates should look like this in Firestore:

```javascript
// Collection: candidates
// Document ID: auto-generated

{
  name: "John Doe",
  position: "President",  // Must match position name EXACTLY
  bio: "<p>Biography here...</p>",
  platform: "<p>Platform here...</p>",
  photoUrl: "https://firebasestorage.googleapis.com/...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Your positions should look like this:

```javascript
// Collection: positions
// Document ID: auto-generated

{
  name: "President",  // This must match candidate.position
  maxSelection: 1,
  order: 1,
  createdAt: Timestamp
}
```

## Quick Checklist

Before candidates will show:

- [ ] Logged in as voter on voter website
- [ ] At least one position exists in database
- [ ] At least one candidate exists in database
- [ ] Candidate has `position` field set
- [ ] Candidate's `position` matches a position's `name` exactly
- [ ] Candidate has `name`, `bio`, and `platform` fields
- [ ] Page has been refreshed after adding candidates

For voting page specifically:

- [ ] Active election exists
- [ ] Election status is "active"
- [ ] Current time is between election start and end dates

## Still Not Working?

### Run the Diagnostic Tool

1. **Open**: `DEBUG_CANDIDATE_SYNC.html` in your browser
2. **Log in** as a voter first
3. **Run the diagnostic**
4. **Follow the instructions** it provides

### Check These Files

1. **Firestore Rules**: `firestore.rules`
   - Make sure candidates collection allows read for authenticated users
2. **Voter Homepage**: `src/pages/VoterHomepage.jsx`
   - Check browser console for errors
3. **Voting Page**: `src/pages/VotingPage.jsx`
   - Check browser console for errors

### Get Help

If still not working, provide:

1. **Screenshot** of Admin Panel → Manage Candidates (showing candidates list)
2. **Screenshot** of Voter Website (showing "No candidates found")
3. **Browser Console** errors (F12 → Console tab)
4. **Diagnostic Tool** results (from DEBUG_CANDIDATE_SYNC.html)

## Most Likely Causes

Based on your screenshots:

1. **Not logged in as voter** (most common)
2. **No candidates in database**
3. **No positions created**
4. **Position name mismatch**

**Start with**: Run `DEBUG_CANDIDATE_SYNC.html` to identify the exact issue!

---

**Next Step**: Open `DEBUG_CANDIDATE_SYNC.html` in your browser while logged in as a voter!
