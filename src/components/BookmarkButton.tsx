import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';
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
  size = 'icon', // Default to icon size for compact cards
  showText = false,
  className = ""
}) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(bill.id);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bookmarked) {
      removeBookmark(bill.id);
    } else {
      addBookmark(bill);
    }
  };

  const getBookmarkStyles = () => {
    if (bookmarked) {
      return "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 border-yellow-400/20";
    }
    return "text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 border-transparent hover:border-yellow-400/20";
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
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BookmarkButton;
