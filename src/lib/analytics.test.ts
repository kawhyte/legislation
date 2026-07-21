import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * `enabled` is computed once at module load, so each case has to reset the module
 * registry after setting the env var — importing at the top of the file would
 * freeze the flag at whatever it was then.
 */
async function loadAnalytics() {
  vi.resetModules();
  return import('./analytics');
}

describe('track', () => {
  let sendBeacon: ReturnType<typeof vi.fn>;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendBeacon = vi.fn().mockReturnValue(true);
    fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchSpy);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
    vi.unstubAllGlobals();
  });

  it('is a no-op when the env flag is unset', async () => {
    const { track } = await loadAnalytics();
    track('feed_view', { feed: 'state', count: 3 });
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('is a no-op when the env flag is not exactly "true"', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = '1';
    const { track } = await loadAnalytics();
    track('feed_view', { feed: 'state', count: 3 });
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('beacons the event to /api/track when the env flag is on', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
    const { track } = await loadAnalytics();
    track('bill_card_click', { feed: 'state', position: 0, hasSummary: false });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0];
    expect(url).toBe('/api/track');
    expect(JSON.parse(await (blob as Blob).text())).toMatchObject({
      event: 'bill_card_click',
      props: { feed: 'state', position: 0, hasSummary: false },
    });
    // sendBeacon succeeded, so no duplicate fetch.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('falls back to keepalive fetch when sendBeacon is unavailable', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const { track } = await loadAnalytics();
    track('summary_view', { cached: true });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/track');
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: 'POST', keepalive: true });
  });

  it('does not throw when the transport throws', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
    sendBeacon.mockImplementation(() => {
      throw new Error('beacon blocked');
    });
    const { track } = await loadAnalytics();
    expect(() => track('summary_view', { cached: true })).not.toThrow();
  });

  it('swallows a rejected fallback fetch', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
    sendBeacon.mockReturnValue(false); // beacon queue full → fall through to fetch
    fetchSpy.mockRejectedValue(new Error('offline'));
    const { track } = await loadAnalytics();
    expect(() => track('location_set', { method: 'zip' })).not.toThrow();
    await Promise.resolve();
  });
});
