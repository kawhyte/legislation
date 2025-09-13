import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  UserPreferences, 
  CreateUserPreferencesDTO, 
  UpdateUserPreferencesDTO, 
  SavedBill, 
  SaveBillDTO 
} from '@/types';

// User Preferences Operations
export const createUserPreferences = async (
  userId: string, 
  preferences: CreateUserPreferencesDTO
): Promise<UserPreferences> => {
  // Validate userId format (Firebase Auth UIDs are non-empty strings)
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid user ID format');
  }

  // Validate preferences
  if (!preferences.displayName?.trim()) {
    throw new Error('Display name is required');
  }

  if (!preferences.selectedState || preferences.selectedState.length !== 2) {
    throw new Error('Valid state abbreviation is required');
  }

  const userDocRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  
  const userPreferences: UserPreferences = {
    userId,
    displayName: preferences.displayName.trim(),
    selectedState: preferences.selectedState.toUpperCase(),
    profileSetupCompleted: true,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(userDocRef, {
    ...userPreferences,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return userPreferences;
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  
  // Convert Firestore Timestamps to ISO strings
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString() 
    : data.createdAt || new Date().toISOString();
    
  const updatedAt = data.updatedAt instanceof Timestamp 
    ? data.updatedAt.toDate().toISOString() 
    : data.updatedAt || new Date().toISOString();

  return {
    userId: data.userId,
    displayName: data.displayName,
    selectedState: data.selectedState,
    profileSetupCompleted: data.profileSetupCompleted || false,
    createdAt,
    updatedAt
  };
};

export const updateUserPreferences = async (
  userId: string, 
  updates: UpdateUserPreferencesDTO
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Saved Bills Operations
export const saveBill = async (userId: string, billData: SaveBillDTO): Promise<SavedBill> => {
  const savedBillsRef = collection(db, 'users', userId, 'savedBills');
  
  // Check if bill is already saved to prevent duplicates
  const existingQuery = query(savedBillsRef, where('billId', '==', billData.billId));
  const existingDocs = await getDocs(existingQuery);
  
  if (!existingDocs.empty) {
    // Bill already saved, return existing data
    const existingDoc = existingDocs.docs[0];
    const data = existingDoc.data();
    
    const savedAt = data.savedAt instanceof Timestamp 
      ? data.savedAt.toDate().toISOString() 
      : data.savedAt || new Date().toISOString();

    return {
      id: existingDoc.id,
      userId,
      billId: data.billId,
      billData: data.billData,
      savedAt,
      notes: data.notes
    };
  }

  // Create new saved bill
  const savedBillData = {
    userId,
    billId: billData.billId,
    billData: billData.billData,
    notes: billData.notes || '',
    savedAt: serverTimestamp()
  };

  const docRef = await addDoc(savedBillsRef, savedBillData);
  
  return {
    id: docRef.id,
    userId,
    billId: billData.billId,
    billData: billData.billData,
    savedAt: new Date().toISOString(),
    notes: billData.notes
  };
};

export const getUserSavedBills = async (userId: string): Promise<SavedBill[]> => {
  const savedBillsRef = collection(db, 'users', userId, 'savedBills');
  const q = query(savedBillsRef, orderBy('savedAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    
    const savedAt = data.savedAt instanceof Timestamp 
      ? data.savedAt.toDate().toISOString() 
      : data.savedAt || new Date().toISOString();

    return {
      id: doc.id,
      userId: data.userId,
      billId: data.billId,
      billData: data.billData,
      savedAt,
      notes: data.notes
    };
  });
};

export const removeSavedBill = async (userId: string, billId: string): Promise<void> => {
  const savedBillsRef = collection(db, 'users', userId, 'savedBills');
  const q = query(savedBillsRef, where('billId', '==', billId));
  
  const querySnapshot = await getDocs(q);
  
  // Delete all documents matching the billId (there should only be one)
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const isBillSaved = async (userId: string, billId: string): Promise<boolean> => {
  const savedBillsRef = collection(db, 'users', userId, 'savedBills');
  const q = query(savedBillsRef, where('billId', '==', billId));
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};