/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import {  MapPin, Sparkles, TrendingUp, Users } from "lucide-react";
import StateSelector, { type States } from "./JurisdictionSelector";
import usStates from "@/data/usStates";

const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

interface HeroSectionProps {
	selectedJurisdiction: States | null;
	setSelectedJurisdiction: (jurisdiction: States | null) => void;
}

const HeroSection = ({
	selectedJurisdiction,
	setSelectedJurisdiction,
}: HeroSectionProps) => {
	
	const [isLoaded, setIsLoaded] = useState(false);

	const currentData =
		usStates.find(
			(state) =>
				state.abbreviation === (selectedJurisdiction?.abbreviation ?? "CA")
		) ?? usStates.find((state) => state.abbreviation === "CA");

	const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-grey&width=1200&height=800&center=lonlat:${currentData?.coords.lon},${currentData?.coords.lat}&zoom=${currentData?.zoom}&apiKey=${geoapifyApiKey}`;

	useEffect(() => {
		// Add entrance animation trigger
		const timer = setTimeout(() => setIsLoaded(true), 100);
		return () => clearTimeout(timer);
	}, [mapUrl]);

	const features = [
		{
			icon: TrendingUp,
			text: "Real-time bill tracking",
			color: "text-emerald-400"
		},
		{
			icon: Sparkles,
			text: "AI-powered summaries",
			color: "text-violet-400"
		},
		{
			icon: Users,
			text: "TL;DR: The Law",
			color: "text-blue-400"
		}
	];


	return (
		<div className='relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden'>
			{/* Animated background elements */}
			<div className="absolute inset-0">
				{/* Main gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-blue-950/10 to-emerald-950/20" />
				
				{/* Animated orbs */}
				<div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl transition-all duration-[3000ms] ease-out ${isLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
				<div className={`absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transition-all duration-[3000ms] delay-500 ease-out ${isLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
				<div className={`absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transition-all duration-[3000ms] delay-1000 ease-out ${isLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
				
				{/* Subtle map background with soft edges */}
				{mapUrl && (
					<div className="absolute inset-0 opacity-5">
						<img
							src={mapUrl}
							alt={`Map of ${selectedJurisdiction?.name}`}
							className='w-full h-full object-cover'
							
						/>
					
						<div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
						<div className="absolute inset-0 bg-gradient-to-b from-slate-950  via-transparent to-slate-950" />
						<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60" />
					</div>
				)}
			</div>

			{/* Main content */}
			<div className='relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32'>
				<div className='max-w-4xl mx-auto text-center'>
					{/* Main heading with animation */}
					<div className={`transition-all duration-1000 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
						{/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
							<Zap className="h-4 w-4" />
							Making democracy accessible for everyone
						</div>
						 */}
						<h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-[0.9] tracking-tight mb-6'>
							Track US
							<br />
							<span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
								Legislation
							</span>
							<br />
							That Matters
						</h1>
						
						<p className='max-w-2xl mx-auto text-xl text-slate-300 mb-12 leading-relaxed'>
							Stay informed on the bills shaping your future. Get AI-powered summaries, 
							real-time updates, and clear explanations of complex legislation.
						</p>
					</div>

					{/* Features row */}
					<div className={`flex flex-wrap justify-center gap-6 mb-16 transition-all duration-1000 delay-300 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
						{features.map((feature, index) => (
							<div key={index} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
								<feature.icon className={`h-4 w-4 ${feature.color}`} />
								<span className="text-slate-300 text-sm font-medium">{feature.text}</span>
							</div>
						))}
					</div>




					

					{/* Main CTA Section */}
					<div className={`transition-all duration-1000 delay-500 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
						<div className="relative max-w-2xl mx-auto">
							{/* Animated border effect */}
							<div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
							
							<div className='relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl'>
								<div className="flex items-center justify-center gap-2 mb-4">
									<MapPin className="h-5 w-5 text-violet-400" />
									<h3 className='text-2xl font-bold text-white'>
										Choose Your State to Get Started
									</h3>
								</div>
								
								<p className='text-slate-400 mb-6 text-lg'>
									Select your state to see live legislation, AI summaries, and track bills that impact your community.
								</p>
								
								<div className="space-y-4 flex flex-row align-middle justify-center">
									<StateSelector
										onSelectJurisdiction={setSelectedJurisdiction}
									/>
									
									
								</div>
							</div>
						</div>
					</div>

					{/* Stats section */}
					{/* <div className={`mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-1000 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
						{[
							{ number: "50", label: "States Covered", color: "text-violet-400" },
							{ number: "10K+", label: "Bills Tracked", color: "text-blue-400" },
							{ number: "Real-time", label: "Updates", color: "text-emerald-400" }
						].map((stat, index) => (
							<div key={index} className="text-center p-6 rounded-xl bg-slate-800/30 border border-slate-700/30">
								<div className={`text-3xl font-bold ${stat.color} mb-2`}>
									{stat.number}
								</div>
								<div className="text-slate-400 font-medium">
									{stat.label}
								</div>
							</div>
						))}
					</div> */}
				</div>
			</div>

			{/* Bottom fade effect */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
		</div>
	);
};

export default HeroSection;