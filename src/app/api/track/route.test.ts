// @vitest-environment node
// NextResponse needs the real Web fetch primitives, which jsdom does not provide.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';

const { mockAdd } = vi.hoisted(() => ({ mockAdd: vi.fn() }));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({ collection: () => ({ add: mockAdd }) }),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
}));

/** Same-origin by default — the route rejects anything else outright. */
const request = (body: unknown, { origin = 'http://localhost:3000' }: { origin?: string | null } = {}) =>
  new Request('http://localhost:3000/api/track', {
    method: 'POST',
    headers: origin ? { origin, 'content-type': 'application/json' } : { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('POST /api/track', () => {
  beforeEach(() => {
    mockAdd.mockReset().mockResolvedValue({ id: 'doc-1' });
  });

  it('writes a known event', async () => {
    const res = await POST(request({ event: 'feed_view', props: { feed: 'state', count: 3 }, path: '/' }));

    expect(res.status).toBe(204);
    expect(mockAdd).toHaveBeenCalledWith({
      event: 'feed_view',
      props: { feed: 'state', count: 3 },
      path: '/',
      createdAt: 'SERVER_TIMESTAMP',
    });
  });

  it('rejects an event name outside the closed vocabulary', async () => {
    const res = await POST(request({ event: 'evil_event', props: {} }));

    expect(res.status).toBe(400);
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('rejects cross-origin and origin-less callers', async () => {
    expect((await POST(request({ event: 'feed_view' }, { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await POST(request({ event: 'feed_view' }, { origin: null }))).status).toBe(403);
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON', async () => {
    const res = await POST(request('{not json'));

    expect(res.status).toBe(400);
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('drops non-primitive props and truncates long strings', async () => {
    await POST(request({
      event: 'topic_chip_tap',
      props: { topic: 'x'.repeat(500), nested: { uid: 'secret' }, list: [1, 2], nothing: null, ok: true },
    }));

    const written = mockAdd.mock.calls[0][0];
    expect(written.props.topic).toHaveLength(120);
    expect(written.props).not.toHaveProperty('nested');
    expect(written.props).not.toHaveProperty('list');
    expect(written.props).not.toHaveProperty('nothing');
    expect(written.props.ok).toBe(true);
  });

  it('caps the number of stored props', async () => {
    const props = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`k${i}`, i]));
    await POST(request({ event: 'feed_view', props }));

    expect(Object.keys(mockAdd.mock.calls[0][0].props)).toHaveLength(10);
  });

  it('never surfaces a Firestore failure to the client', async () => {
    mockAdd.mockRejectedValue(new Error('missing admin credentials'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST(request({ event: 'summary_view', props: { cached: true } }));

    expect(res.status).toBe(204);
  });
});
