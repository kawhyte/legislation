'use client';

import { UserProvider } from '@/contexts/UserContext';
import { SearchCacheProvider } from '@/contexts/SearchCacheContext';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SearchCacheProvider>
        {children}
        <Toaster />
      </SearchCacheProvider>
    </UserProvider>
  );
}
