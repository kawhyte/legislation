import { Link, useLocation, useParams } from "react-router-dom";
import { User, CheckCircle2, XCircle, CalendarDays, UserRound } from "lucide-react";
import type { Rep } from "../hooks/useReps";
import useRepVotes, { type RepVote } from "../hooks/useRepVotes";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

const JUNK = /adjourn|journal|commend|resolution|congratulat|sine die/i;

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

function VoteCard({ vote, repParty }: { vote: RepVote; repParty: string }) {
	const stanceLabel = vote.option === "yes" ? "VOTED YES" : vote.option === "no" ? "VOTED NO" : "MISSED";
	const billPassed = vote.vote_result?.toLowerCase() === "pass";
	const sponsorParty = vote.primary_sponsor?.party ?? "";
	const isPartyLine = sponsorParty && repParty &&
		sponsorParty.toLowerCase().includes(repParty.toLowerCase().split(" ")[0]);
	const voteDate = vote.start_date
		? new Date(vote.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
		: null;

	return (
		<div className="border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-xl bg-white p-5 mb-5">

			{/* ── Top row: bill ID + bill passed/failed ── */}
			<div className="flex items-start justify-between gap-3 mb-2">
				<div className="flex items-center gap-2 flex-wrap">
					{vote.bill_identifier && (
						<span className="text-xs font-black bg-foreground text-background px-2 py-0.5 rounded">
							{vote.bill_identifier}
						</span>
					)}
					<span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${stanceBadgeClass(vote.option)}`}>
						{stanceLabel}
					</span>
				</div>
				{vote.vote_result && (
					<span className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border-2 ${billPassed ? "bg-green-50 text-green-800 border-green-700" : "bg-red-50 text-red-800 border-red-700"}`}>
						{billPassed
							? <><CheckCircle2 className="size-3" /> Bill Passed</>
							: <><XCircle className="size-3" /> Bill Failed</>}
					</span>
				)}
			</div>

			{/* ── Bill title ── */}
			<p className="font-black text-base text-foreground leading-snug mb-3">
				{vote.bill_title}
			</p>

			{/* ── Meta row ── */}
			<div className="space-y-1.5 text-xs text-muted-foreground">

				{/* Sponsor + party alignment */}
				{vote.primary_sponsor && (
					<div className="flex items-center gap-1.5 flex-wrap">
						<UserRound className="size-3.5 shrink-0" />
						<span>Sponsored by <span className="font-semibold text-foreground">{vote.primary_sponsor.name}</span></span>
						{vote.primary_sponsor.party && (
							<span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${partyBadgeClass(vote.primary_sponsor.party)}`}>
								{vote.primary_sponsor.party}
							</span>
						)}
						{sponsorParty && repParty && (
							<span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPartyLine ? "bg-yellow-100 text-yellow-800 border border-yellow-700" : "bg-purple-100 text-purple-800 border border-purple-700"}`}>
								{isPartyLine ? "Party-Line Vote" : "Cross-Party Vote"}
							</span>
						)}
					</div>
				)}

				{/* Latest bill status */}
				<div className="flex items-start gap-1.5">
					<span className="shrink-0 font-semibold text-foreground">Status:</span>
					<span className="leading-tight">{vote.bill_status}</span>
				</div>

				{/* Motion + date */}
				<div className="flex items-center gap-1.5 flex-wrap">
					<span className="font-semibold text-foreground">Motion:</span>
					<span>{vote.motion_text}</span>
					{voteDate && (
						<>
							<span className="text-border">·</span>
							<CalendarDays className="size-3 shrink-0" />
							<span>{voteDate}</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

const RepScorecardPage = () => {
	const { repId } = useParams<{ repId: string }>();
	const decodedId = decodeURIComponent(repId || "");
	const location = useLocation();
	const rep = (location.state as { rep?: Rep } | null)?.rep;

	const isFederal = rep?.jurisdiction?.classification === "country";
	const jurisdictionName = isFederal ? undefined : rep?.jurisdiction?.name;

	const { votes: data, stats, isLoading, error } = useRepVotes(decodedId, jurisdictionName);

	if (!rep) {
		return (
			<div className="container-legislation py-12">
				<p className="text-muted-foreground">Representative data not found.</p>
				<Link to="/" className="text-primary underline text-sm mt-2 inline-block">← Back to home</Link>
			</div>
		);
	}

	const initials = rep.name.split(" ").map(n => n[0]).slice(0, 2).join("");

	// Party-line rate: votes where sponsor shares rep's party
	const partyLineCount = data.filter(v => {
		const sp = v.primary_sponsor?.party?.toLowerCase() ?? "";
		const rp = rep.party.toLowerCase().split(" ")[0];
		return sp && rp && sp.includes(rp);
	}).length;
	const partyLinePct = data.length ? Math.round((partyLineCount / data.length) * 100) : 0;

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
							{rep.current_role.title}
							{rep.current_role.district ? ` · District ${rep.current_role.district}` : ""}
							{rep.jurisdiction && ` · ${rep.jurisdiction.name}`}
						</p>
					)}
					<span className={`inline-block mt-2 text-xs font-semibold rounded-full px-3 py-1 ${partyBadgeClass(rep.party)}`}>
						{rep.party}
					</span>
				</div>
			</div>

			{/* ── Federal notice ── */}
			{isFederal && (
				<div className="mt-8 border-2 border-dashed border-foreground/40 rounded-xl p-6 text-center">
					<p className="font-bold text-foreground">Federal Legislator</p>
					<p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
						{rep.name} serves in the US {rep.current_role?.org_classification === "upper" ? "Senate" : "House of Representatives"}.
						This app tracks state-level legislation only — federal voting records are not available here.
					</p>
				</div>
			)}

			{/* ── State legislator content ── */}
			{!isFederal && (
				<>
					{isLoading && <p className="mt-8 text-muted-foreground">Loading voting records…</p>}
					{error && <p className="mt-8 text-destructive text-sm">Error: {error}</p>}

					{!isLoading && !error && (
						<>
							{/* Stats Grid */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
								{[
									{ label: "Votes Tracked",  value: String(stats?.totalVotes ?? 0) },
									{ label: "Voted YES",      value: stats?.totalVotes ? `${Math.round((stats.yesVotes / stats.totalVotes) * 100)}%` : "—" },
									{ label: "Voted NO",       value: stats?.totalVotes ? `${Math.round((stats.noVotes  / stats.totalVotes) * 100)}%` : "—" },
									{ label: "Party-Line",     value: data.length ? `${partyLinePct}%` : "—" },
								].map(({ label, value }) => (
									<div key={label} className="border-2 border-black shadow-[4px_4px_0px_0px_#000] p-5 rounded-xl bg-white text-center">
										<p className="text-4xl font-black text-foreground">{value}</p>
										<p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
									</div>
								))}
							</div>

							{/* Vote Feed */}
							<h2 className="text-2xl font-black text-foreground mt-10 mb-1">Recent Major Votes</h2>
							<p className="text-xs text-muted-foreground mb-5">
								Showing votes from the 20 most recently active {jurisdictionName} bills. Each card shows the bill, who sponsored it, whether it passed, and how {rep.name.split(" ")[0]} voted.
							</p>

							{(() => {
								const majorVotes = data
									.filter(v => !JUNK.test(v.motion_text || v.bill_title || ""))
									.slice(0, 8);

								if (majorVotes.length === 0) {
									return <p className="text-sm text-muted-foreground">No major votes found in the most recent {jurisdictionName} bills.</p>;
								}

								return majorVotes.map(v => (
									<VoteCard key={v.id} vote={v} repParty={rep.party} />
								));
							})()}
						</>
					)}
				</>
			)}

		</div>
	);
};

export default RepScorecardPage;
