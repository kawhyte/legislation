import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillViewMode } from "@/types";

interface BillCardSkeletonProps {
	/** Mirror BillCard's `showSource` so the skeleton reserves the footer row too. */
	showSource?: boolean;
	/** Must match the BillCard variant it stands in for — the two shapes differ by ~125px. */
	viewMode?: BillViewMode;
}

/**
 * Mirrors BillCard's real structure row for row (flag + identifier, title,
 * momentum badge, sponsor, topic chips, progress stepper, CTA) so the grid
 * doesn't jump when skeletons swap for cards. The stepper block in particular
 * is ~125px tall in the real card — a thin bar here would cost ~200px of shift.
 */
const BillCardSkeleton = ({ showSource = true, viewMode = "detailed" }: BillCardSkeletonProps) => {
	// The feed card drops the stepper, the sponsor line and the footer, and gains
	// a wallet-impact line under the hook. Mirroring that exactly is what keeps
	// the layout-shift e2e assertion (±24px) passing for both variants.
	if (viewMode === "feed") {
		return (
			<Card className='bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex flex-col h-full'>
				<CardHeader className='p-4 space-y-3'>
					{/* TOP ROW: flag + bill ID + bookmark */}
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Skeleton className='w-7 h-7 rounded-md' />
							<Skeleton className='h-3 w-14' />
						</div>
						<Skeleton className='h-8 w-8 rounded-lg' />
					</div>

					{/* HOOK (two lines) + wallet-impact line */}
					<div>
						<div className='space-y-2'>
							<Skeleton className='h-[18px] w-full' />
							<Skeleton className='h-[18px] w-4/5' />
						</div>
						<div className='mt-1 min-h-[2.5rem]'>
							<Skeleton className='h-4 w-3/4' />
						</div>
					</div>

					{/* STATUS PILL */}
					<Skeleton className='h-7 w-28 rounded-full' />
				</CardHeader>

				<CardContent className='flex-grow flex flex-col justify-end space-y-3 p-4 pt-0'>
					{/* No topic-chip row — see the note in the detailed skeleton below. */}
					{/* CTA */}
					<Skeleton className='h-9 w-full rounded-md' />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex flex-col h-full'>
			<CardHeader className='p-4 space-y-3'>
				{/* TOP ROW: flag + bill ID + bookmark */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Skeleton className='w-7 h-7 rounded-md' />
						<Skeleton className='h-3 w-14' />
					</div>
					<Skeleton className='h-8 w-8 rounded-lg' />
				</div>

				{/* BILL TITLE (two lines) */}
				<div className='space-y-2'>
					<Skeleton className='h-[18px] w-full' />
					<Skeleton className='h-[18px] w-4/5' />
				</div>

				{/* MOMENTUM BADGE */}
				<Skeleton className='h-7 w-32 rounded-full' />
			</CardHeader>

			<CardContent className='flex-grow flex flex-col justify-end space-y-3 p-4 pt-0'>
				{/* SPONSOR LINE */}
				<Skeleton className='h-4 w-2/3' />

				{/* No topic-chip row: roughly half of bills come back with no subjects,
				    so reserving that space costs more shift than it saves. */}

				{/* PROGRESS STEPPER — same bordered box, dots, labels and status note */}
				<div className='border-2 border-foreground rounded-xl p-3'>
					<div className='flex justify-between'>
						{[0, 1, 2, 3].map((stage) => (
							<div key={stage} className='flex flex-col items-center gap-1.5'>
								<Skeleton className='w-6 h-6 rounded-full' />
								<Skeleton className='h-[11px] w-12' />
								<Skeleton className='h-[10px] w-10' />
							</div>
						))}
					</div>
					<div className='mt-3 pt-2 border-t border-border flex items-center gap-2'>
						<Skeleton className='w-2 h-2 rounded-full' />
						<Skeleton className='h-[11px] w-1/2' />
					</div>
				</div>

				{/* CTA */}
				<Skeleton className='h-9 w-full rounded-md' />
			</CardContent>

			{showSource && (
				<CardFooter className='p-4 pt-3 flex items-center justify-between gap-2 border-t border-foreground/20'>
					<Skeleton className='h-6 w-28 rounded-md' />
					<Skeleton className='h-6 w-24 rounded-md' />
				</CardFooter>
			)}
		</Card>
	);
};

export default BillCardSkeleton;
