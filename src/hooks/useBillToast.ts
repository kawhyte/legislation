'use client';

import React from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BookmarkCheck, BookmarkX, AlertCircle, Lock } from 'lucide-react';
import type { Bill } from '@/types';

interface ToastOptions {
  showBillInfo?: boolean;
  duration?: number;
}

export const useBillToast = () => {
  const router = useRouter();

  const showSaveSuccess = (bill: Bill, options: ToastOptions = {}) => {
    const { showBillInfo = true, duration = 4000 } = options;

    const billTitle = bill.title.length > 45
      ? `${bill.title.substring(0, 45)}...`
      : bill.title;

    toast.success('Bill saved', {
      description: showBillInfo
        ? `"${billTitle}" added to your saved bills`
        : 'Added to your saved bills',
      duration,
      icon: React.createElement(BookmarkCheck, { className: "h-4 w-4" }),
      action: {
        label: 'View Saved',
        onClick: () => router.push('/dashboard?tab=saved'),
      },
    });
  };

  const showRemoveSuccess = (bill: Bill, options: ToastOptions = {}) => {
    const { showBillInfo = true, duration = 4000 } = options;

    const billTitle = bill.title.length > 45
      ? `${bill.title.substring(0, 45)}...`
      : bill.title;

    toast.success('Removed from saved', {
      description: showBillInfo
        ? `"${billTitle}" removed from your saved bills`
        : 'Removed from your saved bills',
      duration,
      icon: React.createElement(BookmarkX, { className: "h-4 w-4" }),
      action: {
        label: 'Undo',
        onClick: () => {
          toast.info('Undo functionality coming soon');
        },
      },
    });
  };

  const showSaveError = (bill: Bill, error?: Error) => {
    const billTitle = bill.title.length > 40
      ? `${bill.title.substring(0, 40)}...`
      : bill.title;

    toast.error('Failed to save bill', {
      description: error?.message || `Could not save "${billTitle}". Please try again.`,
      duration: 6000,
      icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
      action: {
        label: 'Retry',
        onClick: () => {
          toast.info('Please try clicking the save button again');
        },
      },
    });
  };

  const showRemoveError = (bill: Bill, error?: Error) => {
    const billTitle = bill.title.length > 40
      ? `${bill.title.substring(0, 40)}...`
      : bill.title;

    toast.error('Failed to remove bill', {
      description: error?.message || `Could not remove "${billTitle}". Please try again.`,
      duration: 6000,
      icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
      action: {
        label: 'Retry',
        onClick: () => {
          toast.info('Please try clicking the remove button again');
        },
      },
    });
  };

  const showAuthRequired = () => {
    toast('Sign in to save bills', {
      description: 'Create an account to bookmark and track legislation',
      duration: 5000,
      icon: React.createElement(Lock, { className: "h-4 w-4" }),
      action: {
        label: 'Sign In',
        onClick: () => router.push('/sign-in'),
      },
    });
  };

  return {
    showSaveSuccess,
    showRemoveSuccess,
    showSaveError,
    showRemoveError,
    showAuthRequired,
  };
};
