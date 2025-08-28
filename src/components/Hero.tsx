import React, { Suspense } from "react";
import StateSelector, { type States } from "./JurisdictionSelector";
import TopicSelector from "./TopicSelector"; // Import TopicSelector
import animationData from "../assets/friends.json";

const Lottie = React.lazy(() => import("lottie-react"));

interface HeroSectionProps {
	setSelectedJurisdiction: (jurisdiction: States | null) => void;
	selectedJurisdiction: States | null;
	selectedTopic: string | null;
	setSelectedTopic: (topic: string | null) => void;
}

const HeroSection = ({
	setSelectedJurisdiction,
	selectedTopic,
	setSelectedTopic,
}: HeroSectionProps) => {
	return (
		<div className='relative  overflow-hidden'>
			{/* Main content */}
			<div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center'>
				<div className='max-w-8xl mx-auto'>
					{/* Main heading */}

					<div className='grid lg:grid-cols-2 gap-8 items-center'>
						<div className='text-center md:text-left'>
							<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4'>
								Understand Legislation That Matters
							</h1>

							{/* Sub-heading */}
							<p className='max-w-2xl md:mx-0 mx-auto text-lg text-muted-foreground mb-10'>
								Decode complex state legislation with AI-powered summaries,
								real-time bill tracking, and clear explanations.
							</p>

							<div className='max-w-4xl mx-auto mb-6 flex flex-col gap-8 border border-border bg-card px-4 md:px-6 py-8 md:py-12 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
								{/* Text Block */}
								<div className='text-center'>
								   <p className="text-xl md:text-2xl font-medium text-foreground">
										Select your state and a topic to see a real-time feed of
										relevant bills.
									</p>
								</div>

								{/* Selector Wrapper */}
								<div className='flex flex-col xl:flex-row gap-4'>
									<StateSelector
										onSelectJurisdiction={setSelectedJurisdiction}
									/>
									<TopicSelector
										selectedTopic={selectedTopic}
										onTopicSelect={setSelectedTopic}
									/>
								</div>
							</div>
						</div>
						<div>
							<Suspense fallback={<div>Loading...</div>}>
								<Lottie
									animationData={animationData}
									loop={true}
									className=' hidden lg:block w-full max-w-xl mx-auto md:ml-auto'
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
