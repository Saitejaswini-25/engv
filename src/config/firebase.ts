import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Define WHATSAPP_CONFIG only once
export const WHATSAPP_CONFIG = {
  apiKey: import.meta.env.VITE_WHATSAPP_API_KEY,
  groupInviteLink: 'https://chat.whatsapp.com/IUm5d7vPBWG1Y7Eukcb7vG', 
  groupName: 'Engiversee Community', 
  welcomeMessage: (name: string) =>
    `Hi ${name}, welcome to the community! Join us here: https://chat.whatsapp.com/IUm5d7vPBWG1Y7Eukcb7vG`,
};
