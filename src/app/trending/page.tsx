import type { Metadata } from 'next';
import TrendingBillsPage from '@/views/TrendingBillsPage';

export const metadata: Metadata = {
  title: 'Trending Bills',
  description: 'See the legislation gaining momentum nationwide right now, explained in plain English.',
};

export default function Page() {
  return <TrendingBillsPage />;
}
