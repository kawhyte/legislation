'use client';

import { FEED_CHIP_TOPICS } from '@/constants/trendingTopics';
import type { Taps } from '@/lib/topicAffinity';

interface Props {
  /** Current tap counts. A topic with any taps renders as active. */
  taps: Taps;
  onTap: (topicId: string) => void;
  onClear: () => void;
}

const CHIP_BASE =
  'shrink-0 whitespace-nowrap rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold ' +
  'shadow-[2px_2px_0px_0px_hsl(var(--foreground))] transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';

/**
 * The feed's steering wheel: tapping a topic re-sorts the bills already in
 * memory. Two rules hold this together:
 *
 *  - It **re-sorts, never filters.** Filtering a 20-bill state feed by "Weed"
 *    usually yields zero results and a dead end; re-sorting always shows
 *    something.
 *  - It **never refetches.** The tap only changes a boost map the caller feeds
 *    back into computeTrendingScore, so a tap costs zero requests and zero
 *    tokens. tests/e2e/home.spec.ts asserts the request count does not move.
 *
 * Deliberately not built on TopicButton — that is a large icon+heading card for
 * a selector grid, not a compact inline chip.
 *
 * Not sticky: LocationChip directly above already holds the one `sticky top-0`
 * slot on mobile, and a second sticky element at the same offset would render
 * underneath it.
 */
const TopicChipRow: React.FC<Props> = ({ taps, onTap, onClear }) => {
  const anyActive = FEED_CHIP_TOPICS.some(t => (taps[t.id] ?? 0) > 0);

  return (
    <div
      // `-mx-4 px-4` bleeds the scroll area to the viewport edge so the last
      // chip is visibly cut off — the affordance that says "this scrolls".
      // `touch-action` keeps a vertical swipe scrolling the page rather than
      // being swallowed by the horizontal scroller on iOS.
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [touch-action:pan-x_pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Sort the feed by topic"
    >
      {FEED_CHIP_TOPICS.map(topic => {
        const active = (taps[topic.id] ?? 0) > 0;
        return (
          <button
            key={topic.id}
            type="button"
            aria-pressed={active}
            onClick={() => onTap(topic.id)}
            className={`${CHIP_BASE} ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-muted'
            }`}
          >
            {topic.label}
          </button>
        );
      })}

      {/* Only offered once there is something to undo. */}
      {anyActive && (
        <button
          type="button"
          onClick={onClear}
          className={`${CHIP_BASE} bg-card text-muted-foreground hover:bg-muted`}
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default TopicChipRow;
