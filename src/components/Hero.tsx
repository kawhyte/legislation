import React, { Suspense, useState } from "react";
import animationData from "../assets/friends.json";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Circle } from "lucide-react";

const Lottie = React.lazy(() => import("lottie-react"));

interface HeroSectionProps {
	onSearch: (zip: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
	const [zip, setZip] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (zip.length === 5) {
			onSearch(zip);
		}
	};

	return (
		<div className='relative overflow-hidden'>
			<div className='relative z-10 container-legislation py-20 sm:py-24 lg:py-32 text-center'>
				<div className='max-w-8xl mx-auto'>
					<div className='grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center'>
						<div className='text-center md:text-left space-y-8'>
							<h1 className='text-display-xl text-foreground'>
								Track State Legislation That Impacts Your Life
							</h1>

							<p className='max-w-2xl md:mx-0 mx-auto text-body-lg text-muted-foreground'>
								Stay informed about state bills with AI-powered summaries, real-time tracking, and personalized alerts. Never miss legislation that affects your community, business, or interests.
							</p>

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

							<form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 justify-center md:justify-start max-w-sm md:mx-0 mx-auto'>
								<Input
									type='text'
									inputMode='numeric'
									pattern='[0-9]*'
									maxLength={5}
									placeholder='Enter your zip code'
									value={zip}
									onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
									className='text-lg h-12'
								/>
								<Button
									type='submit'
									size='lg'
									disabled={zip.length !== 5}
									className='px-8 h-12 bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all whitespace-nowrap'
								>
									Find My Bills
								</Button>
							</form>
						</div>

						<div>
							<Suspense fallback={<div>Loading...</div>}>
								<Lottie
									animationData={animationData}
									loop={true}
									className='hidden lg:block w-full max-w-xl mx-auto md:ml-auto'
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
