// src/contexts/DemoContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Bill } from '@/types';
import { demoBillsData, demoExplanations } from '@/data/demoBillsData';

interface DemoSavedBill {
  id: string;
  billId: string;
  billData: Bill;
  savedAt: string;
  isDemo: true;
}

interface DemoContextType {
  // Demo bills
  demoBills: Bill[];
  currentDemoBills: Bill[];
  refreshDemoBills: () => void;
  
  // Demo saved bills
  demoSavedBills: DemoSavedBill[];
  saveDemoBill: (bill: Bill) => void;
  removeDemoBill: (billId: string) => void;
  isDemoBillSaved: (billId: string) => boolean;
  
  // Demo explanations
  getDemoExplanation: (billId: string) => { summary: string; impacts: string[] } | null;
  
  // Demo state
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'legislation-tracker-demo';
const DEMO_EXPIRY_DAYS = 7;

interface DemoData {
  savedBills: DemoSavedBill[];
  timestamp: string;
}

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentDemoBills, setCurrentDemoBills] = useState<Bill[]>([]);
  const [demoSavedBills, setDemoSavedBills] = useState<DemoSavedBill[]>([]);

  // Load demo data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      try {
        const data: DemoData = JSON.parse(stored);
        const now = new Date();
        const stored_date = new Date(data.timestamp);
        const daysDiff = (now.getTime() - stored_date.getTime()) / (1000 * 3600 * 24);
        
        if (daysDiff < DEMO_EXPIRY_DAYS) {
          setDemoSavedBills(data.savedBills);
        } else {
          // Expired, clear storage
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading demo data:', error);
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }
  }, []);

  // Save demo data to localStorage whenever demoSavedBills changes
  useEffect(() => {
    if (demoSavedBills.length > 0) {
      const data: DemoData = {
        savedBills: demoSavedBills,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
    }
  }, [demoSavedBills]);

  // Initialize demo bills on mount
  useEffect(() => {
    refreshDemoBills();
  }, []);

  const refreshDemoBills = () => {
    // Randomly select 4-6 bills from the demo data
    const shuffled = [...demoBillsData].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 4; // 4-6 bills
    setCurrentDemoBills(shuffled.slice(0, count));
  };

  const saveDemoBill = (bill: Bill) => {
    const newSavedBill: DemoSavedBill = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      billId: bill.id,
      billData: bill,
      savedAt: new Date().toISOString(),
      isDemo: true
    };
    
    setDemoSavedBills(prev => {
      // Check if already saved
      if (prev.some(saved => saved.billId === bill.id)) {
        return prev;
      }
      return [...prev, newSavedBill];
    });
  };

  const removeDemoBill = (billId: string) => {
    setDemoSavedBills(prev => prev.filter(saved => saved.billId !== billId));
  };

  const isDemoBillSaved = (billId: string) => {
    return demoSavedBills.some(saved => saved.billId === billId);
  };

  const getDemoExplanation = (billId: string) => {
    return demoExplanations[billId] || null;
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      refreshDemoBills();
    }
  };

  const value: DemoContextType = {
    demoBills: demoBillsData,
    currentDemoBills,
    refreshDemoBills,
    demoSavedBills,
    saveDemoBill,
    removeDemoBill,
    isDemoBillSaved,
    getDemoExplanation,
    isDemoMode,
    setDemoMode
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};