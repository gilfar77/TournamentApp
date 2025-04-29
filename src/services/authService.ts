import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { User } from '../types';

// Get admin emails from environment variables
const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];

// Check if user is an admin
export const isAdmin = (email: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};

// Convert Firebase user to app User
export const mapUserData = async (user: FirebaseUser | null): Promise<User | null> => {
  if (!user) return null;
  
  // Check if user exists in Firestore and fetch additional data
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAdmin: isAdmin(user.email)
  };
  
  // If user doesn't exist in Firestore, create user document
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date()
    });
  }
  
  return userData;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    // Try popup first
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await mapUserData(result.user);
    } catch (popupError: any) {
      // If popup is blocked, fall back to redirect
      if (popupError.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        // The page will reload and we'll handle the redirect result
        return null;
      }
      throw popupError;
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Handle redirect result
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return await mapUserData(result.user);
    }
    return null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    const userData = await mapUserData(user);
    callback(userData);
  });
};