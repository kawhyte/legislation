import type { Metadata } from 'next';
import SignUpPage from '@/views/SignUpPage';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a free account to track bills and representatives in your state.',
};

export default function Page() {
  return <SignUpPage />;
}
