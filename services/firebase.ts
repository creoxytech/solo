import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCeRnTu6vV0NQhTuSpNZYH3HjBKAuq7v00',
  authDomain: 'solo-75ba5.firebaseapp.com',
  projectId: 'solo-75ba5',
  storageBucket: 'solo-75ba5.firebasestorage.app',
  messagingSenderId: '780957399515',
  appId: '1:780957399515:android:f7e3df28fba7e4052b4ffe',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithCredential, firebaseSignOut };
