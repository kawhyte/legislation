import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useAuth';
import type { ReactNode } from 'react';
import type { 
  UserContextType, 
  UserPreferences, 
  SavedBill, 
  CreateUserPreferencesDTO, 
  UpdateUserPreferencesDTO, 
  SaveBillDTO 
} from '@/types';
import {
  createUserPreferences,
  getUserPreferences,
  updateUserPreferences as updateUserPreferencesService,
  saveBill as saveBillService,
  getUserSavedBills,
  removeSavedBill as removeSavedBillService
} from '@/services/userService';

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  
  // User preferences state
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  
  // Saved bills state
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [isLoadingSavedBills, setIsLoadingSavedBills] = useState(false);

  // Load user data when user signs in
  const loadUserData = useCallback(async (userId: string) => {
    try {
      setIsLoadingPreferences(true);
      setIsLoadingSavedBills(true);
      
      // Load user preferences and saved bills in parallel
      const [preferences, bills] = await Promise.all([
        getUserPreferences(userId),
        getUserSavedBills(userId)
      ]);

      setUserPreferences(preferences);
      setSavedBills(bills);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingPreferences(false);
      setIsLoadingSavedBills(false);
    }
  }, []);

  // Clear user data when user signs out
  const clearUserData = useCallback(() => {
    setUserPreferences(null);
    setSavedBills([]);
  }, []);

  // Effect to handle auth state changes
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user?.uid) {
      loadUserData(user.uid);
    } else {
      clearUserData();
    }
  }, [isLoaded, isSignedIn, user?.uid, loadUserData, clearUserData]);

  // User preferences operations
  const updateUserPreferences = async (updates: UpdateUserPreferencesDTO): Promise<void> => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      setIsLoadingPreferences(true);
      await updateUserPreferencesService(user.uid, updates);
      
      // Update local state
      setUserPreferences(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const completeProfileSetup = async (preferences: CreateUserPreferencesDTO): Promise<void> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoadingPreferences(true);
      
      // Check if user already has preferences (editing) or is creating new ones
      if (userPreferences && userPreferences.profileSetupCompleted) {
        // Update existing preferences
        await updateUserPreferencesService(user.uid, preferences);
        
        // Update local state
        setUserPreferences(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ...preferences,
            updatedAt: new Date().toISOString()
          };
        });
      } else {
        // Create new preferences
        const newPreferences = await createUserPreferences(user.uid, preferences);
        setUserPreferences(newPreferences);
      }
    } catch (error) {
      console.error('Error completing profile setup:', error);
      throw error;
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Saved bills operations
  const saveBill = async (billData: SaveBillDTO): Promise<void> => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      setIsLoadingSavedBills(true);
      
      const savedBill = await saveBillService(user.uid, billData);
      
      // Add to local state if it's a new bill
      setSavedBills(prev => {
        const exists = prev.some(bill => bill.billId === billData.billId);
        if (exists) return prev;
        return [savedBill, ...prev];
      });
    } catch (error) {
      console.error('Error saving bill:', error);
      throw error;
    } finally {
      setIsLoadingSavedBills(false);
    }
  };

  const removeSavedBill = async (billId: string): Promise<void> => {
    if (!user?.uid) throw new Error('User not authenticated');

    try {
      setIsLoadingSavedBills(true);
      
      await removeSavedBillService(user.uid, billId);
      
      // Remove from local state
      setSavedBills(prev => prev.filter(bill => bill.billId !== billId));
    } catch (error) {
      console.error('Error removing saved bill:', error);
      throw error;
    } finally {
      setIsLoadingSavedBills(false);
    }
  };

  const isBillSaved = (billId: string): boolean => {
    return savedBills.some(bill => bill.billId === billId);
  };

  // Helper computed properties
  const isProfileSetupRequired = Boolean(
    isSignedIn && 
    userPreferences && 
    !userPreferences.profileSetupCompleted
  );

  const value: UserContextType = {
    // User preferences
    userPreferences,
    isLoadingPreferences,
    updateUserPreferences,
    completeProfileSetup,
    
    // Saved bills
    savedBills,
    isLoadingSavedBills,
    saveBill,
    removeSavedBill,
    isBillSaved,
    
    // Auth state helpers
    isProfileSetupRequired
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserProvider');
  }
  return context;
};