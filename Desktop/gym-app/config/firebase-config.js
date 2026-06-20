import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKVDEPtA3lGKw69gRRQaxYj1PEJ7GiiCc",
  authDomain: "gym-app-19208.firebaseapp.com",
  projectId: "gym-app-19208",
  storageBucket: "gym-app-19208.firebasestorage.app",
  messagingSenderId: "709428661549",
  appId: "1:709428661549:web:ff50f1f7f3a5da27b9d7a4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, deleteUser };
