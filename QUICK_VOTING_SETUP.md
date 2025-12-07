# Quick Voting Control Setup - Step by Step

Follow these steps to fix the loading issue on the Voting Control page.

## Step 1: Open Firebase Console

1. Go to: https://console.firebase.google.com/
2. Click on your project: **ntc-evoting-website**

## Step 2: Navigate to Firestore Database

1. In the left sidebar, click **Firestore Database**
2. You should see your database with collections like `voters`, `candidates`, etc.

## Step 3: Create the Elections Collection

**If you DON'T see an "elections" collection:**

1. Click the **"Start collection"** button at the top
2. In the popup, enter Collection ID: `elections`
3. Click **Next**

**If you already HAVE an "elections" collection:**

1. Click on the `elections` collection
2. Skip to Step 4

## Step 4: Create the "current" Document

1. You should now be in the "Add a document" screen
2. For **Document ID**, type: `current`
3. Add these fields by clicking **"Add field"** for each:

### Field 1:
- **Field name**: `status`
- **Type**: Select `string` from dropdown
- **Value**: Type `closed`

### Field 2:
- **Field name**: `startTime`
- **Type**: Select `null` from dropdown
- (No value needed for null)

### Field 3:
- **Field name**: `endTime`
- **Type**: Select `null` from dropdown
- (No value needed for null)

### Field 4:
- **Field name**: `duration`
- **Type**: Select `null` from dropdown
- (No value needed for null)

### Field 5:
- **Field name**: `createdAt`
- **Type**: Select `timestamp` from dropdown
- Click the clock icon and select **"Set to current time"**

4. Click **Save**

## Step 5: Verify the Document

You should now see:
- Collection: `elections`
- Document: `current`
- With all 5 fields listed

## Step 6: Test the Voting Control Page

1. Go back to your app: http://localhost:5173/admin/voting-control
2. Refresh the page (F5)
3. The page should now load and show:
   - "Current Voting Status" section
   - Status badge showing "Not Active"
   - All time fields showing "---"
   - "Start Voting Session" panel below

## Troubleshooting

### Still Loading?

**Check browser console (F12 → Console tab):**

**If you see "Missing or insufficient permissions":**
- Your admin account might not be set up correctly
- Check the ADMIN_SETUP.md file for creating an admin account

**If you see other errors:**
- Make sure you're logged in as an admin
- Clear browser cache and try again
- Check that the document was created correctly in Firestore

### Can't Create Document?

If you get an error when trying to save the document:
1. Make sure you're logged into Firebase Console with the correct Google account
2. Make sure you have Owner or Editor permissions on the Firebase project
3. Try refreshing the Firebase Console and trying again

## What This Document Does

The `elections/current` document controls the voting system:
- **status**: Whether voting is "closed" or "active"
- **startTime**: When voting started (null when closed)
- **endTime**: When voting will end (null when closed)
- **duration**: How long voting lasts in hours (null when closed)
- **createdAt**: When this document was created

When you click "Start Voting Session" in the admin panel, it will update these fields automatically.

## Next Steps

Once the page loads successfully:
1. Enter a voting duration (e.g., 2 hours)
2. Check the confirmation checkbox
3. Click "Start Voting Session"
4. The status will change to "Active" and show a countdown timer

That's it! Your Voting Control page should now work correctly.
