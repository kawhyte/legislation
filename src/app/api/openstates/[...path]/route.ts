import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, isSameOrigin } from '@/lib/rateLimit';

/**
 * Server-side proxy for the OpenStates API.
 * Injects OPENSTATES_API_KEY so it never reaches the browser.
 *
 * Only forwards requests to this allowlisted set of OpenStates endpoints,
 * from same-origin requests, and rate-limits per IP — otherwise this route
 * would be an open, free-to-use OpenStates proxy for anyone who finds it.
 *
 * Successful responses are cached (Next.js `fetch` revalidate + a
 * `Cache-Control` header) so Vercel's CDN can serve identical requests
 * from different users without hitting OpenStates again.
 */

const ALLOWED_PATH_PREFIXES = ['bills', 'people', 'people.geo', 'jurisdictions'];
const RATE_LIMIT_MAX_REQUESTS = 60; // per window, per IP — generous enough for normal browsing
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_QUERY_LENGTH = 2000;

const REVALIDATE_SECONDS: Record<string, number> = {
  bills: 600,
  people: 86400,
  'people.geo': 86400,
  jurisdictions: 86400,
};

function isAllowedPath(pathStr: string): boolean {
  const firstSegment = pathStr.split('/')[0];
  return ALLOWED_PATH_PREFIXES.includes(firstSegment);
}

/**
 * Reject relative path segments. Without this, a path like `bills/../committees`
 * passes the first-segment allowlist check but normalizes to a non-allowlisted
 * OpenStates endpoint once the upstream URL is fetched.
 *
 * Operates on the joined path string (re-split on `/`) rather than the raw
 * segment array: a URL-encoded-slash payload such as `bills%2f..%2fcommittees`
 * arrives as a single array element `bills/../committees`, which would slip past
 * a per-array-element check but is caught once the string is split on `/`.
 */
function hasTraversalSegment(pathStr: string): boolean {
  return pathStr.split('/').some((segment) => segment === '..' || segment === '.');
}

function getRevalidateSeconds(pathStr: string): number {
  const firstSegment = pathStr.split('/')[0];
  return REVALIDATE_SECONDS[firstSegment] ?? 600;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`openstates:${ip}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  const { path } = await params;
  const pathStr = path.join('/');

  if (hasTraversalSegment(pathStr) || !isAllowedPath(pathStr)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const search = request.nextUrl.search;
  if (search.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }

  const upstreamUrl = `https://v3.openstates.org/${pathStr}${search}`;
  const revalidateSeconds = getRevalidateSeconds(pathStr);

  try {
    const res = await fetch(upstreamUrl, {
      headers: { 'X-API-KEY': process.env.OPENSTATES_API_KEY ?? '' },
      next: { revalidate: revalidateSeconds },
    });

    if (!res.ok) {
      // Never cache error responses — always retry on the next request
      const errorData = await res.json().catch(() => ({ error: 'Upstream error' }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds * 6}`,
      },
    });
  } catch (err) {
    console.error('[/api/openstates] Upstream error:', err);
    return NextResponse.json({ error: 'Failed to fetch from OpenStates' }, { status: 502 });
  }
}
