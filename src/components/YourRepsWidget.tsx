'use client';

import { useEffect } from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import useReps, { type Rep } from "../hooks/useReps";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useSearchCache } from "../contexts/SearchCacheContext";

interface Props {
	coords?: { lat: number; lng: number };
	stateName?: string;
	/** When provided, skip the API call and render directly from cache. */
	cachedReps?: Rep[];
	/** 'horizontal' forces the compact horizontal strip on all screen sizes. Default 'auto' uses mobile strip + desktop sidebar. */
	layout?: 'horizontal' | 'auto';
}

function partyBadgeClass(party: string) {
	const p = party.toLowerCase();
	if (p.includes("democrat")) return "bg-blue-100 text-blue-800 border-2 border-blue-900";
	if (p.includes("republican")) return "bg-red-100 text-red-800 border-2 border-red-900";
	return "bg-muted text-muted-foreground border-2 border-border";
}

function partyAbbr(party: string) {
	const p = party.toLowerCase();
	if (p.includes("democrat")) return "Dem";
	if (p.includes("republican")) return "Rep";
	return party.slice(0, 4);
}

// ── Desktop: full vertical card ──────────────────────────────────────────────

function RepCard({ rep, stateName }: { rep: Rep; stateName?: string }) {
	const role = rep.current_role;
	const initials = rep.name.split(" ").map(n => n[0]).slice(0, 2).join("");

	return (
		<div className="border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] rounded-xl p-4 mb-4 bg-white">
			<div className="flex items-start gap-3">
				<Avatar className="size-12 border-2 border-foreground shrink-0">
					<AvatarImage src={rep.image ?? undefined} alt={rep.name} />
					<AvatarFallback className="bg-muted text-foreground font-bold text-sm">
						{initials || <User className="size-5" />}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="font-bold text-sm text-foreground leading-tight truncate">{rep.name}</p>
					{role && (
						<p className="text-xs text-muted-foreground mt-0.5 truncate">
							{role.title}{role.district ? ` · District ${role.district}` : ""}
						</p>
					)}
					<span className={`inline-block mt-1.5 text-xs font-semibold rounded-full px-2 py-0.5 ${partyBadgeClass(rep.party)}`}>
						{rep.party}
					</span>
				</div>
			</div>
			<Link to={`/rep/${encodeURIComponent(rep.id)}`} state={{ rep, stateName }}>
				<Button variant="outline" size="sm" className="w-full mt-3 border-2 border-foreground font-semibold text-xs">
					See Their Votes
				</Button>
			</Link>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<>
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="border-2 border-border rounded-xl p-4 mb-4">
					<div className="flex items-start gap-3">
						<Skeleton className="size-12 rounded-full shrink-0" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
							<Skeleton className="h-5 w-20 rounded-full" />
						</div>
					</div>
					<Skeleton className="h-8 w-full mt-3 rounded-lg" />
				</div>
			))}
		</>
	);
}

// ── Mobile: compact horizontal card ─────────────────────────────────────────

function RepCardMobile({ rep, stateName }: { rep: Rep; stateName?: string }) {
	const role = rep.current_role;
	const initials = rep.name.split(" ").map(n => n[0]).slice(0, 2).join("");

	return (
		<Link
			to={`/rep/${encodeURIComponent(rep.id)}`}
			state={{ rep, stateName }}
			className="flex-shrink-0 w-24 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-white hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
		>
			<Avatar className="size-10 border-2 border-foreground shrink-0">
				<AvatarImage src={rep.image ?? undefined} alt={rep.name} />
				<AvatarFallback className="bg-muted text-foreground font-bold text-xs">
					{initials || <User className="size-4" />}
				</AvatarFallback>
			</Avatar>
			<p className="text-xs font-bold text-foreground text-center leading-tight line-clamp-2 w-full">
				{rep.name}
			</p>
			{role && (
				<p className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">
					{role.title}
				</p>
			)}
			<span className={`text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none ${partyBadgeClass(rep.party)}`}>
				{partyAbbr(rep.party)}
			</span>
		</Link>
	);
}

function LoadingSkeletonMobile() {
	return (
		<div className="flex gap-3 overflow-x-auto pb-2">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="flex-shrink-0 w-24 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 border-border">
					<Skeleton className="size-10 rounded-full" />
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-2.5 w-12" />
					<Skeleton className="h-4 w-10 rounded-full" />
				</div>
			))}
		</div>
	);
}

// ── Main widget ──────────────────────────────────────────────────────────────

const YourRepsWidget: React.FC<Props> = ({ coords, stateName, cachedReps, layout = 'auto' }) => {
	const { setReps } = useSearchCache();

	// Only hit the API when we don't already have cached reps
	const { data: fetchedReps, isLoading: fetchLoading, error } = useReps(
		cachedReps ? undefined : coords,
	);

	// Write freshly fetched reps into cache
	useEffect(() => {
		if (fetchedReps && fetchedReps.length > 0) setReps(fetchedReps);
	}, [fetchedReps, setReps]);

	const reps = cachedReps ?? fetchedReps;
	const isLoading = cachedReps ? false : fetchLoading;

	const noCoords = (
		<div className="border-2 border-dashed border-foreground/40 rounded-xl p-4 text-center">
			<p className="font-bold text-sm text-foreground">Want to see how your reps vote?</p>
			<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
				Add your zip code to see who represents you and how they vote on these bills.
			</p>
		</div>
	);

	// Forced horizontal layout (e.g. inside State tab — no sidebar)
	if (layout === 'horizontal') {
		return (
			<div>
				{!coords && (
					<div className="border-2 border-dashed border-foreground/40 rounded-xl p-4 text-center">
						<p className="font-bold text-sm text-foreground">Want to see how your reps vote?</p>
						<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
							Add your zip code to see who represents you and how they vote on these bills.
						</p>
					</div>
				)}
				{coords && isLoading && <LoadingSkeletonMobile />}
				{coords && !isLoading && reps && reps.length > 0 && (
					<div className="flex gap-3 overflow-x-auto pb-2">
						{reps.map(rep => (
							<RepCardMobile key={rep.id} rep={rep} stateName={stateName} />
						))}
					</div>
				)}
				{coords && !isLoading && reps && reps.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-3">
						No representatives found for this location.
					</p>
				)}
				{coords && !isLoading && error && (
					<p className="text-xs text-destructive border border-destructive rounded-lg px-3 py-2">
						{error}
					</p>
				)}
			</div>
		);
	}

	return (
		<>
			{/* Mobile layout — horizontal scrollable strip */}
			<div className="lg:hidden">
				<h3 className="text-base font-black text-foreground mb-3 border-b-2 border-foreground pb-2">
					Your Representatives
				</h3>

				{!coords && noCoords}

				{coords && isLoading && <LoadingSkeletonMobile />}

				{coords && !isLoading && reps && reps.length > 0 && (
					<div className="flex gap-3 overflow-x-auto pb-2">
						{reps.map(rep => (
							<RepCardMobile key={rep.id} rep={rep} stateName={stateName} />
						))}
					</div>
				)}

				{coords && !isLoading && reps && reps.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-3">
						No representatives found for this location.
					</p>
				)}

				{coords && !isLoading && error && (
					<p className="text-xs text-destructive border border-destructive rounded-lg px-3 py-2">
						{error}
					</p>
				)}
			</div>

			{/* Desktop layout — sticky sidebar with full vertical cards */}
			<div className="hidden lg:block">
				<h3 className="text-lg font-black text-foreground mb-4 border-b-2 border-foreground pb-2">
					Your Representatives
				</h3>

				{!coords && (
					<div className="border-2 border-dashed border-foreground/40 rounded-xl p-5 text-center">
						<p className="font-bold text-sm text-foreground">Want to see how your reps vote?</p>
						<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
							Add your zip code to see who represents you and how they vote on these bills.
						</p>
					</div>
				)}

				{coords && isLoading && <LoadingSkeleton />}

				{coords && !isLoading && reps && reps.length > 0 && (
					reps.map(rep => <RepCard key={rep.id} rep={rep} stateName={stateName} />)
				)}

				{coords && !isLoading && reps && reps.length === 0 && (
					<p className="text-sm text-muted-foreground text-center py-4">
						No representatives found for this location.
					</p>
				)}

				{coords && !isLoading && error && (
					<p className="text-xs text-destructive border border-destructive rounded-lg px-3 py-2">
						{error}
					</p>
				)}
			</div>
		</>
	);
};

export default YourRepsWidget;
