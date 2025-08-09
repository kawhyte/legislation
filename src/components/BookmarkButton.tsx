import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Heart, HeartHandshake } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';
import type { Bill } from '../hooks/useBills';

interface BookmarkButtonProps {
  bill: Bill;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  bill, 
  variant = 'ghost', 
  size = 'sm',
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
      return "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 border-yellow-400/20";
    }
    return "text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 border-slate-600/30 hover:border-yellow-400/20";
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBookmarkToggle}
      className={`transition-all duration-200 border ${getBookmarkStyles()} ${className}`}
      title={bookmarked ? "Remove from saved bills" : "Save bill for later"}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 fill-current text-yellow-500" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2 text-xs font-medium">
          {bookmarked ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
};

export default BookmarkButton;