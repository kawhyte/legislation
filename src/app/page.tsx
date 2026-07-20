import type { Metadata } from 'next';
import HomePageView from '@/views/HomePageView';

export const metadata: Metadata = {
  title: 'Billhound — Legislation That Matters',
  description: 'Track the bills that affect you, explained in plain English. Pick your state to see what your legislature is working on right now.',
};

export default function Page() {
  return <HomePageView />;
}
