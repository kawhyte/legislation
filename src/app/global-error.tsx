'use client';

import { useEffect } from 'react';

/**
 * Last-resort handler for React rendering errors in the App Router. Without this
 * file such an error renders Next's built-in blank error page and is never
 * recorded anywhere.
 *
 * There is no error-monitoring vendor: `console.error` here is captured by the
 * host platform's runtime logs, which is the free option.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('[global-error]', error.digest ?? '', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-2xl font-black">Something went wrong.</h1>
          <p className="text-sm text-muted-foreground">Try reloading the page.</p>
        </div>
      </body>
    </html>
  );
}
