import { useEffect, useState } from "react";
import StateSelector, { type States } from "./JurisdictionSelector";
import TopicSelector from "./TopicSelector";
import { Button } from "./ui/button";

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
			<div className='w-full flex flex-col gap-8 border border-border bg-card px-6 md:px-8 py-8 md:py-10 rounded-2xl shadow-lg hover:shadow-xl hover:border-primary/20 transition-all'>
				{/* Enhanced Text Block */}
				<div className='text-center space-y-4'>
					<h3 className='text-xl md:text-2xl font-bold text-foreground'>
						 Search Bills from Any State
					</h3>
					<p className='text-lg md:text-xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
						Select your state and a topic to see a real-time feed of relevant bills.
					</p>
					<div className="bg-accent border border-border rounded-lg p-4 max-w-2xl mx-auto">
						<p className="text-sm text-accent-foreground">
							✨ <strong>Quick start:</strong> Choose any state + "All Topics" for maximum results!
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
							className='w-full py-4 text-lg font-semibold bg-primary hover:bg-primary-hover text-primary-foreground shadow-md hover:shadow-lg transition-all'>
							Search Bills
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SimpleHero;