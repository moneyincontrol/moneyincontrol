import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getBytes } from 'firebase/storage';

// Import from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ===================== AUTH EXPORTS =====================
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};

// ===================== FIRESTORE EXPORTS =====================
export {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
};

// ===================== STORAGE EXPORTS =====================
export { ref, uploadBytes, getBytes };

// ===================== HELPER FUNCTIONS =====================

// Add to Watchlist
export const addToWatchlist = async (userId: string, stock: any) => {
  try {
    const docRef = await addDoc(
      collection(db, 'users', userId, 'watchlist'),
      {
        ...stock,
        addedAt: new Date(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Get Watchlist
export const getWatchlist = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'users', userId, 'watchlist')
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting watchlist:', error);
    throw error;
  }
};

// Remove from Watchlist
export const removeFromWatchlist = async (userId: string, docId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'watchlist', docId));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

// Add Price Alert
export const addPriceAlert = async (userId: string, alert: any) => {
  try {
    const docRef = await addDoc(
      collection(db, 'users', userId, 'alerts'),
      {
        ...alert,
        createdAt: new Date(),
        triggered: false,
      }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding alert:', error);
    throw error;
  }
};

// Get Price Alerts
export const getPriceAlerts = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'users', userId, 'alerts')
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw error;
  }
};

// Remove Price Alert
export const removePriceAlert = async (userId: string, docId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'alerts', docId));
  } catch (error) {
    console.error('Error removing alert:', error);
    throw error;
  }
};

// Save User Profile
export const saveUserProfile = async (userId: string, profile: any) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profile,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Get User Profile
export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.data();
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

// Add Portfolio Entry
export const addPortfolioEntry = async (userId: string, entry: any) => {
  try {
    const docRef = await addDoc(
      collection(db, 'users', userId, 'portfolio'),
      {
        ...entry,
        createdAt: new Date(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error adding portfolio entry:', error);
    throw error;
  }
};

// Get Portfolio
export const getPortfolio = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, 'users', userId, 'portfolio')
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting portfolio:', error);
    throw error;
  }
};

// Upload Profile Picture
export const uploadProfilePicture = async (userId: string, uri: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `profiles/${userId}/avatar.jpg`);
    await uploadBytes(fileRef, blob);
    return fileRef.fullPath;
  } catch (error) {
    console.error('Error uploading picture:', error);
    throw error;
  }
};

export default app;
