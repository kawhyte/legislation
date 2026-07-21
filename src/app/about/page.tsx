import type { Metadata } from 'next';
import AboutPage from '@/views/AboutPage';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn how Billhound tracks state legislation and translates it into plain English.',
};

export default function Page() {
  return <AboutPage />;
}
