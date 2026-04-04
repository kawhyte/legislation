'use client';

import { useEffect, useState } from "react";
import StateSelector, { type States } from "./JurisdictionSelector";
import TopicSelector from "./TopicSelector";
import { Button } from "./ui/button";
import { Lightbulb } from "lucide-react";

interface SimpleHeroProps {
	setSelectedJurisdiction: (jurisdiction: States | null) => void;
	selectedJurisdiction: States | null;
	selectedTopic: string | null;
	setSelectedTopic: (topic: string | null) => void;
}

const SimpleHero = ({
	setSelectedJurisdiction,
	selectedJurisdiction,
	selectedTopic,
	setSelectedTopic,
}: SimpleHeroProps) => {
	const [localJurisdiction, setLocalJurisdiction] = useState<States | null>(
		selectedJurisdiction
	);
	const [localTopic, setLocalTopic] = useState<string | null>(selectedTopic);

	useEffect(() => {
		if (!localJurisdiction) {
			setLocalTopic(null);
		}
	}, [localJurisdiction]);

	const handleSearch = () => {
		setSelectedJurisdiction(localJurisdiction);
		setSelectedTopic(localTopic);
	};

	return (
		<div className="w-full">
			{/* Enhanced selector card with better CTA */}
			<div className='w-full flex flex-col gap-8 border-2 border-foreground bg-card px-6 md:px-8 py-8 md:py-10 rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))]'>
				{/* Enhanced Text Block */}
				<div className='text-center space-y-4'>
					<h3 className='text-xl md:text-2xl font-bold text-foreground'>
						 Search Bills from Any State
					</h3>
					<p className='text-lg md:text-xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
						Select your state and a topic to see a real-time feed of relevant bills.
					</p>
					<div className="bg-accent border border-border rounded-lg p-4 max-w-2xl mx-auto flex items-center gap-2">
						<Lightbulb className="h-4 w-4 text-foreground flex-shrink-0" />
						<p className="text-sm text-accent-foreground">
							<strong>Quick start:</strong> Choose any state + "All Topics" for maximum results!
						</p>
					</div>
				</div>

				{/* Selector Wrapper */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end'>
					<div className='md:col-span-1 lg:col-span-1'>
						<StateSelector
							selectedJurisdiction={localJurisdiction}
							onSelectJurisdiction={setLocalJurisdiction}
						/>
					</div>
					<div className='md:col-span-1 lg:col-span-1'>
						<TopicSelector
							selectedTopic={localTopic}
							onTopicSelect={setLocalTopic}
							disabled={!localJurisdiction}
						/>
					</div>
					<div className='md:col-span-2 lg:col-span-1'>
						<Button
							onClick={handleSearch}
							size='lg'
							className='w-full py-4 text-lg font-semibold border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150'>
							Search Bills
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SimpleHero;