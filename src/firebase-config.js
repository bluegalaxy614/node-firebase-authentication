// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR9E7tykmUNCz5Ycb1dlv0DBA_dLNQN9A",
  authDomain: "react-node-firebase-a91c6.firebaseapp.com",
  projectId: "react-node-firebase-a91c6",
  storageBucket: "react-node-firebase-a91c6.appspot.com",
  messagingSenderId: "294678226213",
  appId: "1:294678226213:web:c50683c41eb2d1c192a6cc"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Set session persistence (optional)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Session will persist in the browser only until the tab is closed.
    console.log("Session persistence set to browser session.");
  })
  .catch((error) => {
    console.error("Error setting session persistence:", error);
  });
