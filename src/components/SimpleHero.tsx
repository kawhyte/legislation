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
			{/* Simplified selector card that fills the dashboard */}
			<div className='w-full mb-6 flex flex-col gap-6 border border-border bg-card px-4 md:px-6 py-6 md:py-8 rounded-2xl shadow-lg'>
				{/* Text Block */}
				<div className='text-center'>
					<p className='text-lg md:text-xl font-medium text-foreground'>
						Select your state and a topic to see a real-time feed of
						relevant bills.
					</p>
				</div>

				{/* Selector Wrapper */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end'>
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
							className='w-full'>
							Search Bills
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SimpleHero;