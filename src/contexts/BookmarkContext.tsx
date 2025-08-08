import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Bill } from '../hooks/useBills';

// Replace the SAMPLE_BILLS array with this complete version:
const SAMPLE_BILLS: Bill[] = [
  {
    id: "sample-1",
    title: "Clean Energy Infrastructure Development Act",
    identifier: "HB-2024-1234",
    jurisdiction: { name: "California", id: "ca" },
    status: "In Committee",
    latest_action_date: "2024-07-15",
    sources: ["California State Legislature"],
    subject: ["Energy", "Environment"]
  },
  {
    id: "sample-2", 
    title: "Education Funding Reform Bill",
    identifier: "SB-2024-5678",
    jurisdiction: { name: "Texas", id: "tx" },
    status: "Passed House",
    latest_action_date: "2024-07-20",
    sources: ["Texas Legislature"],
    subject: ["Education", "Budget"]
  },
  {
    id: "sample-3",
    title: "Healthcare Accessibility Enhancement Act",
    identifier: "AB-2024-9101",
    jurisdiction: { name: "New York", id: "ny" },
    status: "Under Review",
    latest_action_date: "2024-07-18",
    sources: ["NY State Assembly"],
    subject: ["Healthcare", "Public Health"]
  },
  {
    id: "sample-4",
    title: "Small Business Tax Relief Act",
    identifier: "HB-2024-2468",
    jurisdiction: { name: "Florida", id: "fl" },
    status: "Passed Senate",
    latest_action_date: "2024-07-22",
    sources: ["Florida Legislature"],
    subject: ["Economy", "Taxation"]
  },
  {
    id: "sample-5",
    title: "Affordable Housing Development Initiative",
    identifier: "SB-2024-1357",
    jurisdiction: { name: "Washington", id: "wa" },
    status: "In Committee",
    latest_action_date: "2024-07-12",
    sources: ["Washington State Legislature"],
    subject: ["Housing", "Urban Development"]
  },
  {
    id: "sample-6",
    title: "Digital Privacy Protection Act",
    identifier: "AB-2024-7890",
    jurisdiction: { name: "Massachusetts", id: "ma" },
    status: "Under Review",
    latest_action_date: "2024-07-25",
    sources: ["Massachusetts General Court"],
    subject: ["Technology", "Privacy"]
  },
  {
    id: "sample-7",
    title: "Rural Broadband Expansion Bill",
    identifier: "HB-2024-3456",
    jurisdiction: { name: "Montana", id: "mt" },
    status: "Passed House",
    latest_action_date: "2024-07-14",
    sources: ["Montana Legislature"],
    subject: ["Technology", "Rural Development"]
  },
  {
    id: "sample-8",
    title: "Mental Health Funding Increase Act",
    identifier: "SB-2024-4567",
    jurisdiction: { name: "Oregon", id: "or" },
    status: "In Committee",
    latest_action_date: "2024-07-19",
    sources: ["Oregon Legislative Assembly"],
    subject: ["Healthcare", "Mental Health"]
  },
  {
    id: "sample-9",
    title: "Renewable Energy Tax Credit Extension",
    identifier: "HB-2024-8901",
    jurisdiction: { name: "Colorado", id: "co" },
    status: "Passed Senate",
    latest_action_date: "2024-07-21",
    sources: ["Colorado General Assembly"],
    subject: ["Energy", "Taxation"]
  },
  {
    id: "sample-10",
    title: "Public Transportation Modernization Act",
    identifier: "AB-2024-2345",
    jurisdiction: { name: "Illinois", id: "il" },
    status: "Under Review",
    latest_action_date: "2024-07-17",
    sources: ["Illinois General Assembly"],
    subject: ["Transportation", "Infrastructure"]
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