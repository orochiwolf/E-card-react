// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// Your web app's Firebase configuration
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAm3-L6I0S_2WAj-TMo2PLy7BazA472puM",
  authDomain: "ecard-kaiji-game.firebaseapp.com",
  projectId: "ecard-kaiji-game",
  storageBucket: "ecard-kaiji-game.firebasestorage.app",
  messagingSenderId: "309498290947",
  appId: "1:309498290947:web:e41051265068e9da84ff36",
  measurementId: "G-ZS1ZB2BBV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database instance so we can use it in other parts of the app
export { db };