# NTC E-Voting System

A comprehensive web-based electronic voting system built with React.js and Firebase.

## Features

- **Voter Interface**: Registration, voting, profile management, announcements
- **Admin Interface**: Voter management, candidate management, voting control, live results
- **Security**: Email verification, vote anonymization, encrypted data
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React.js 18+ with JavaScript, Vite
- **Styling**: TailwindCSS
- **Backend**: Firebase (Firestore, Authentication, Storage, Cloud Functions)
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- Firebase account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd ntc-evoting
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage
   - **Functions**: Set up Cloud Functions

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web app icon (</>)
   - Copy the configuration object

### 4. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 5. Firestore Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Voters collection
    match /voters/{voterId} {
      allow read: if request.auth != null && 
        (request.auth.uid == voterId || 
         get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role != null);
      allow write: if get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role != null;
    }
    
    // Elections collection
    match /elections/{electionId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role != null;
    }
    
    // Add more rules for other collections...
  }
}
```

### 6. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
ntc-evoting/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── services/       # API and Firebase services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── .env                # Environment variables
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
