// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using environment variables
// Note: These values will still be visible in the client bundle
// Security is enforced through Firestore rules and domain restrictions
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAm3-L6I0S_2WAj-TMo2PLy7BazA472puM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ecard-kaiji-game.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ecard-kaiji-game",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ecard-kaiji-game.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "309498290947",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:309498290947:web:e41051265068e9da84ff36",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-ZS1ZB2BBV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database instance so we can use it in other parts of the app
export { db };