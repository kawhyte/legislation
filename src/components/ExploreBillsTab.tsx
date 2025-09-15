import React, { useState, useRef } from "react";
import { type States } from "./JurisdictionSelector";
import SimpleHero from "./SimpleHero";
import BillGrid from "./BillGrid";

const ExploreBillsTab: React.FC = () => {
	const [selectedJurisdiction, setSelectedJurisdiction] = useState<States | null>(null);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	const handleStateSelect = (state: States | null) => {
		setSelectedJurisdiction(state);
		// Only scroll if a state is selected (not for nationwide view on initial load)
		if (state && resultsRef.current) {
			setTimeout(() => {
				// Timeout ensures the section is rendered before we scroll
				resultsRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		}
	};

	return (
		<div className="space-y-12">
			{/* Header */}
			<div className='space-y-4'>
				<h2 className='text-2xl sm:text-3xl font-bold text-foreground'>
					Explore Bills Nationwide
				</h2>
				<p className='text-lg text-muted-foreground'>
					Discover legislation from all 50 states. Search by state and topic to find bills that matter to you.
				</p>
			</div>

			{/* Friendly Getting Started Guide */}
			<div className="bg-accent border-l-4 border-primary p-6 rounded-r-lg hover:bg-accent/80 transition-all">
				<div className="space-y-3">
					<h3 className="text-lg font-semibold text-foreground">
						New here? Here's how to get started:
					</h3>
					<div className="space-y-2 text-muted-foreground">
						<p className="flex items-start gap-2">
							<span className="font-medium text-foreground">1.</span>
							<span>Choose any state you're curious about (not just your home state!)</span>
						</p>
						<p className="flex items-start gap-2">
							<span className="font-medium text-foreground">2.</span>
							<span>Select "All Topics" for the broadest results, or pick a specific area of interest</span>
						</p>
						<p className="flex items-start gap-2">
							<span className="font-medium text-foreground">3.</span>
							<span>Click "Search Bills" to see real-time legislation from that state</span>
						</p>
					</div>
					<div className="mt-4 p-3 bg-wellness-yellow/20 border border-wellness-yellow/30 rounded-lg">
						<p className="text-sm text-foreground">
							💡 <strong>Pro tip:</strong> Start with "All Topics" to see the most results, then narrow down by topic if you want to focus on specific areas like healthcare, education, or housing.
						</p>
					</div>
				</div>
			</div>

			{/* Simple Hero Search */}
			<div>
				<SimpleHero
					selectedJurisdiction={selectedJurisdiction}
					setSelectedJurisdiction={handleStateSelect}
					selectedTopic={selectedTopic}
					setSelectedTopic={setSelectedTopic}
				/>
			</div>

			{/* Results */}
			<div ref={resultsRef}>
				{(selectedJurisdiction || (!selectedJurisdiction && !selectedTopic)) && (
					<BillGrid
						selectedJurisdiction={selectedJurisdiction}
						selectedTopic={selectedTopic}
					/>
				)}
			</div>
		</div>
	);
};

export default ExploreBillsTab;