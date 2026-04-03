import React, { useState, useRef } from "react";
import { type States } from "./JurisdictionSelector";
import JurisdictionSelector from "./JurisdictionSelector";
import TopicSelector from "./TopicSelector";
import BillGrid from "./BillGrid";
import YourRepsWidget from "./YourRepsWidget";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { parseLocationInput } from "../utils/zipToJurisdiction";
import { MapPin, Search } from "lucide-react";

const ExploreBillsTab: React.FC = () => {
	// Shared results state
	const [selectedJurisdiction, setSelectedJurisdiction] = useState<States | null>(null);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

	// Zip search state
	const [zipQuery, setZipQuery] = useState("");
	const [isZipSearching, setIsZipSearching] = useState(false);
	const [zipError, setZipError] = useState("");

	// State+topic search state (local, only committed on "Search Bills")
	const [localJurisdiction, setLocalJurisdiction] = useState<States | null>(null);
	const [localTopic, setLocalTopic] = useState<string | null>(null);

	const resultsRef = useRef<HTMLDivElement>(null);

	const scrollToResults = () => {
		setTimeout(() => {
			resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 100);
	};

	// Zip submit: parse zip → set jurisdiction (with zipCoords), clear state+topic inputs
	const handleZipSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!zipQuery.trim()) return;
		setIsZipSearching(true);
		setZipError("");
		try {
			const jurisdiction = await parseLocationInput(zipQuery.trim());
			setSelectedJurisdiction(jurisdiction);
			setSelectedTopic(null);
			setLocalJurisdiction(null);
			setLocalTopic(null);
			scrollToResults();
		} catch (err) {
			setZipError(err instanceof Error ? err.message : "Invalid zip code.");
		} finally {
			setIsZipSearching(false);
		}
	};

	// State+topic submit: commit local selections, clear zip
	const handleStateSearch = () => {
		if (!localJurisdiction) return;
		setSelectedJurisdiction(localJurisdiction);
		setSelectedTopic(localTopic);
		setZipQuery("");
		setZipError("");
		scrollToResults();
	};

	// Clear zip input if user starts picking a state
	const handleLocalJurisdictionChange = (state: States | null) => {
		setLocalJurisdiction(state);
		if (state) { setZipQuery(""); setZipError(""); }
		if (!state) setLocalTopic(null);
	};

	// Clear state picker if user starts typing a zip
	const handleZipInput = (value: string) => {
		setZipQuery(value);
		if (value) { setLocalJurisdiction(null); setLocalTopic(null); }
	};

	const hasZipResult = selectedJurisdiction?.zipCoords != null;

	return (
		<div className="space-y-10">
			{/* Header */}
			<div className="space-y-1">
				<h2 className="text-2xl sm:text-3xl font-bold text-foreground">Discover More Bills</h2>
				<p className="text-base text-muted-foreground">
					Search by zip code to see your local reps and state bills, or pick any state + topic.
				</p>
			</div>

			{/* Search card */}
			<div className="w-full border-2 border-foreground bg-card px-6 md:px-8 py-8 rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] space-y-6">

				{/* Zip search row */}
				<div className="space-y-2">
					<p className="text-sm font-semibold text-foreground">Search by zip code</p>
					<form onSubmit={handleZipSubmit} className="flex gap-3 items-stretch">
						<Input
							type="text"
							placeholder="Enter zip code…"
							value={zipQuery}
							onChange={(e) => handleZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
							className="flex-1 h-12 px-5 text-base border-2 border-foreground rounded-xl shadow-[3px_3px_0px_0px_hsl(var(--foreground))] focus-visible:shadow-none focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:ring-0 transition-all placeholder:text-muted-foreground/50"
						/>
						<Button
							type="submit"
							disabled={!zipQuery.trim() || isZipSearching}
							className="h-12 px-6 font-bold border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-40 disabled:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150 whitespace-nowrap">
							<Search className="h-4 w-4 mr-2" />
							{isZipSearching ? "Searching…" : "Find Bills"}
						</Button>
					</form>
					{zipError && (
						<p className="text-sm font-semibold text-destructive border-2 border-destructive rounded-xl px-4 py-2 inline-block">
							{zipError}
						</p>
					)}
				</div>

				{/* Divider */}
				<div className="flex items-center gap-3 text-muted-foreground/50 text-xs font-semibold uppercase tracking-widest">
					<span className="flex-1 h-px bg-border" />
					or search by state
					<span className="flex-1 h-px bg-border" />
				</div>

				{/* State + topic row */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
					<div>
						<JurisdictionSelector
							selectedJurisdiction={localJurisdiction}
							onSelectJurisdiction={handleLocalJurisdictionChange}
						/>
					</div>
					<div>
						<TopicSelector
							selectedTopic={localTopic}
							onTopicSelect={setLocalTopic}
							disabled={!localJurisdiction}
						/>
					</div>
					<Button
						onClick={handleStateSearch}
						disabled={!localJurisdiction}
						size="lg"
						className="h-12 w-full font-semibold border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-40 disabled:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150">
						Search Bills
					</Button>
				</div>
			</div>

			{/* Results */}
			<div ref={resultsRef}>
				{selectedJurisdiction ? (
					hasZipResult ? (
						/* Zip result — bills + reps sidebar */
						<div className="space-y-4">
							<p className="text-lg font-bold text-foreground">
								Bills in {selectedJurisdiction.name}
							</p>
							<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
								<div className="lg:col-span-3">
									<BillGrid
										selectedJurisdiction={selectedJurisdiction}
										selectedTopic={selectedTopic}
									/>
								</div>
								<div className="lg:col-span-1 order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
									<YourRepsWidget
										coords={selectedJurisdiction.zipCoords}
										stateName={selectedJurisdiction.name}
									/>
								</div>
							</div>
						</div>
					) : (
						/* State-only result — full width bills */
						<div className="space-y-4">
							<p className="text-lg font-bold text-foreground">
								Bills in {selectedJurisdiction.name}
								{selectedTopic ? ` · ${selectedTopic}` : ""}
							</p>
							<BillGrid
								selectedJurisdiction={selectedJurisdiction}
								selectedTopic={selectedTopic}
							/>
						</div>
					)
				) : (
					<div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
						<MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
						<p className="font-semibold text-foreground mb-1">Enter a zip code or pick a state</p>
						<p className="text-sm text-muted-foreground">
							Zip code search also shows your local representatives
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ExploreBillsTab;
