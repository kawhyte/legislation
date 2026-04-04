'use client';

import { UserProvider } from '@/contexts/UserContext';
import { DemoProvider } from '@/contexts/DemoContext';
import { SearchCacheProvider } from '@/contexts/SearchCacheContext';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DemoProvider>
        <SearchCacheProvider>
          {children}
          <Toaster />
        </SearchCacheProvider>
      </DemoProvider>
    </UserProvider>
  );
}
