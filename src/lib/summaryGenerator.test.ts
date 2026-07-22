// @vitest-environment node

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Bill } from '@/types';

const { mockGenerateContent } = vi.hoisted(() => ({ mockGenerateContent: vi.fn() }));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent };
    }
  },
}));

import { clampBillInput, generateForBill, isFallback, FALLBACK } from './summaryGenerator';

const SUMMARY = {
  gist: 'This bill funds rural broadband.',
  whoItAffects: 'Rural residents',
  walletImpact: 'No direct cost impact.',
  controversy: { for: ['Closes the digital divide'], against: ['Costly'] },
};

const bill = (over: Partial<Bill> = {}): Bill =>
  ({ id: 'ocd-bill/aaa', title: 'A bill', ...over }) as Bill;

describe('clampBillInput', () => {
  it('truncates a 500-char title to 300', () => {
    const out = clampBillInput(bill({ title: 'x'.repeat(500) }));
    expect(out.title).toHaveLength(300);
  });

  it('truncates a 5000-char abstract to 4000', () => {
    const out = clampBillInput(
      bill({ abstracts: [{ abstract: 'y'.repeat(5000), note: '', date: '' }] })
    );
    expect(out.abstracts![0].abstract).toHaveLength(4000);
  });

  it('returns a new object and does not mutate its input', () => {
    const input = bill({
      title: 'x'.repeat(500),
      abstracts: [{ abstract: 'y'.repeat(5000), note: '', date: '' }],
    });
    const out = clampBillInput(input);

    expect(out).not.toBe(input);
    expect(input.title).toHaveLength(500);
    expect(input.abstracts![0].abstract).toHaveLength(5000);
  });

  it('leaves within-limit input untouched', () => {
    const out = clampBillInput(bill({ title: 'Short title' }));
    expect(out.title).toBe('Short title');
  });
});

describe('isFallback', () => {
  it('identifies the fallback object', () => {
    expect(isFallback(FALLBACK)).toBe(true);
  });

  it('rejects a real summary', () => {
    expect(isFallback(SUMMARY)).toBe(false);
  });
});

describe('generateForBill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the parsed summary Gemini produced', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(SUMMARY) },
    });

    // delayMs: 0 — the 4s default spacing is not what this test is about.
    await expect(generateForBill(bill(), { delayMs: 0 })).resolves.toMatchObject({
      gist: SUMMARY.gist,
    });
  });

  it('returns FALLBACK when the Gemini call rejects', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API key invalid'));

    await expect(generateForBill(bill(), { delayMs: 0 })).resolves.toEqual(FALLBACK);
  });

  it('returns FALLBACK when Gemini returns unparseable text', async () => {
    mockGenerateContent.mockResolvedValue({ response: { text: () => 'not json' } });

    await expect(generateForBill(bill(), { delayMs: 0 })).resolves.toEqual(FALLBACK);
  });
});
