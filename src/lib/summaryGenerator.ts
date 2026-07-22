/**
 * The Gemini client, prompt, and generation logic — extracted from
 * `/api/summarize` so the user-facing route and the prewarm cron
 * (`/api/prewarm-summaries`) share exactly one code path. Two copies of the
 * prompt would drift, and a drifted prompt silently produces two different
 * shapes of summary under the same SUMMARY_PROMPT_VERSION.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Bill, BillSummaryData } from '@/types';

// ── Singleton AI client (module-level = one instance per server process) ──────

/**
 * `gemini-2.5-flash` is no longer usable: the API answers a generateContent call
 * for it with 404 "no longer available to new users", so any key issued now
 * fails on it while older grandfathered keys still work. That is a silent trap —
 * it presents as every summary coming back as FALLBACK, not as a startup error.
 *
 * Model availability is also split across API versions, verified by calling both:
 * gemini-3.6-flash answers on v1beta (the SDK default, so no override needed)
 * and 404s on v1, while gemini-3.5-flash is the reverse. Check both before
 * concluding a model is unavailable.
 */
export const SUMMARY_MODEL = 'gemini-3.6-flash';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const model = genAI.getGenerativeModel({
  model: SUMMARY_MODEL,
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  },
});

const DEFAULT_REQUEST_DELAY = 4000; // 4 seconds between Gemini requests
const MAX_TITLE_LENGTH = 300;
const MAX_ABSTRACT_LENGTH = 4000;

let lastRequestTime = 0;

export const FALLBACK: BillSummaryData = {
  gist: 'Summary unavailable at this time.',
  whoItAffects: 'General public',
  walletImpact: 'No direct cost impact.',
  controversy: { for: [], against: [] },
};

/** A Gemini failure returns FALLBACK; it must never be cached in L1 or L2. */
export const isFallback = (d: BillSummaryData) => d.gist === FALLBACK.gist;

/**
 * Cap (rather than reject) overlong input so legitimate long official titles
 * still summarize, while bounding the tokens sent to Gemini. Returns a new
 * object — callers pass bills they do not own (a parsed request body, a bill
 * out of the trending feed), so mutating in place is not ours to do.
 */
export function clampBillInput(bill: Bill): Bill {
  const clamped: Bill = { ...bill };

  if (typeof clamped.title === 'string' && clamped.title.length > MAX_TITLE_LENGTH) {
    clamped.title = clamped.title.slice(0, MAX_TITLE_LENGTH);
  }

  const abstract = clamped.abstracts?.[0]?.abstract;
  if (abstract && abstract.length > MAX_ABSTRACT_LENGTH) {
    clamped.abstracts = clamped.abstracts!.map((entry, i) =>
      i === 0 ? { ...entry, abstract: entry.abstract.slice(0, MAX_ABSTRACT_LENGTH) } : entry
    );
  }

  return clamped;
}

/**
 * LIMITATION: `lastRequestTime` is a module global, so this only spaces Gemini
 * calls within a single server process. On Vercel, concurrent lambda instances
 * each have their own copy and do not space calls against each other. The
 * per-IP limiter in `/api/summarize` is the real protection there.
 */
async function enforceRateLimit(delayMs: number): Promise<void> {
  const timeSince = Date.now() - lastRequestTime;
  if (timeSince < delayMs) {
    await new Promise(resolve => setTimeout(resolve, delayMs - timeSince));
  }
  lastRequestTime = Date.now();
}

function parseResponse(text: string): BillSummaryData {
  try {
    return JSON.parse(text) as BillSummaryData;
  } catch {
    console.error('[summaryGenerator] JSON parse failed:', text.slice(0, 500));
    return FALLBACK;
  }
}

export async function generateForBill(
  bill: Bill,
  { delayMs = DEFAULT_REQUEST_DELAY }: { delayMs?: number } = {}
): Promise<BillSummaryData> {
  await enforceRateLimit(delayMs);

  let context = `Bill Title: "${bill.title}"`;
  if (bill.abstracts && bill.abstracts.length > 0 && bill.abstracts[0].abstract) {
    context += `\nOfficial Abstract: "${bill.abstracts[0].abstract}"`;
  }
  if (bill.subject && bill.subject.length > 0) {
    context += `\nSubjects: ${bill.subject.join(', ')}`;
  }
  if (bill.latest_action_description) {
    context += `\nLatest Action: ${bill.latest_action_description}`;
  }

  const prompt = `You are a legislative analyst. Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

Use this exact schema:
{
  "gist": "1-3 sentence plain-English summary of what this bill does",
  "whoItAffects": "The primary group affected (e.g. homeowners, teachers, small businesses)",
  "walletImpact": "Direct financial effect — costs, taxes, fines, or savings. If none, say 'No direct cost impact.'",
  "controversy": {
    "for": ["1-2 short bullet points supporting the bill"],
    "against": ["1-2 short bullet points opposing the bill"]
  }
}

Bill information:
${context}`;

  try {
    const result = await model.generateContent(prompt);
    return parseResponse(result.response.text().trim());
  } catch (error) {
    console.error('[summaryGenerator] Gemini error:', error);
    return FALLBACK;
  }
}
