/**
 * The single source of truth for how a bill maps to its cached-summary document.
 * Both the server route and the client cache service import this, so the two
 * layers can never drift apart again (they previously did: L1 keyed on a title
 * slug, L2 on the bill id, which served one bill's summary under another's).
 *
 * SUMMARY_PROMPT_VERSION starts at 0 so every summary already in Firestore
 * (none of which carry `_meta`) still counts as current — bumping it to 1 on the
 * next prompt change is what invalidates the whole cache, one regeneration each.
 */
export const SUMMARY_PROMPT_VERSION = 0;

export function summaryDocId(billId: string): string {
  return encodeURIComponent(billId);
}
