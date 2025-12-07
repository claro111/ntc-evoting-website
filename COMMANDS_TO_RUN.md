# Quick Diagnostic Steps

## Step 1: Check Browser Console

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Try the action that's not working
5. Look for error messages (usually in red)

## Step 2: Common Error Messages and Solutions

### Error: "Missing or insufficient permissions"
**Cause**: Your admin account doesn't have proper permissions in Firestore

**Solution**:
1. Go to Firebase Console → Firestore Database
2. Check if `admins` collection exists
3. Find your user ID (check console log or Firebase Authentication)
4. Make sure there's a document in `admins` with your user ID and `role: 'admin'`

### Error: "storage/unauthorized"
**Cause**: Firebase Storage rules not configured

**Solution**:
1. Go to Firebase Console → Storage
2. Click "Rules" tab
3. Update rules to:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /candidates/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
4. Click "Publish"

### Error: "Cannot read properties of undefined"
**Cause**: Data structure mismatch or missing fields

**Solution**: Check the console log for which field is undefined

## Step 3: Verify Firebase Configuration

Check if Firebase is properly initialized:

1. Open browser console
2. Type: `firebase.apps.length`
3. Should return `1` (meaning Firebase is initialized)

## Step 4: Check Network Tab

1. Open Developer Tools (F12)
2. Click "Network" tab
3. Try the action that's not working
4. Look for failed requests (shown in red)
5. Click on the failed request to see details

## Step 5: Test Firebase Connection

Create a test file `ntc-evoting/test-connection.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Firebase Connection Test</title>
</head>
<body>
  <h1>Firebase Connection Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <div id="result"></div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

    // Your Firebase config (copy from .env)
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    window.testConnection = async function() {
      const result = document.getElementById('result');
      result.innerHTML = 'Testing...';
      
      try {
        const snapshot = await getDocs(collection(db, 'positions'));
        result.innerHTML = `✅ Success! Found ${snapshot.size} positions`;
      } catch (error) {
        result.innerHTML = `❌ Error: ${error.message}`;
      }
    };
  </script>
</body>
</html>
```

## What to Share

If you're still having issues, please share:

1. **Console error messages** (copy the red text)
2. **Which action is failing** (add position, add candidate, start voting)
3. **Your Firebase project ID** (from Firebase Console)
4. **Screenshot of the error** (if possible)

This will help me identify the exact issue!
