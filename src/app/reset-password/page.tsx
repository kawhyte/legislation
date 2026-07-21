import type { Metadata } from 'next';
import ResetPasswordPage from '@/views/ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your Billhound account password.',
};

export default function Page() {
  return <ResetPasswordPage />;
}
