import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Convert Firebase User to our AuthUser interface
export const mapFirebaseUser = (user: FirebaseUser | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified
  };
};

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const authUser = mapFirebaseUser(result.user);
    if (!authUser) throw new Error('Failed to sign in');
    return authUser;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<AuthUser> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    const authUser = mapFirebaseUser(result.user);
    if (!authUser) throw new Error('Failed to create account');
    return authUser;
  } catch (error) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

// Social Authentication
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const authUser = mapFirebaseUser(result.user);
    if (!authUser) throw new Error('Failed to sign in with Google');
    return authUser;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};


// Sign Out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Password Reset
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Auth State Observer
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(mapFirebaseUser(user));
  });
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  return mapFirebaseUser(auth.currentUser);
};

// Auth error handling helper
export const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as any)?.code;
  
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups and try again';
    default:
      return (error as any)?.message || 'An error occurred during authentication';
  }
};