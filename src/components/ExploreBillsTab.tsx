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
		<div>
			{/* Header */}
			<div className='mb-8'>
				<h2 className='text-2xl font-bold text-foreground mb-2'>
					Explore Bills
				</h2>
				<p className='text-muted-foreground'>
					Search for bills by state and topic to discover legislation that matters to you
				</p>
			</div>

			{/* Simple Hero Search */}
			<div className="mb-8">
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