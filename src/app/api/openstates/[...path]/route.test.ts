// @vitest-environment node
// NextResponse needs the real Web fetch primitives, which jsdom does not provide.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

/**
 * The proxy's resilience contract. OpenStates intermittently stops answering a
 * query shape for minutes at a time — measured 60s+ hangs across three states
 * in one minute, with the identical request returning 200 in 0.4s shortly
 * after. These pin the behaviour that keeps that from reaching the browser as a
 * platform-killed 504 a minute later.
 */

const url = (path = 'bills', search = '?jurisdiction=Texas') =>
  `http://localhost:3000/api/openstates/${path}${search}`;

const request = (path = 'bills', search = '?jurisdiction=Texas') =>
  new NextRequest(url(path, search), { headers: { origin: 'http://localhost:3000' } });

const params = (path = 'bills') => ({ params: Promise.resolve({ path: path.split('/') }) });

const ok = (body: unknown = { results: [] }) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

/** A gateway timeout body is HTML, not JSON — exactly as the real one is. */
const gatewayTimeout = () => new Response('<html>504 Gateway Time-out</html>', { status: 504 });

const timeoutError = () => Object.assign(new Error('The operation was aborted due to timeout'), {
  name: 'TimeoutError',
});

describe('GET /api/openstates — upstream resilience', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('passes a healthy response straight through, once', async () => {
    fetchMock.mockResolvedValue(ok({ results: [{ id: 'b1' }] }));

    const res = await GET(request(), params());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ results: [{ id: 'b1' }] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bounds every attempt with a timeout signal', async () => {
    fetchMock.mockResolvedValue(ok());

    await GET(request(), params());

    const init = fetchMock.mock.calls[0][1];
    expect(init.signal).toBeInstanceOf(AbortSignal);
    // The Data Cache is load-bearing — a signal must not cost us the revalidate.
    expect(init.next).toEqual({ revalidate: 600 });
  });

  it('retries once after a timeout and serves the second attempt', async () => {
    // This is the observed real-world sequence: hang, then an instant 200.
    fetchMock.mockRejectedValueOnce(timeoutError()).mockResolvedValueOnce(ok({ results: [{ id: 'b2' }] }));

    const res = await GET(request(), params());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ results: [{ id: 'b2' }] });
  });

  it('retries a transient upstream 504 rather than forwarding it', async () => {
    fetchMock.mockResolvedValueOnce(gatewayTimeout()).mockResolvedValueOnce(ok());

    const res = await GET(request(), params());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
  });

  it('gives up after two attempts and says the upstream was slow', async () => {
    fetchMock.mockRejectedValue(timeoutError());

    const res = await GET(request(), params());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(504);
    await expect(res.json()).resolves.toEqual({ error: 'OpenStates took too long to respond.' });
  });

  it('reports an unreachable upstream as 502, not 504', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const res = await GET(request(), params());

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: 'Failed to fetch from OpenStates' });
  });

  it('never retries a 4xx — that is our request, not their weather', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ detail: 'bad param' }), { status: 422 }));

    const res = await GET(request(), params());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(422);
  });

  it('survives a non-JSON error body from a gateway', async () => {
    fetchMock.mockResolvedValue(gatewayTimeout());

    const res = await GET(request(), params());

    expect(res.status).toBe(504);
    await expect(res.json()).resolves.toEqual({ error: 'Upstream error' });
  });

  it('does not send Cache-Control on a failure', async () => {
    fetchMock.mockRejectedValue(timeoutError());
    const res = await GET(request(), params());
    expect(res.headers.get('cache-control') ?? '').not.toContain('s-maxage');
  });

  it('still refuses cross-origin callers before touching the upstream', async () => {
    const cross = new NextRequest(url(), { headers: { origin: 'https://evil.example' } });

    const res = await GET(cross, params());

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
