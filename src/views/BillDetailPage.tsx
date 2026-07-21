'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, User, Calendar, Link as LinkIcon } from 'lucide-react';
import type { Bill } from '@/types';
import { useBillSummary } from '@/hooks/useBillSummary';
import { toSentenceCase } from '@/lib/utils';
import MomentumBadge from '@/components/MomentumBadge';
import BillProgressStepper from '@/components/BillProgressStepper';
import BookmarkButton from '@/components/BookmarkButton';
import AIAnalysisContent from '@/components/AIAnalysisContent';
import { Button } from '@/components/ui/button';
import { recordBillView } from '@/services/userService';

interface Props {
  bill: Bill;
}

export default function BillDetailPage({ bill }: Props) {
  const { structured, isLoading, error, generateSummary, cleanup } = useBillSummary(bill, {
    maxLength: 150,
    targetAge: '30-40',
  });

  useEffect(() => {
    return () => { if (cleanup) cleanup(); };
  }, [cleanup, bill.id]);

  // Record a view for the trending-engagement aggregate, once per browser session
  // per bill (best-effort — never blocks or breaks the page).
  useEffect(() => {
    if (!bill.id) return;
    const key = `billViewed:${bill.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage unavailable (private mode) — still record the view */
    }
    void recordBillView(bill.id, { title: bill.title, jurisdictionName: bill.jurisdiction?.name });
  }, [bill.id, bill.title, bill.jurisdiction?.name]);

  const primarySponsor = bill.sponsorships?.find(s => s.primary);
  const sortedActions = bill.actions
    ? [...bill.actions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  return (
    <div className="container-legislation py-12 max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="font-mono text-sm font-semibold text-muted-foreground">{bill.identifier}</span>
          <h1 className="text-3xl font-black text-foreground leading-tight mt-1">
            {toSentenceCase(bill.title)}
          </h1>
        </div>
        <BookmarkButton bill={bill} />
      </div>

      <div className="flex gap-2 items-center flex-wrap mb-6">
        {bill.momentum && <MomentumBadge momentum={bill.momentum} />}
        {bill.subject?.slice(0, 3).map(subject => (
          <span key={subject} className="text-xs font-semibold bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">
            {subject}
          </span>
        ))}
      </div>

      {primarySponsor?.person?.name && (
        <div className="flex items-center gap-1.5 mb-4 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Sponsored by <span className="font-semibold text-foreground">{primarySponsor.person.name}</span>
          </span>
        </div>
      )}

      <BillProgressStepper bill={bill} />

      {sortedActions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-3">Timeline</h2>
          <ul className="space-y-3 border-l-2 border-border pl-4">
            {sortedActions.map(action => (
              <li key={action.id}>
                <p className="text-sm text-foreground">{action.description}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(action.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 border-2 border-foreground rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-muted-foreground">Powered by AI — what actually matters</span>
        </div>
        {!structured && !isLoading && !error && (
          <Button onClick={generateSummary} className="w-full border-2 border-foreground bg-primary text-primary-foreground font-semibold" size="sm">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Translate to Plain English
          </Button>
        )}
        <AIAnalysisContent isLoading={isLoading} error={error} structured={structured} onRetry={generateSummary} />
      </div>

      {bill.sources && bill.sources.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-3">Official Sources</h2>
          <ul className="space-y-2">
            {bill.sources.filter(s => s.note !== 'API Details').map((source, i) => (
              <li key={i}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {source.note || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
