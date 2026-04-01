import { Link, useLocation, useParams } from "react-router-dom";
import { User } from "lucide-react";
import type { Rep } from "../hooks/useReps";
import useRepVotes from "../hooks/useRepVotes";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

const JUNK = /adjourn|journal|commend|resolution|congratulat/i;

function partyBadgeClass(party: string) {
	const p = party.toLowerCase();
	if (p.includes("democrat")) return "bg-blue-100 text-blue-800 border-2 border-blue-900";
	if (p.includes("republican")) return "bg-red-100 text-red-800 border-2 border-red-900";
	return "bg-muted text-muted-foreground border-2 border-border";
}

function stanceBadgeClass(option: string) {
	if (option === "yes") return "bg-green-300 text-green-900";
	if (option === "no") return "bg-red-300 text-red-900";
	return "bg-gray-200 text-gray-700";
}

const RepScorecardPage = () => {
	const { repId } = useParams<{ repId: string }>();
	const decodedId = decodeURIComponent(repId || "");
	const location = useLocation();
	const rep = (location.state as { rep?: Rep } | null)?.rep;

	const { votes: data, stats, isLoading, error } = useRepVotes(decodedId);

	if (!rep) {
		return (
			<div className="container-legislation py-12">
				<p className="text-muted-foreground">Representative data not found.</p>
				<Link to="/" className="text-primary underline text-sm mt-2 inline-block">← Back to home</Link>
			</div>
		);
	}

	if (isLoading) return <div className="container-legislation py-12 text-muted-foreground">Loading voting records…</div>;
	if (error) return <div className="container-legislation py-12 text-destructive">Error loading votes: {error}</div>;

	const initials = rep.name.split(" ").map(n => n[0]).slice(0, 2).join("");
	const total = stats?.totalVotes || 0;
	const yesPct = total ? Math.round((stats!.yesVotes / total) * 100) : 0;
	const noPct  = total ? Math.round((stats!.noVotes  / total) * 100) : 0;

	const majorVotes = data
		.filter(v => {
			const text = v.motion_text || v.bill?.title || "";
			return text && !JUNK.test(text);
		})
		.slice(0, 5);

	return (
		<div className="container-legislation py-12">

			{/* ── Header ── */}
			<Link to="/" className="text-sm text-muted-foreground hover:underline mb-6 inline-block">← Back</Link>
			<div className="flex items-center gap-6">
				<Avatar className="size-20 border-2 border-foreground shrink-0">
					<AvatarImage src={rep.image ?? undefined} alt={rep.name} />
					<AvatarFallback className="bg-muted text-foreground font-bold text-xl">
						{initials || <User className="size-8" />}
					</AvatarFallback>
				</Avatar>
				<div>
					<h1 className="text-4xl font-black text-foreground leading-tight">{rep.name}</h1>
					{rep.current_role && (
						<p className="text-muted-foreground text-sm mt-0.5">
							{rep.current_role.title}{rep.current_role.district ? ` · District ${rep.current_role.district}` : ""}
						</p>
					)}
					<span className={`inline-block mt-2 text-xs font-semibold rounded-full px-3 py-1 ${partyBadgeClass(rep.party)}`}>
						{rep.party}
					</span>
				</div>
			</div>

			{/* ── Stats Grid ── */}
			<div className="grid grid-cols-3 gap-4 mt-8">
				{[
					{ label: "Attendance", value: stats ? String(total) : "—" },
					{ label: "Voted YES", value: stats ? `${yesPct}%` : "—" },
					{ label: "Voted NO",  value: stats ? `${noPct}%`  : "—" },
				].map(({ label, value }) => (
					<div key={label} className="border-2 border-black shadow-[4px_4px_0px_0px_#000] p-6 rounded-xl bg-white text-center">
						<p className="text-4xl font-black text-foreground">{value}</p>
						<p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
					</div>
				))}
			</div>

			{/* ── Top 5 Major Votes ── */}
			<h2 className="text-2xl font-black text-foreground mt-10 mb-4">Recent Major Votes</h2>
			{majorVotes.length === 0 && (
				<p className="text-sm text-muted-foreground">No major votes found in the latest records.</p>
			)}
			{majorVotes.map(v => {
				const entry = v.votes?.find(e => e.voter_id === decodedId);
				const option = entry?.option?.toLowerCase() ?? "unknown";
				const label = option === "yes" ? "YES" : option === "no" ? "NO" : "MISSED";
				const title = v.motion_text || v.bill?.title || "Untitled vote";

				return (
					<div key={v.id} className="border-2 border-black p-4 mb-4 rounded-xl flex items-center gap-4 bg-white">
						<span className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-lg ${stanceBadgeClass(option)}`}>
							{label}
						</span>
						<p className="font-bold text-sm text-foreground leading-snug">{title}</p>
					</div>
				);
			})}

		</div>
	);
};

export default RepScorecardPage;
