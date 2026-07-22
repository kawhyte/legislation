import React from 'react';

interface Props {
  title: string;
  /**
   * One honest sentence answering "why am I seeing this?". Rendered behind a
   * disclosure so the cards themselves can stay minimal.
   */
  why?: string;
  children: React.ReactNode;
}

/**
 * A labelled band of the feed. The disclosure sits on the heading's own row on
 * purpose: an always-visible line of explanatory text under every heading would
 * push the first card down and cost more than it explains.
 */
const FeedSection: React.FC<Props> = ({ title, why, children }) => (
  <section>
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-4 border-foreground pb-4 mb-8">
      <h2 className="text-4xl font-black text-foreground">{title}</h2>
      {why && (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer list-none font-semibold underline underline-offset-2 rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
            why these? ›
          </summary>
          <p className="mt-2 max-w-prose font-normal">{why}</p>
        </details>
      )}
    </div>
    {children}
  </section>
);

export default FeedSection;
