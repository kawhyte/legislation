'use client';

import dynamic from 'next/dynamic';

// ssr: false — BrowserRouter (React Router) uses window.location; disable SSR
// until Step 6 replaces React Router with Next.js file-based routing.
const App = dynamic(() => import('@/App'), { ssr: false });

export default function CatchAll() {
  return <App />;
}
