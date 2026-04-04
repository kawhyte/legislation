'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserContext';
import DashboardPage from '@/views/DashboardPage';

function DashboardGuard() {
  const { isSignedIn, isLoaded } = useUser();
  const { userPreferences, isLoadingPreferences } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace('/sign-in');
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoadingPreferences && isSignedIn && userPreferences && !userPreferences.profileSetupCompleted) {
      router.replace('/profile-setup');
    }
  }, [isLoadingPreferences, isSignedIn, userPreferences, router]);

  if (!isLoaded || isLoadingPreferences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  return <DashboardPage />;
}

export default function DashboardRoute() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardGuard />
    </Suspense>
  );
}
