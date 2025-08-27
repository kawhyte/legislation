import React, { Suspense } from "react";
import StateSelector, { type States } from "./JurisdictionSelector";
import TopicButton from "./TopicButton";
import animationData from "../assets/friends.json";

const Lottie = React.lazy(() => import('lottie-react'));

interface HeroSectionProps {
	setSelectedJurisdiction: (jurisdiction: States | null) => void;
}

const HeroSection = ({ setSelectedJurisdiction }: HeroSectionProps) => {
	const topicsWithColors = [
		{ name: "Healthcare", color: "#FFDDF4" },
		{ name: "Education", color: "#DDE2FF" },
		{ name: "Technology", color: "#DDFFEC" },
		{ name: "Housing Policy", color: "#FFF5DD" },
		{ name: "Environment", color: "#FFDDDD" },
	];

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

							<div className='max-w-4xl mx-auto mb-6'>
								<StateSelector onSelectJurisdiction={setSelectedJurisdiction} />
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

					{/* Popular Topics Section */}
					<div className="text-left">
						<span className='font-medium text-left text-muted-foreground mr-2'>
							Popular topics:
						</span>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4'>
							{topicsWithColors.map((topic) => (
								<TopicButton
									key={topic.name}
									topic={topic.name}
									color={topic.color}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
