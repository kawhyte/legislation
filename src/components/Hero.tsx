import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import animationData from "../assets/friends.json";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";

const Lottie = React.lazy(() => import("lottie-react"));

interface HeroSectionProps {}

const HeroSection = ({}: HeroSectionProps) => {

	return (
		<div className='relative  overflow-hidden'>
			{/* Main content */}
			<div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center'>
				<div className='max-w-8xl mx-auto'>
					{/* Main heading */}

					<div className='grid lg:grid-cols-2 gap-8 items-center'>
						<div className='text-center md:text-left'>
							<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4'>
								Track State Legislation That Impacts Your Life
							</h1>

							{/* Sub-heading */}
							<p className='max-w-2xl md:mx-0 mx-auto text-lg text-muted-foreground mb-6'>
								Stay informed about state bills with AI-powered summaries, real-time tracking, and personalized alerts. Never miss legislation that affects your community, business, or interests.
							</p>

							{/* Benefits List */}
							<div className='max-w-3xl md:mx-0 mx-auto mb-8'>
								<ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 text-left'>
									<li className='flex items-center gap-2 sm:gap-3'>
										<CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0' />
										<span className='text-sm sm:text-base text-muted-foreground whitespace-nowrap'>AI-powered bill summaries</span>
									</li>
									<li className='flex items-center gap-2 sm:gap-3'>
										<CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0' />
										<span className='text-sm sm:text-base text-muted-foreground whitespace-nowrap'>Real-time tracking (50 states)</span>
									</li>
									<li className='flex items-center gap-2 sm:gap-3'>
										<CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0' />
										<span className='text-sm sm:text-base text-muted-foreground whitespace-nowrap'>Personalized topic alerts</span>
									</li>
									<li className='flex items-center gap-2 sm:gap-3'>
										<CheckCircle className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0' />
										<span className='text-sm sm:text-base text-muted-foreground whitespace-nowrap'>Save & organize bills</span>
									</li>
								</ul>
							</div>

							{/* Call-to-Action Buttons */}
							<div className='flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10'>
								<Button asChild size='lg' className='px-8'>
									<Link to='/sign-up'>
										Get Started Free
									</Link>
								</Button>
								<Button asChild variant='outline' size='lg' className='px-8 border-2 border-border'>
									<Link to='/dashboard'>
										View Demo Without An Account
									</Link>
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
