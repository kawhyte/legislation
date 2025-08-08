import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';
import type { Bill } from '../hooks/useBills';

interface BookmarkButtonProps {
  bill: Bill;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  bill, 
  variant = 'ghost', 
  size = 'sm',
  showText = false 
}) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(bill.id);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any parent click handlers
    e.stopPropagation();
    
    if (bookmarked) {
      removeBookmark(bill.id);
    } else {
      addBookmark(bill);
    }
  };

  const buttonClass = bookmarked 
    ? "text-violet-400 hover:text-violet-300" 
    : "text-slate-400 hover:text-violet-400";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBookmarkToggle}
      className={`transition-colors duration-200 ${buttonClass}`}
      title={bookmarked ? "Remove from saved bills" : "Save bill for later"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {bookmarked ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
};

export default BookmarkButton;