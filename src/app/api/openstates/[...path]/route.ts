import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for the OpenStates API.
 * Injects OPENSTATES_API_KEY so it never reaches the browser.
 *
 * All GET requests to /api/openstates/<path>?<params>
 * are forwarded verbatim to https://v3.openstates.org/<path>?<params>
 * with the API key added as a header.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  // Preserve the full query string (qs arrayFormat=repeat produces repeated keys)
  const search = request.nextUrl.search;
  const upstreamUrl = `https://v3.openstates.org/${pathStr}${search}`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: { 'X-API-KEY': process.env.OPENSTATES_API_KEY ?? '' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[/api/openstates] Upstream error:', err);
    return NextResponse.json({ error: 'Failed to fetch from OpenStates' }, { status: 502 });
  }
}
