import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
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
  variant = 'outline', 
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

  // Updated to use blue for add, red for remove
  const getBookmarkStyles = () => {
    if (bookmarked) {
      return "text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive transition-all";
    }
    return "text-primary-foreground border-primary/50 bg-primary hover:text-primary  hover:text-primary hover:bg-primary/10 border-transparent hover:border-primary/20";
  };

  const tooltipText = bookmarked ? "Remove from saved" : "Add to saved";

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
              <Trash2 className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showText && (
              <span className="ml-2 text-xs font-medium">
                {bookmarked ? "Saved" : "Save"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-muted text-muted-foreground border-border">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BookmarkButton;