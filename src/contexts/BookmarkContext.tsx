import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Bill } from '@/types';

// Replace the SAMPLE_BILLS array with this complete version:
const SAMPLE_BILLS: Bill[] = [
  {
    id: "sample-1",
    title: "Clean Energy Infrastructure Development Act",
    identifier: "HB-2024-1234",
    jurisdiction: { name: "California", id: "ca", classification: "state" },
    status: "In Committee",
    introduced: "2024-01-15",
    latest_action_date: "2024-07-15",
    first_action_date: "2024-01-15",
    last_action_date: "2024-07-15",
    house_passage_date: "",
    senate_passage_date: "",
    enacted_date: "",
    sources: [{note: "California State Legislature", url: ""}],
    subject: ["Energy", "Environment"]
  },
  {
    id: "sample-2", 
    title: "Education Funding Reform Bill",
    identifier: "SB-2024-5678",
    jurisdiction: { name: "Texas", id: "tx", classification: "state" },
    status: "Passed House",
    introduced: "2024-02-10",
    latest_action_date: "2024-07-20",
    first_action_date: "2024-02-10",
    last_action_date: "2024-07-20",
    house_passage_date: "2024-07-20",
    senate_passage_date: "",
    enacted_date: "",
    sources: [{note: "Texas Legislature", url: ""}],
    subject: ["Education", "Budget"]
  }
];

interface BookmarkContextType {
  bookmarkedBills: Bill[];
  isBookmarked: (billId: string) => boolean;
  addBookmark: (bill: Bill) => void;
  removeBookmark: (billId: string) => void;
  clearAllBookmarks: () => void;
  bookmarkCount: number;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarkedBills, setBookmarkedBills] = useState<Bill[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('legislegis-bookmarks');
      if (saved) {
        const parsedBills = JSON.parse(saved);
        setBookmarkedBills(parsedBills);
      } else {
        // Initialize with sample bills if no bookmarks exist
        setBookmarkedBills(SAMPLE_BILLS);
        localStorage.setItem('legislegis-bookmarks', JSON.stringify(SAMPLE_BILLS));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      // Fallback to sample bills
      setBookmarkedBills(SAMPLE_BILLS);
    }
  }, []);

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    try {
      localStorage.setItem('legislegis-bookmarks', JSON.stringify(bookmarkedBills));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, [bookmarkedBills]);

  const isBookmarked = (billId: string): boolean => {
    return bookmarkedBills.some(bill => bill.id === billId);
  };

  const addBookmark = (bill: Bill): void => {
    setBookmarkedBills(prev => {
      // Prevent duplicates
      if (prev.some(b => b.id === bill.id)) {
        return prev;
      }
      return [...prev, bill];
    });
  };

  const removeBookmark = (billId: string): void => {
    setBookmarkedBills(prev => prev.filter(bill => bill.id !== billId));
  };

  const clearAllBookmarks = (): void => {
    setBookmarkedBills([]);
  };

  const value: BookmarkContextType = {
    bookmarkedBills,
    isBookmarked,
    addBookmark,
    removeBookmark,
    clearAllBookmarks,
    bookmarkCount: bookmarkedBills.length
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};