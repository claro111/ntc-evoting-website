import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Note: Emulator connection disabled for now to avoid connection issues
// To use emulators, start them with: firebase emulators:start --only functions,firestore
// Then uncomment the emulator connection code below

/*
// Connect to emulators in development (only when emulators are running)
if (import.meta.env.DEV && window.location.search.includes('emulator=true')) {
  try {
    import('firebase/functions').then(({ connectFunctionsEmulator }) => {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('🔧 Connected to Functions Emulator');
    });
    
    import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔧 Connected to Firestore Emulator');
    });
  } catch (error) {
    console.log('Emulators not available, using production Firebase');
  }
}
*/

// Set auth persistence to LOCAL (keeps user logged in across browser sessions)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

export default app;
