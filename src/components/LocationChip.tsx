'use client';

import { MapPin } from 'lucide-react';

/**
 * How the currently displayed feed was chosen. The chip's copy — and how much
 * confidence it projects — depends entirely on this.
 */
export type LocationSource = 'none' | 'guess' | 'recent' | 'profile' | 'explicit';

interface Props {
  source: LocationSource;
  /** Full state name, e.g. "Florida". Null while on the national feed. */
  stateName: string | null;
  /** Scrolls the hero into view and focuses the one and only state picker. */
  onChangeLocation: () => void;
}

/**
 * States the feed you are looking at and offers to localise it. Deliberately not
 * a picker: there is exactly one location UI in the hero, reached from two places.
 */
const LocationChip: React.FC<Props> = ({ source, stateName, onChangeLocation }) => {
  // A guess or a remembered state without a name to show is not sayable.
  if (source !== 'none' && !stateName) return null;

  let label: string;
  let action: string;
  let ariaLabel: string;

  if (source === 'none') {
    label = 'Showing trending US bills';
    action = 'Set your state';
    ariaLabel = 'Set your state to see local bills';
  } else if (source === 'guess') {
    // IP geo resolves to an ISP's egress, not a home address. Never present it
    // as fact, and always keep the escape hatch one tap away.
    label = `Looks like you're in ${stateName}`;
    action = 'Not right?';
    ariaLabel = 'Change your state';
  } else {
    label = `Showing ${stateName}`;
    action = 'Change';
    ariaLabel = 'Change your state';
  }

  return (
    <div className="container-legislation">
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-20 sm:static flex justify-center py-3 bg-background"
      >
        <div className="inline-flex items-center gap-2 max-w-full text-sm font-semibold text-foreground bg-card border-2 border-foreground rounded-full px-4 py-2 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{label}</span>
          <span aria-hidden="true" className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={onChangeLocation}
            aria-label={ariaLabel}
            className="font-black underline underline-offset-2 whitespace-nowrap rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationChip;
