import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import animationData from "../assets/friends.json";
import { Button } from "./ui/button";
import { Circle } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";

const Lottie = React.lazy(() => import("lottie-react"));



const HeroSection = () => {
	const { setDemoMode, refreshDemoBills } = useDemo();

	const scrollToDemo = () => {
		// First activate demo mode
		setDemoMode(true);
		refreshDemoBills();
		
		// Then scroll to the demo section
		setTimeout(() => {
			const demoElement = document.getElementById('demo-playground');
			if (demoElement) {
				demoElement.scrollIntoView({ 
					behavior: 'smooth',
					block: 'start'
				});
			}
		}, 100); // Small delay to ensure demo mode is activated
	};

	return (
		<div className='relative overflow-hidden'>
			{/* Main content */}
			<div className='relative z-10 container-legislation py-20 sm:py-24 lg:py-32 text-center'>
				<div className='max-w-8xl mx-auto'>
					{/* Main heading */}

					<div className='grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center'>
						<div className='text-center md:text-left space-y-8'>
							<h1 className='text-display-xl text-foreground'>
								Track State Legislation That Impacts Your Life
							</h1>

							{/* Sub-heading */}
							<p className='max-w-2xl md:mx-0 mx-auto text-body-lg text-muted-foreground'>
								Stay informed about state bills with AI-powered summaries, real-time tracking, and personalized alerts. Never miss legislation that affects your community, business, or interests.
							</p>

							{/* Benefits List */}
							<div className='max-w-3xl md:mx-0 mx-auto'>
								<ul className='grid grid-cols-2 gap-6 sm:gap-8 text-left'>
									<li className='flex items-center gap-3 sm:gap-4'>
										<Circle className='h-4 w-4 text-wellness-purple flex-shrink-0 fill-wellness-purple/20' />
										<span className='text-sm sm:text-base text-muted-foreground'>AI-powered bill summaries</span>
									</li>
									<li className='flex items-center gap-3 sm:gap-4'>
										<Circle className='h-4 w-4 text-primary flex-shrink-0 fill-primary/20' />
										<span className='text-sm sm:text-base text-muted-foreground'>Real-time tracking (50 states)</span>
									</li>
									<li className='flex items-center gap-3 sm:gap-4'>
										<Circle className='h-4 w-4 text-wellness-green flex-shrink-0 fill-wellness-green/20' />
										<span className='text-sm sm:text-base text-muted-foreground'>Personalized topic alerts</span>
									</li>
									<li className='flex items-center gap-3 sm:gap-4'>
										<Circle className='h-4 w-4 text-wellness-pink flex-shrink-0 fill-wellness-pink/20' />
										<span className='text-sm sm:text-base text-muted-foreground'>Save & organize bills</span>
									</li>
								</ul>
							</div>

							{/* Call-to-Action Buttons */}
							<div className='flex flex-col sm:flex-row gap-6 justify-center md:justify-start'>
								<Button asChild size='lg' className='px-8 py-6 bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all'>
									<Link to='/sign-up'>
										Get Started Free
									</Link>
								</Button>
								<Button 
									onClick={scrollToDemo}
									size='lg' 
									className='px-8 py-6 text-muted-foreground border-2 border-border bg-card hover:bg-wellness-purple/10 transition-all'
								>
									Explore Demo
								</Button>
							</div>

							{/* <div className='max-w-4xl mx-auto mb-6 border border-border bg-card px-4 md:px-6 py-6 md:py-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
								
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
							</div> */}
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
