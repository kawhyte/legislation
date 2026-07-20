export function partyBadgeClass(party: string): string {
  const p = party.toLowerCase();
  if (p.includes('democrat')) return 'bg-info/10 text-info border-2 border-info';
  if (p.includes('republican')) return 'bg-destructive/10 text-destructive border-2 border-destructive';
  return 'bg-muted text-muted-foreground border-2 border-border';
}
