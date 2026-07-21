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
  limit,
  increment,
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
import type { BillEngagement } from '@/utils/trendingScore';

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
    ...(preferences.zipCode ? { zipCode: preferences.zipCode.trim() } : {}),
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
    ...(data.zipCode ? { zipCode: data.zipCode } : {}),
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

  // Bump the cross-user save counter only on a genuinely new save (the
  // already-saved path above returns before reaching here, so no double-count).
  void bumpSaveCount(billData.billId, 1, {
    title: billData.billData?.title,
    jurisdictionName: billData.billData?.jurisdiction?.name,
  });

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
  if (querySnapshot.empty) return; // nothing saved → nothing to decrement

  // Delete all documents matching the billId (there should only be one)
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  void bumpSaveCount(billId, -1);
};

export const isBillSaved = async (userId: string, billId: string): Promise<boolean> => {
  const savedBillsRef = collection(db, 'users', userId, 'savedBills');
  const q = query(savedBillsRef, where('billId', '==', billId));

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// ── Bill engagement aggregation (billEngagement/{billId}) ────────────────────
// Cross-user counters that feed the trending score (src/utils/trendingScore.ts).
// All writes are best-effort: engagement is a ranking nudge, so a failure here
// must never break viewing or saving a bill.
// NOTE: these counters are client-writable (see firestore.rules) and therefore
// inflatable — the trending score caps their influence low. Server-side
// aggregation is a documented follow-up.

interface EngagementMeta {
  title?: string;
  jurisdictionName?: string;
}

const engagementMeta = (meta?: EngagementMeta) => ({
  ...(meta?.title ? { title: meta.title } : {}),
  ...(meta?.jurisdictionName ? { jurisdictionName: meta.jurisdictionName } : {}),
});

/** Increment a bill's view counter. Session-dedupe at the call site. */
export const recordBillView = async (billId: string, meta?: EngagementMeta): Promise<void> => {
  if (!billId) return;
  try {
    await setDoc(
      doc(db, 'billEngagement', billId),
      { views: increment(1), lastActivityAt: serverTimestamp(), ...engagementMeta(meta) },
      { merge: true }
    );
  } catch {
    /* best-effort */
  }
};

/** Adjust a bill's save counter (+1 on save, -1 on unsave). */
const bumpSaveCount = async (billId: string, delta: 1 | -1, meta?: EngagementMeta): Promise<void> => {
  if (!billId) return;
  try {
    await setDoc(
      doc(db, 'billEngagement', billId),
      { saves: increment(delta), lastActivityAt: serverTimestamp(), ...engagementMeta(meta) },
      { merge: true }
    );
  } catch {
    /* best-effort */
  }
};

/** Read the most-engaged bills, keyed by billId, for trending re-ranking. */
export const getTopEngagement = async (limitN = 200): Promise<Map<string, BillEngagement>> => {
  const ref = collection(db, 'billEngagement');
  const q = query(ref, orderBy('views', 'desc'), limit(limitN));
  const snapshot = await getDocs(q);

  const map = new Map<string, BillEngagement>();
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const lastActivityAt =
      data.lastActivityAt instanceof Timestamp ? data.lastActivityAt.toMillis() : null;
    map.set(docSnap.id, {
      views: data.views || 0,
      saves: data.saves || 0,
      lastActivityAt,
    });
  });
  return map;
};