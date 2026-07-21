/**
 * Topic taxonomy for the NATIONAL "Trending" feed (src/hooks/useTrendingBills.ts).
 *
 * This is deliberately separate from src/constants/topics.ts:
 *  - topics.ts drives the UI topic *selector* (a short, tidy dropdown).
 *  - this file tunes what the trending feed *fetches* and how it's *ranked*,
 *    weighted toward the issues a 21–39 audience actually cares about.
 */

/**
 * Curated full-text search terms fired at OpenStates (one query per term, in
 * parallel, merged + deduped) by the /api/trending route.
 *
 * IMPORTANT — these are chosen for OpenStates query SPEED, not label prettiness.
 * Broad common words (`housing`, `health`, `childcare`) reliably time out (504
 * at 60s) on OpenStates' nationwide full-text search, so we use a narrower,
 * empirically-fast token per topic (e.g. `eviction` for housing, `insulin` for
 * healthcare). Topic *relevance* is handled separately by TOPIC_WEIGHTS below,
 * which scores each returned bill's title + subjects — so a bill fetched via
 * `eviction` still gets full "housing" weight if its text warrants it.
 *
 * Kept to single words: OpenStates `q` treats a multi-word value as an AND
 * phrase, which over-narrows. Bounded to ~8 terms.
 */
export const TRENDING_QUERY_TOPICS: readonly string[] = [
  'eviction',    // housing / rent / tenant
  'insulin',     // healthcare cost / prescriptions
  'abortion',    // reproductive rights
  'cannabis',    // marijuana legalization
  'overtime',    // wages / labor
  'emissions',   // climate / clean energy
  'biometric',   // privacy / data / tech
  'immigration', // immigration
] as const;

/**
 * Weighted keyword → salience map used by computeTrendingScore (src/utils/trendingScore.ts).
 * Each pattern that matches a bill's `title + subjects` adds its `weight` to the
 * topic component of the score. Replaces the old flat `HIGH_IMPACT ? +50` boolean
 * so that, e.g., a housing-affordability bill outranks a generic appropriations bill.
 *
 * Weights are relative — higher = more salient to a 21–39 audience. A bill can
 * match several patterns; contributions sum.
 */
export interface TopicWeight {
  label: string;
  pattern: RegExp;
  weight: number;
}

export const TOPIC_WEIGHTS: readonly TopicWeight[] = [
  { label: 'Housing / rent',      pattern: /\b(housing|rent|eviction|tenant|landlord|mortgage|zoning|homeless)\w*/i, weight: 40 },
  { label: 'Student debt / education', pattern: /\b(student loan|student debt|tuition|financial aid|college afford|scholarship)\w*/i, weight: 38 },
  { label: 'Healthcare cost',     pattern: /\b(health care|healthcare|insulin|prescription|medicaid|medicare|mental health|insurance premium)\w*/i, weight: 36 },
  { label: 'Climate / energy',    pattern: /\b(climate|clean energy|renewable|emission|solar|carbon|pollution)\w*/i, weight: 34 },
  { label: 'Reproductive rights', pattern: /\b(abortion|reproductive|contracepti|pregnan)\w*/i, weight: 34 },
  { label: 'Wages / labor',       pattern: /\b(minimum wage|wage|overtime|paid leave|gig worker|union|worker)\w*/i, weight: 32 },
  { label: 'Cannabis',            pattern: /\b(cannabis|marijuana|psilocybin)\w*/i, weight: 28 },
  { label: 'Privacy / tech',      pattern: /\b(privacy|data protection|social media|artificial intelligence|\bai\b|surveillance|biometric)\w*/i, weight: 26 },
  { label: 'Guns',                pattern: /\b(firearm|gun|weapon|ammunition)\w*/i, weight: 26 },
  { label: 'LGBTQ',               pattern: /\b(lgbtq|transgender|gender-affirming|same-sex)\w*/i, weight: 26 },
  { label: 'Immigration',         pattern: /\b(immigrat|asylum|deportation|daca|undocumented)\w*/i, weight: 24 },
  { label: 'Childcare',           pattern: /\b(child care|childcare|day care|pre-k)\w*/i, weight: 22 },
  { label: 'Transit',             pattern: /\b(transit|public transportation|bike lane|pedestrian)\w*/i, weight: 20 },
  { label: 'Voting / civil',      pattern: /\b(voting|election|civil right|police reform)\w*/i, weight: 20 },
];

/** Ceremonial / non-substantive bills that should never trend. */
export const JUNK_TITLE =
  /mourning|congratulating|designating|commending|renaming|honoring|recognizing|celebrating|memorializing|declaring/i;
