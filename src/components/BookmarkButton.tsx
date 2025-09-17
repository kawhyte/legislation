import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useUserData } from '../contexts/UserContext';
import { useUser } from '@/hooks/useAuth';
import type { Bill } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useBillToast } from '@/hooks/useBillToast';

interface BookmarkButtonProps {
  bill: Bill;
  size?: 'sm' | 'lg' | 'icon' | 'default';
  showText?: boolean;
  className?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  showToast?: boolean;
  toastDuration?: number;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  bill, 
  size = 'icon',
  showText = false,
  className = "",
  onSaveSuccess,
  onSaveError,
  showToast = true,
  toastDuration = 4000
}) => {
  const { isBillSaved, saveBill, removeSavedBill } = useUserData();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const bookmarked = isBillSaved(bill.id);
  const { 
    showSaveSuccess, 
    showRemoveSuccess, 
    showSaveError, 
    showRemoveError, 
    showAuthRequired 
  } = useBillToast();

  const handleBookmarkToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show auth required toast and redirect if not authenticated
    if (!isSignedIn) {
      if (showToast) {
        showAuthRequired();
      }
      // Small delay to show toast before navigation
      setTimeout(() => navigate('/sign-in'), 500);
      return;
    }
    
    // Prevent multiple clicks during loading
    if (isLoading) return;
    
    const wasBookmarked = bookmarked;
    setIsLoading(true);
    
    try {
      if (wasBookmarked) {
        await removeSavedBill(bill.id);
        if (showToast) {
          showRemoveSuccess(bill, { duration: toastDuration });
        }
      } else {
        await saveBill({
          billId: bill.id,
          billData: bill
        });
        if (showToast) {
          showSaveSuccess(bill, { duration: toastDuration });
        }
      }
      onSaveSuccess?.();
    } catch (error) {
      console.error('Error toggling bill save status:', error);
      
      if (showToast) {
        if (wasBookmarked) {
          showRemoveError(bill, error as Error);
        } else {
          showSaveError(bill, error as Error);
        }
      }
      
      onSaveError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [bill, bookmarked, isSignedIn, isLoading, navigate, removeSavedBill, saveBill, onSaveSuccess, onSaveError, showToast, toastDuration, showAuthRequired, showRemoveSuccess, showSaveSuccess, showRemoveError, showSaveError]);

  // Enhanced styling with better state management
  const getButtonVariant = () => {
    if (isLoading) return 'outline';
    if (bookmarked) return 'destructive';
    return 'default';
  };
  
  const getAdditionalStyles = () => {
    return "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  };

  const tooltipText = isLoading 
    ? (bookmarked ? "Removing from saved..." : "Adding to saved...") 
    : (bookmarked ? "Remove from saved" : "Add to saved");
    
  const buttonLabel = bookmarked 
    ? `Remove ${bill.title} from saved bills` 
    : `Add ${bill.title} to saved bills`;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size={size}
          onClick={handleBookmarkToggle}
          disabled={isLoading}
          aria-label={buttonLabel}
          aria-pressed={bookmarked}
          className={`${getAdditionalStyles()} ${className}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : bookmarked ? (
            <Trash2 className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {showText && (
            <span className="ml-2 text-xs font-medium">
              {isLoading ? "..." : bookmarked ? "Saved" : "Save"}
            </span>
          )}
          <span className="sr-only">{buttonLabel}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="bg-popover text-popover-foreground border border-border shadow-md">
        <p className="text-sm">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default BookmarkButton;