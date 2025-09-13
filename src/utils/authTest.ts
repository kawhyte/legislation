// Utility functions to test authentication and database connectivity
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Test Firebase connection and authentication
 * This function helps debug authentication issues during development
 */
export const testFirebaseConnection = async (): Promise<{
  firebaseConnected: boolean;
  authState: string;
  error?: string;
}> => {
  try {
    // Test Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    // Test auth state
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve({
          firebaseConnected: true,
          authState: user ? 'authenticated' : 'unauthenticated',
        });
      });
    });
  } catch (error) {
    return {
      firebaseConnected: false,
      authState: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Test environment variables
 */
export const testEnvironmentVariables = (): {
  clerkConfigured: boolean;
  firebaseConfigured: boolean;
  missingVars: string[];
} => {
  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  return {
    clerkConfigured: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    firebaseConfigured: missingVars.length === 0,
    missingVars,
  };
};

/**
 * Log current configuration for debugging
 */
export const logConfiguration = (): void => {
  const envTest = testEnvironmentVariables();
  
  console.group('🔧 Authentication Configuration');
  console.log('Clerk configured:', envTest.clerkConfigured);
  console.log('Firebase configured:', envTest.firebaseConfigured);
  
  if (envTest.missingVars.length > 0) {
    console.warn('Missing environment variables:', envTest.missingVars);
  }
  
  console.log('Firebase project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log('Clerk publishable key (first 20 chars):', 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...'
  );
  console.groupEnd();
};

// Auto-run configuration check in development
if (import.meta.env.DEV) {
  logConfiguration();
}
