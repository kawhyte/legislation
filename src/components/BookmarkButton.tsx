import React, { useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useUserData } from '../contexts/UserContext';
import { useUser } from '@/hooks/useAuth';
import type { Bill } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBillToast } from '@/hooks/useBillToast';
import AuthModal from './AuthModal';

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
  // size = 'icon',
  showText = false,
  className = "",
  onSaveSuccess,
  onSaveError,
  showToast = true,
  toastDuration = 4000
}) => {
  const { isBillSaved, saveBill, removeSavedBill } = useUserData();
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
    
    // Show auth modal if not authenticated
    if (!isSignedIn) {
      if (showToast) {
        showAuthRequired();
      }
      setAuthModalOpen(true);
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
  }, [bill, bookmarked, isSignedIn, isLoading, removeSavedBill, saveBill, onSaveSuccess, onSaveError, showToast, toastDuration, showAuthRequired, showRemoveSuccess, showSaveSuccess, showRemoveError, showSaveError]);

  const getButtonStyles = () => {
    const base = "h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none flex-shrink-0";
    if (isLoading) {
      return `${base} border-border bg-card text-muted-foreground`;
    }
    if (bookmarked) {
      return `${base} border-foreground bg-accent-yellow text-text-on-yellow shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]`;
    }
    return `${base} border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted`;
  };

  const tooltipText = isLoading 
    ? (bookmarked ? "Removing from saved..." : "Adding to saved...") 
    : (bookmarked ? "Remove from saved" : "Add to saved");
    
  const buttonLabel = bookmarked 
    ? `Remove ${bill.title} from saved bills` 
    : `Add ${bill.title} to saved bills`;

  return (
    <>
    <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          onClick={handleBookmarkToggle}
          disabled={isLoading}
          aria-label={buttonLabel}
          aria-pressed={bookmarked}
          className={`${getButtonStyles()} ${className}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : bookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {showText && (
            <span className="ml-1.5 text-xs font-semibold">
              {isLoading ? "…" : bookmarked ? "Saved" : "Save"}
            </span>
          )}
          <span className="sr-only">{buttonLabel}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-popover text-popover-foreground border border-border shadow-md">
        <p className="text-sm">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
    </>
  );
};

export default BookmarkButton;