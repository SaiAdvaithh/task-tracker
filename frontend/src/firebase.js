import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIGbeMK-WCQXcwxadzXQkMbDEjnvGIhc0",
  authDomain: "task-tracker-a2baf.firebaseapp.com",
  projectId: "task-tracker-a2baf",
  storageBucket: "task-tracker-a2baf.firebasestorage.app",
  messagingSenderId: "563742929334",
  appId: "1:563742929334:web:d65ad4ddae32cbd98b1117",
  measurementId: "G-BJ6MSSHT6B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();