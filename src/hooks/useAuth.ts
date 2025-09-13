import { useState, useEffect } from 'react';
import { 
  onAuthStateChange, 
  getCurrentUser,
  signOut,
  type AuthUser 
} from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoaded(true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoaded,
    isLoading,
    isSignedIn: !!user,
    userId: user?.uid || null,
    signOut: handleSignOut
  };
};

// Hook for accessing user data (similar to Clerk's useUser)
export const useUser = () => {
  const { user, isLoaded } = useAuth();
  
  return {
    user,
    isLoaded,
    isSignedIn: !!user
  };
};