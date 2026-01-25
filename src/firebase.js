import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
   apiKey: "AIzaSyBN8HBUEPcfu2UU6ySiz4zfOfw6Nh99JLs",
  authDomain: "smart-attendance-system-311b3.firebaseapp.com",
  databaseURL: "https://smart-attendance-system-311b3-default-rtdb.firebaseio.com",
  projectId: "smart-attendance-system-311b3",
  storageBucket: "smart-attendance-system-311b3.firebasestorage.app",
  messagingSenderId: "335145478187",
  appId: "1:335145478187:web:a8267526cd9e9abf6da26e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);















