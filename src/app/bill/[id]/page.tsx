import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBillById } from '@/lib/openstatesServer';
import BillDetailPage from '@/views/BillDetailPage';
import { analyzeBillMomentum } from '@/utils/billMomentum';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bill = await fetchBillById(decodeURIComponent(id));

  if (!bill) {
    return { title: 'Bill not found' };
  }

  const description = bill.abstracts?.[0]?.abstract?.slice(0, 155)
    ?? `${bill.identifier}: ${bill.title}`.slice(0, 155);

  return {
    title: `${bill.identifier} — ${bill.title}`,
    description,
    openGraph: {
      title: `${bill.identifier} — ${bill.title}`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bill.identifier} — ${bill.title}`,
      description,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const bill = await fetchBillById(decodeURIComponent(id));

  if (!bill) {
    notFound();
  }

  const enrichedBill = { ...bill, momentum: analyzeBillMomentum(bill) };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: bill.title,
    identifier: bill.identifier,
    legislationIdentifier: bill.identifier,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BillDetailPage bill={enrichedBill} />
    </>
  );
}
