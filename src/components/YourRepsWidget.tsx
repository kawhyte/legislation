import { User } from "lucide-react";
import useReps, { type Rep } from "../hooks/useReps";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface Props {
	coords?: { lat: number; lng: number };
}

function partyBadgeClass(party: string) {
	const p = party.toLowerCase();
	if (p.includes("democrat")) return "bg-blue-100 text-blue-800 border-2 border-blue-900";
	if (p.includes("republican")) return "bg-red-100 text-red-800 border-2 border-red-900";
	return "bg-muted text-muted-foreground border-2 border-border";
}

function RepCard({ rep }: { rep: Rep }) {
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
			<Button variant="outline" size="sm" className="w-full mt-3 border-2 border-foreground font-semibold text-xs">
				View Record
			</Button>
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

const YourRepsWidget: React.FC<Props> = ({ coords }) => {
	const { data: reps, isLoading, error } = useReps(coords);

	return (
		<div>
			<h3 className="text-lg font-black text-foreground mb-4 border-b-2 border-foreground pb-2">
				Your Representatives
			</h3>

			{!coords && (
				<div className="border-2 border-dashed border-foreground/40 rounded-xl p-5 text-center">
					<p className="font-bold text-sm text-foreground">Viewing State Bills</p>
					<p className="text-xs text-muted-foreground mt-1 leading-relaxed">
						Search your Zip Code to see how your specific lawmakers vote.
					</p>
				</div>
			)}

			{coords && isLoading && <LoadingSkeleton />}

			{coords && !isLoading && reps && reps.length > 0 && (
				reps.map(rep => <RepCard key={rep.id} rep={rep} />)
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
	);
};

export default YourRepsWidget;
