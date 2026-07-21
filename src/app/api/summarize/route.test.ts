// @vitest-environment node
// NextRequest/NextResponse need the real Web fetch primitives, which jsdom does not provide.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { Bill } from '@/types';
import { summaryDocId } from '@/lib/summaryCacheKey';

const { mockGenerateContent, mockDocGet, mockDocSet } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockDocGet: vi.fn(),
  mockDocSet: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent };
    }
  },
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({ get: mockDocGet, set: mockDocSet }),
    }),
  }),
}));

const SUMMARY = {
  gist: 'This bill funds rural broadband.',
  whoItAffects: 'Rural residents',
  walletImpact: 'No direct cost impact.',
  controversy: { for: ['Closes the digital divide'], against: ['Costly'] },
};

/** A Firestore snapshot stub. `data` of undefined means "document missing". */
const snapshot = (data?: Record<string, unknown>) => ({
  exists: data !== undefined,
  data: () => data,
});

const geminiReturns = (payload: unknown) => ({
  response: { text: () => JSON.stringify(payload) },
});

let ipSeed = 0;

const bill = (id: string, title: string): Bill => ({ id, title } as Bill);

/** Each request gets its own IP so the per-IP rate limiter never interferes. */
const post = (b: Bill) =>
  new Request('http://localhost:3000/api/summarize', {
    method: 'POST',
    headers: {
      origin: 'http://localhost:3000',
      'x-real-ip': `10.0.0.${ipSeed++}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ bill: b }),
  }) as unknown as NextRequest;

/** The route's L1 cache and pending-request map are module state — reload per test. */
async function loadRoute() {
  const mod = await import('./route');
  return mod.POST;
}

describe('/api/summarize cache integrity', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockDocGet.mockResolvedValue(snapshot(undefined));
    mockDocSet.mockResolvedValue(undefined);
    mockGenerateContent.mockResolvedValue(geminiReturns(SUMMARY));
  });

  it('gives two bills with an identical 50-char title prefix different cache keys', () => {
    // The removed key was `title.toLowerCase().replace(/\s+/g,'_').slice(0,50)`,
    // which these two real-shaped titles collide on.
    const oldKey = (t: string) => t.toLowerCase().replace(/\s+/g, '_').slice(0, 50);
    const titleA = 'An act relating to the regulation of commercial fishing licenses';
    const titleB = 'An act relating to the regulation of commercial fishing vessels';
    expect(oldKey(titleA)).toBe(oldKey(titleB));

    expect(summaryDocId('ocd-bill/aaa')).not.toBe(summaryDocId('ocd-bill/bbb'));
  });

  it('serves different summaries for two bills sharing a title prefix', async () => {
    const POST = await loadRoute();
    const title = 'An act relating to the regulation of commercial activity';
    const second = { ...SUMMARY, gist: 'A completely different bill.' };

    mockGenerateContent.mockResolvedValueOnce(geminiReturns(SUMMARY));
    mockGenerateContent.mockResolvedValueOnce(geminiReturns(second));

    const a = await (await POST(post(bill('ocd-bill/aaa', title)))).json();
    const b = await (await POST(post(bill('ocd-bill/bbb', title)))).json();

    expect(a.gist).not.toBe(b.gist);
  }, 15000); // the module's 4s inter-request delay applies to the second generation

  it('returns the Firestore doc without calling Gemini when a valid cached doc exists', async () => {
    mockDocGet.mockResolvedValue(snapshot({ ...SUMMARY, _meta: { promptVersion: 0 } }));
    const POST = await loadRoute();

    const res = await POST(post(bill('ocd-bill/cached', 'Some bill')));

    expect(await res.json()).toMatchObject({ gist: SUMMARY.gist });
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(mockDocSet).not.toHaveBeenCalled(); // already in Firestore — no rewrite
  });

  it('calls Gemini exactly once when two requests for the same bill race', async () => {
    const POST = await loadRoute();
    const b = bill('ocd-bill/racing', 'Some bill');

    await Promise.all([POST(post(b)), POST(post(b))]);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('treats a doc from an older prompt version as a miss', async () => {
    vi.doMock('@/lib/summaryCacheKey', async () => {
      const actual = await vi.importActual<typeof import('@/lib/summaryCacheKey')>(
        '@/lib/summaryCacheKey'
      );
      return { ...actual, SUMMARY_PROMPT_VERSION: 5 };
    });
    mockDocGet.mockResolvedValue(snapshot({ ...SUMMARY, _meta: { promptVersion: 4 } }));
    const POST = await loadRoute();

    await POST(post(bill('ocd-bill/stale', 'Some bill')));

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockDocSet).toHaveBeenCalledWith(
      expect.objectContaining({ _meta: expect.objectContaining({ promptVersion: 5 }) })
    );
    vi.doUnmock('@/lib/summaryCacheKey');
  });

  it('writes provenance metadata on a freshly generated summary', async () => {
    const POST = await loadRoute();

    await POST(post(bill('ocd-bill/fresh', 'Some bill')));

    expect(mockDocSet).toHaveBeenCalledTimes(1);
    const written = mockDocSet.mock.calls[0][0];
    expect(written.gist).toBe(SUMMARY.gist);
    expect(written._meta.model).toBe('gemini-2.5-flash');
    expect(typeof written._meta.generatedAt).toBe('string');
    expect(typeof written._meta.promptVersion).toBe('number');
  });

  it('does not cache the fallback when Gemini fails', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API key invalid'));
    const POST = await loadRoute();

    const res = await POST(post(bill('ocd-bill/broken', 'Some bill')));

    expect((await res.json()).gist).toBe('Summary unavailable at this time.');
    expect(mockDocSet).not.toHaveBeenCalled();
  });
});
