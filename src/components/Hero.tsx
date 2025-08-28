import React, { Suspense } from "react";
import StateSelector, { type States } from "./JurisdictionSelector";
import TopicSelector from "./TopicSelector"; // Import TopicSelector
import animationData from "../assets/friends.json";

const Lottie = React.lazy(() => import('lottie-react'));

interface HeroSectionProps {
	setSelectedJurisdiction: (jurisdiction: States | null) => void;
	selectedTopic: string | null;
	setSelectedTopic: (topic: string | null) => void;
}

const HeroSection = ({ setSelectedJurisdiction, selectedTopic, setSelectedTopic }: HeroSectionProps) => {

	return (
		<div className='relative bg-slate-50 overflow-hidden'>
			{/* Main content */}
			<div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center'>
				<div className='max-w-8xl mx-auto'>
					{/* Main heading */}

					<div className='grid md:grid-cols-2 gap-8 items-center'>
						<div className='text-center md:text-left'>
							<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4'>
								Understand Legislation That Matters
							</h1>

							{/* Sub-heading */}
							<p className='max-w-2xl md:mx-0 mx-auto text-lg text-muted-foreground mb-10'>
								Decode complex state legislation with AI-powered summaries,
								real-time bill tracking, and clear explanations.
							</p>

							<div className='max-w-4xl mx-auto mb-6 flex flex-col md:flex-row gap-4'>
								<StateSelector onSelectJurisdiction={setSelectedJurisdiction} />
								<TopicSelector selectedTopic={selectedTopic} onTopicSelect={setSelectedTopic} />
							</div>
						</div>
						<div>
							<Suspense fallback={<div>Loading...</div>}>
								<Lottie
									animationData={animationData}
									loop={true}
									className='w-full max-w-xl mx-auto md:ml-auto'
								/>
							</Suspense>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
