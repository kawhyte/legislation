import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseLocationInput, getJurisdictionFromZip } from './zipToJurisdiction';

const okResponse = (abbr = 'TX') =>
  ({
    ok: true,
    json: async () => ({
      places: [{ 'state abbreviation': abbr, latitude: '25.9', longitude: '-80.2' }],
    }),
  }) as unknown as Response;

describe('zipToJurisdiction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves a zip to a state with coords', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    const state = await parseLocationInput('73301');
    expect(state.name).toBe('Texas');
    expect(state.zipCoords).toEqual({ lat: 25.9, lng: -80.2 });
  });

  it('caches by zip — a second lookup does not re-fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse('FL'));
    vi.stubGlobal('fetch', fetchMock);
    await getJurisdictionFromZip('33028');
    await getJurisdictionFromZip('33028');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws the user-facing message on a 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false } as Response));
    await expect(parseLocationInput('00000')).rejects.toThrow('Zip code not found. Please try again.');
  });

  // Without the timeout the "Find Bills" button spins forever; an abort must
  // surface as the same ordinary error a 404 does.
  it('throws the same message when the request aborts on timeout', async () => {
    const abort = Object.assign(new Error('The operation was aborted'), { name: 'TimeoutError' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(parseLocationInput('99998')).rejects.toThrow('Zip code not found. Please try again.');
  });

  it('passes an abort signal so the request cannot hang', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);
    await getJurisdictionFromZip('99997');
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('throws on a malformed body rather than crashing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as unknown as Response));
    await expect(parseLocationInput('99996')).rejects.toThrow('Zip code not found. Please try again.');
  });

  it('accepts a state name or abbreviation without any network call', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await parseLocationInput('Texas')).abbreviation).toBe('TX');
    expect((await parseLocationInput('fl')).name).toBe('Florida');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unrecognised input', async () => {
    await expect(parseLocationInput('Atlantis')).rejects.toThrow('Please enter a valid Zip Code or State name.');
  });
});
