# Firebase Setup Guide

Complete guide to setting up Firebase for the NTC E-Voting system.

## Prerequisites

- Google account
- Firebase CLI installed: `npm install -g firebase-tools`

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `ntc-evoting` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### 2.1 Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### 2.2 Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select "Start in **production mode**"
4. Choose your region (closest to your users)
5. Click "Enable"

### 2.3 Enable Firebase Storage

1. Go to **Build > Storage**
2. Click "Get started"
3. Start in **production mode**
4. Choose same region as Firestore
5. Click "Done"

### 2.4 Set up Cloud Functions

1. Go to **Build > Functions**
2. Click "Get started"
3. Upgrade to Blaze plan (pay-as-you-go, includes free tier)
4. Note: Cloud Functions require billing enabled

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register your app:
   - App nickname: `NTC E-Voting Web`
   - Don't check "Firebase Hosting"
   - Click "Register app"
5. Copy the `firebaseConfig` object

## Step 4: Configure Your Project

1. Open `ntc-evoting/.env` file
2. Paste your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Step 5: Deploy Security Rules

### 5.1 Initialize Firebase in your project

```bash
cd ntc-evoting
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage
- ✅ Functions
- ✅ Hosting (optional)

Configuration:
- Firestore rules: Use existing `firestore.rules`
- Firestore indexes: Use default `firestore.indexes.json`
- Storage rules: Use existing `storage.rules`
- Functions: JavaScript, ESLint yes
- Hosting: Use `dist` as public directory

### 5.2 Deploy rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Step 6: Create Initial Admin Account

### Option A: Using Firebase Console

1. Go to **Authentication > Users**
2. Click "Add user"
3. Enter admin email and password
4. Copy the User UID

5. Go to **Firestore Database**
6. Create collection `admins`
7. Add document with ID = User UID:
```json
{
  "email": "admin@ntc.edu.ph",
  "name": "Super Admin",
  "role": "super_admin",
  "mfaEnabled": false,
  "lastLogin": null
}
```

### Option B: Using Firebase CLI

```bash
# Create user
firebase auth:import users.json

# users.json content:
{
  "users": [{
    "uid": "admin-uid-123",
    "email": "admin@ntc.edu.ph",
    "passwordHash": "...",
    "displayName": "Super Admin"
  }]
}
```

## Step 7: Create Firestore Indexes

Some queries require composite indexes. Create them manually or wait for Firestore to prompt you.

### Required Indexes:

1. **candidates** collection:
   - Fields: `electionId` (Ascending), `positionId` (Ascending), `displayOrder` (Ascending)

2. **votes** collection:
   - Fields: `electionId` (Ascending), `candidateId` (Ascending)

3. **positions** collection:
   - Fields: `electionId` (Ascending), `displayOrder` (Ascending)

To create indexes:
1. Go to **Firestore > Indexes**
2. Click "Create index"
3. Add the fields listed above

## Step 8: Configure Email for Verification

Firebase sends verification emails automatically, but you can customize them:

1. Go to **Authentication > Templates**
2. Click on "Email address verification"
3. Customize the email template
4. Add your app's domain to authorized domains

## Step 9: Set up Cloud Functions (Optional for now)

Cloud Functions will be set up in later tasks. For now, just ensure billing is enabled.

## Step 10: Test Your Setup

1. Start your development server:
```bash
npm run dev
```

2. Try to access the app at `http://localhost:5173`
3. Check browser console for any Firebase errors

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Check that your `.env` file has all the correct values
- Restart your dev server after changing `.env`

### Error: "Missing or insufficient permissions"
- Deploy your Firestore security rules: `firebase deploy --only firestore:rules`

### Error: "Storage bucket not found"
- Make sure Firebase Storage is enabled in Firebase Console
- Check that `VITE_FIREBASE_STORAGE_BUCKET` is correct in `.env`

### Email verification not working
- Check that Email/Password provider is enabled
- Verify your domain is in authorized domains list

## Security Checklist

- ✅ Firestore security rules deployed
- ✅ Storage security rules deployed
- ✅ Email/Password authentication enabled
- ✅ Admin account created
- ✅ Environment variables configured
- ✅ `.env` file added to `.gitignore`

## Next Steps

After completing this setup:
1. Test Firebase connection in your app
2. Proceed to implement authentication (Task 3)
3. Set up Cloud Functions for backend logic

## Useful Commands

```bash
# Deploy all Firebase services
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage:rules

# Deploy only Functions
firebase deploy --only functions

# View Firebase logs
firebase functions:log

# Open Firebase Console
firebase open
```

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Functions](https://firebase.google.com/docs/functions)
