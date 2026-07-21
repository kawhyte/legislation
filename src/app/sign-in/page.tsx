import type { Metadata } from 'next';
import SignInPage from '@/views/SignInPage';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to track legislation and representatives that matter to you.',
};

export default function Page() {
  return <SignInPage />;
}
