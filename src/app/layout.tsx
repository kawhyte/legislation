import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@/index.css';
import Providers from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legislation-tracker-inky.vercel.app'),
  title: {
    default: 'Billhound — Legislation That Matters',
    template: '%s | Billhound',
  },
  description: 'Track the bills that affect you, explained in plain English. See what your state legislature and representatives are actually doing.',
  openGraph: {
    type: 'website',
    siteName: 'Billhound',
    title: 'Billhound — Legislation That Matters',
    description: 'Track the bills that affect you, explained in plain English.',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Billhound — Legislation That Matters',
    description: 'Track the bills that affect you, explained in plain English.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Billhound',
              url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legislation-tracker-inky.vercel.app',
            }),
          }}
        />
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
