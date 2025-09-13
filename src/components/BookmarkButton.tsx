import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useUserData } from '../contexts/UserContext';
import { useUser } from '@/hooks/useAuth';
import type { Bill } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BookmarkButtonProps {
  bill: Bill;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'lg' | 'icon' | 'default';
  showText?: boolean;
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  bill, 
  variant = 'ghost', 
  size = 'icon',
  showText = false,
  className = ""
}) => {
  const { isBillSaved, saveBill, removeSavedBill } = useUserData();
  const { isSignedIn } = useUser();
  const bookmarked = isBillSaved(bill.id);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Redirect to sign in if not authenticated
    if (!isSignedIn) {
      window.location.href = '/sign-in';
      return;
    }
    
    try {
      if (bookmarked) {
        await removeSavedBill(bill.id);
      } else {
        await saveBill({
          billId: bill.id,
          billData: bill
        });
      }
    } catch (error) {
      console.error('Error toggling bill save status:', error);
      // Could show a toast notification here
    }
  };

  // UPDATED: Replaced hardcoded colors with theme variables
  const getBookmarkStyles = () => {
    if (bookmarked) {
      return "text-warning hover:text-warning/90 bg-warning/10 border-warning/20";
    }
    return "text-muted-foreground hover:text-warning hover:bg-warning/10 border-transparent hover:border-warning/20";
  };

  const tooltipText = bookmarked ? "Remove from saved" : "Save for later";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleBookmarkToggle}
            className={`transition-all duration-200 border ${getBookmarkStyles()} ${className}`}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {showText && (
              <span className="ml-2 text-xs font-medium">
                {bookmarked ? "Saved" : "Save"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        {/* UPDATED: Themed the tooltip content to match other popovers */}
        <TooltipContent className="bg-popover text-popover-foreground border-border">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BookmarkButton;