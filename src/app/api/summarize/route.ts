import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Bill, BillSummaryData } from '@/types';

// ── Singleton AI client (module-level = one instance per server process) ──────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  },
});

// ── In-memory cache (same logic as original GeminiService) ────────────────────

interface CacheEntry {
  data: BillSummaryData;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REQUEST_DELAY = 4000;                  // 4 seconds between Gemini requests

const summaryCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<BillSummaryData>>();
let lastRequestTime = 0;

const FALLBACK: BillSummaryData = {
  gist: 'Summary unavailable at this time.',
  whoItAffects: 'General public',
  walletImpact: 'No direct cost impact.',
  controversy: { for: [], against: [] },
};

function getCacheKey(title: string): string {
  return `summary_${title.toLowerCase().replace(/\s+/g, '_').slice(0, 50)}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

async function enforceRateLimit(): Promise<void> {
  const timeSince = Date.now() - lastRequestTime;
  if (timeSince < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSince));
  }
  lastRequestTime = Date.now();
}

function parseResponse(text: string): BillSummaryData {
  try {
    return JSON.parse(text) as BillSummaryData;
  } catch {
    console.error('[/api/summarize] JSON parse failed:', text.slice(0, 500));
    return FALLBACK;
  }
}

async function generateForBill(bill: Bill): Promise<BillSummaryData> {
  await enforceRateLimit();

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
    console.log('[/api/summarize] Calling Gemini for:', bill.title);
    const result = await model.generateContent(prompt);
    return parseResponse(result.response.text().trim());
  } catch (error) {
    console.error('[/api/summarize] Gemini error:', error);
    return FALLBACK;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let bill: Bill;

  try {
    const body = await request.json() as { bill: Bill };
    bill = body.bill;
    if (!bill?.title) throw new Error('Missing bill.title');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const cacheKey = getCacheKey(bill.title);

  // L1: in-memory server cache
  const cached = summaryCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log('[/api/summarize] Cache hit for:', bill.title);
    return NextResponse.json(cached.data);
  }

  // Deduplicate concurrent requests for the same bill
  if (pendingRequests.has(cacheKey)) {
    const data = await pendingRequests.get(cacheKey)!;
    return NextResponse.json(data);
  }

  const requestPromise = generateForBill(bill);
  pendingRequests.set(cacheKey, requestPromise);

  try {
    const data = await requestPromise;
    summaryCache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } finally {
    pendingRequests.delete(cacheKey);
  }
}
