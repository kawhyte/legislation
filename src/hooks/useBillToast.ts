import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Bill } from '@/types';

interface ToastOptions {
  showBillInfo?: boolean;
  duration?: number;
}

export const useBillToast = () => {
  const navigate = useNavigate();
  
  const showSaveSuccess = (bill: Bill, options: ToastOptions = {}) => {
    const { showBillInfo = true, duration = 4000 } = options;
    
    const billTitle = bill.title.length > 50 
      ? `${bill.title.substring(0, 50)}...` 
      : bill.title;
    
    toast.success(
      showBillInfo ? `Saved "${billTitle}"` : 'Bill saved successfully',
      {
        description: showBillInfo 
          ? `${bill.jurisdiction?.name} ${bill.identifier} added to your saved bills`
          : 'Added to your saved bills',
        duration,
        icon: '📑',
        action: {
          label: 'View Saved',
          onClick: () => {
            navigate('/saved');
          },
        },
      }
    );
  };

  const showRemoveSuccess = (bill: Bill, options: ToastOptions = {}) => {
    const { showBillInfo = true, duration = 4000 } = options;
    
    const billTitle = bill.title.length > 50 
      ? `${bill.title.substring(0, 50)}...` 
      : bill.title;
    
    toast.success(
      showBillInfo ? `Removed "${billTitle}"` : 'Bill removed successfully',
      {
        description: showBillInfo 
          ? `${bill.jurisdiction?.name} ${bill.identifier} removed from saved bills`
          : 'Removed from your saved bills',
        duration,
        icon: '🗑️',
        action: {
          label: 'Undo',
          onClick: () => {
            // This could trigger a re-save action if implemented
            toast.info('Undo functionality coming soon');
          },
        },
      }
    );
  };

  const showSaveError = (bill: Bill, error?: Error) => {
    const billTitle = bill.title.length > 40 
      ? `${bill.title.substring(0, 40)}...` 
      : bill.title;
    
    toast.error(`Failed to save "${billTitle}"`, {
      description: error?.message || 'Please try again. Check your internet connection.',
      duration: 6000,
      icon: '❌',
      action: {
        label: 'Retry',
        onClick: () => {
          // This would re-trigger the save action
          toast.info('Please try clicking the save button again');
        },
      },
    });
  };

  const showRemoveError = (bill: Bill, error?: Error) => {
    const billTitle = bill.title.length > 40 
      ? `${bill.title.substring(0, 40)}...` 
      : bill.title;
    
    toast.error(`Failed to remove "${billTitle}"`, {
      description: error?.message || 'Please try again. Check your internet connection.',
      duration: 6000,
      icon: '❌',
      action: {
        label: 'Retry',
        onClick: () => {
          // This would re-trigger the remove action
          toast.info('Please try clicking the remove button again');
        },
      },
    });
  };

  const showAuthRequired = () => {
    toast.info('Sign in to save bills', {
      description: 'Create an account to bookmark and track legislation',
      duration: 5000,
      icon: '🔐',
      action: {
        label: 'Sign In',
        onClick: () => {
          navigate('/sign-in');
        },
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