// @vitest-environment node
// NextRequest/NextResponse need the real Web fetch primitives, which jsdom does not provide.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { Bill } from '@/types';

const { mockDocGet, mockDocSet, mockDoc, mockGenerateForBill } = vi.hoisted(() => ({
  mockDocGet: vi.fn(),
  mockDocSet: vi.fn(),
  mockDoc: vi.fn(),
  mockGenerateForBill: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({ collection: () => ({ doc: mockDoc }) }),
}));

vi.mock('@/lib/summaryGenerator', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/summaryGenerator')>('@/lib/summaryGenerator');
  return { ...actual, generateForBill: mockGenerateForBill };
});

const SECRET = 'test-secret';

const SUMMARY = {
  gist: 'This bill funds rural broadband.',
  whoItAffects: 'Rural residents',
  walletImpact: 'No direct cost impact.',
  controversy: { for: ['Closes the digital divide'], against: ['Costly'] },
};

const FALLBACK = {
  gist: 'Summary unavailable at this time.',
  whoItAffects: 'General public',
  walletImpact: 'No direct cost impact.',
  controversy: { for: [], against: [] },
};

const snapshot = (data?: Record<string, unknown>) => ({
  exists: data !== undefined,
  data: () => data,
});

const bills = (n: number): Bill[] =>
  Array.from({ length: n }, (_, i) => ({ id: `ocd-bill/${i}`, title: `Bill ${i}` }) as Bill);

const post = (auth?: string) =>
  new Request('http://localhost:3000/api/prewarm-summaries', {
    method: 'POST',
    headers: auth ? { authorization: auth } : {},
  }) as unknown as NextRequest;

/** `bills` is what /api/trending will return to the route's own fetch. */
function trendingReturns(list: Bill[], ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok, json: async () => ({ bills: list }) })
  );
}

async function loadRoute() {
  const mod = await import('./route');
  return mod.POST;
}

describe('/api/prewarm-summaries', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', SECRET);
    mockDoc.mockReturnValue({ get: mockDocGet, set: mockDocSet });
    mockDocGet.mockResolvedValue(snapshot(undefined)); // no cached summaries
    mockDocSet.mockResolvedValue(undefined);
    mockGenerateForBill.mockResolvedValue(SUMMARY);
    trendingReturns(bills(3));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns 401 with no authorization header', async () => {
    const POST = await loadRoute();
    expect((await POST(post())).status).toBe(401);
    expect(mockGenerateForBill).not.toHaveBeenCalled();
  });

  it('returns 401 with the wrong bearer token', async () => {
    const POST = await loadRoute();
    expect((await POST(post('Bearer wrong'))).status).toBe(401);
  });

  it('returns 404 — not 401 — when CRON_SECRET is unset', async () => {
    // An unconfigured endpoint should be indistinguishable from a missing one.
    vi.stubEnv('CRON_SECRET', '');
    const POST = await loadRoute();
    expect((await POST(post(`Bearer ${SECRET}`))).status).toBe(404);
  });

  it('returns 502 when /api/trending is unavailable', async () => {
    trendingReturns([], false);
    const POST = await loadRoute();
    expect((await POST(post(`Bearer ${SECRET}`))).status).toBe(502);
  });

  it('generates a summary for every bill that has none', async () => {
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report).toMatchObject({
      considered: 3,
      skipped: 0,
      generated: 3,
      failed: 0,
      stoppedEarly: false,
    });
    expect(mockDocSet).toHaveBeenCalledTimes(3);
    expect(mockDocSet.mock.calls[0][0]._meta).toMatchObject({
      model: 'gemini-3.6-flash',
      promptVersion: 0,
    });
  });

  it('skips a bill whose doc is already at the current prompt version', async () => {
    mockDocGet.mockResolvedValue(snapshot({ ...SUMMARY, _meta: { promptVersion: 0 } }));
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report).toMatchObject({ skipped: 3, generated: 0 });
    expect(mockGenerateForBill).not.toHaveBeenCalled();
    expect(mockDocSet).not.toHaveBeenCalled();
  });

  it('regenerates a bill whose doc is at an older prompt version', async () => {
    vi.doMock('@/lib/summaryCacheKey', async () => {
      const actual =
        await vi.importActual<typeof import('@/lib/summaryCacheKey')>('@/lib/summaryCacheKey');
      return { ...actual, SUMMARY_PROMPT_VERSION: 5 };
    });
    mockDocGet.mockResolvedValue(snapshot({ ...SUMMARY, _meta: { promptVersion: 4 } }));
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report).toMatchObject({ skipped: 0, generated: 3 });
    expect(mockDocSet).toHaveBeenCalledWith(
      expect.objectContaining({ _meta: expect.objectContaining({ promptVersion: 5 }) })
    );
    vi.doUnmock('@/lib/summaryCacheKey');
  });

  it('stops after BATCH_SIZE generations even when 40 bills are missing summaries', async () => {
    // BATCH_SIZE is 3: the Gemini free tier allows only 5 requests/minute, so
    // calls are 13s apart, and a bigger batch overruns the 60s function cap
    // (BATCH_SIZE=4 returned 504 in production).
    trendingReturns(bills(40));
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report).toMatchObject({ considered: 40, generated: 3 });
    expect(mockGenerateForBill).toHaveBeenCalledTimes(3);
  });

  it('stops early rather than starting work it cannot finish in time', async () => {
    // A slow generator burns the wall-clock budget; the route must return a
    // report with stoppedEarly rather than be killed at the 60s function cap.
    vi.useFakeTimers();
    mockGenerateForBill.mockImplementation(async () => {
      await vi.advanceTimersByTimeAsync(40_000);
      return SUMMARY;
    });
    trendingReturns(bills(40));
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report.stoppedEarly).toBe(true);
    expect(report.generated).toBeLessThan(3);
    vi.useRealTimers();
  });

  it('bounds the loop by attempts, so a total Gemini outage cannot run away', async () => {
    // Regression: counting only successes meant every-bill failure never hit the
    // break, so the loop walked all 40 bills at DELAY_MS each and hit the 60s cap.
    mockGenerateForBill.mockResolvedValue(FALLBACK);
    trendingReturns(bills(40));
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report).toMatchObject({ generated: 0, failed: 3 });
    expect(mockGenerateForBill).toHaveBeenCalledTimes(3);
    expect(mockDocSet).not.toHaveBeenCalled();
  });

  it('counts a fallback as failed and never writes it', async () => {
    // Persisting a fallback would poison the bill: every later read is a hit.
    mockGenerateForBill.mockResolvedValue(FALLBACK);
    const POST = await loadRoute();

    const report = await (await POST(post(`Bearer ${SECRET}`))).json();

    expect(report).toMatchObject({ generated: 0, failed: 3 });
    expect(mockDocSet).not.toHaveBeenCalled();
  });
});
