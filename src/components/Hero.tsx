import React, { useEffect, useState } from "react";
import { Briefcase, Users, Image as ImageIcon, Building } from "lucide-react";
import StateSelector, { type States } from "./JurisdictionSelector";
import { Button } from "./ui/button";
import usStates from "@/data/usStates";


const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
// const legislatureData = {
// 	CA: {
// 		name: "California",
// 		coords: { lon: -119.4179, lat: 36.7783 },
// 		zoom: 5.5,
// 		senators: {
// 			total: 40,
// 			democrats: 32, // Updated data for realism
// 			republicans: 8,
// 		},
// 		assembly: {
// 			total: 80,
// 			democrats: 62,
// 			republicans: 18,
// 		},
// 	},
// 	NV: {
// 		name: "Nevada",
// 		coords: { lon: -116.4194, lat: 38.8026 },
// 		zoom: 5.8,
// 		senators: {
// 			total: 21,
// 			democrats: 13,
// 			republicans: 8,
// 		},
// 		assembly: {
// 			total: 42,
// 			democrats: 28,
// 			republicans: 14,
// 		},
// 	},
// 	AL: {
// 		name: "Texas-Lie",
// 		coords: { lon: -99.9018, lat: 31.9686 },
// 		zoom: 5,
// 		senators: {
// 			total: 31,
// 			democrats: 12,
// 			republicans: 19,
// 		},
// 		assembly: {
// 			name: "House of Representatives",
// 			total: 150,
// 			democrats: 64,
// 			republicans: 86,
// 		},
// 	},
// };

interface HeroSectionProps {
	selectedJurisdiction: States | null;
	setSelectedJurisdiction: (jurisdiction: States) => void;
}
// --- Main Hero Component ---
const HeroSection = ({
	selectedJurisdiction,
	setSelectedJurisdiction,
}: HeroSectionProps) => {

const [mapLoading, setMapLoading] = useState(true);
	

	const currentData =
		usStates.find(
			(state) =>
				state.abbreviation === (selectedJurisdiction?.abbreviation ?? "CA")
		) ?? usStates.find((state) => state.abbreviation === "CA"); // fallback to CA if not found


const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-grey&width=800&height=600&center=lonlat:${currentData?.coords.lon},${currentData?.coords.lat}&zoom=${currentData?.zoom}&apiKey=${geoapifyApiKey}`;





  useEffect(() => {
    setMapLoading(true);
  }, [mapUrl]);

	const popularTags = [
		"app design",
		"landing page",
		"web design",
		"dashboard",
		"logo design",
	];





	console.log("current Data", currentData);
	console.log("selectedState selectedJurisdiction ", selectedJurisdiction);
	console.log(
		"selectedStateAAANBBB selectedState ",
		selectedJurisdiction?.abbreviation
	);


	return (
		<div className='bg-white dark:bg-gray-900 font-sans'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
					{/* Left Column: Text Content & Search */}
					<div className='text-center lg:text-left'>
						<h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tighter mb-4'>
							US State <br />
							Legislation Tracker
						</h1>
						<p className='max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8'>
							Tracking the bills that matter, made simple.
						</p>

						{/* Tabs */}
						<div className='flex justify-center lg:justify-start space-x-2 mb-6'>
							<Button
								variant='secondary'
								className='bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'>
								<ImageIcon className='mr-2 h-4 w-4' /> Shots
							</Button>
							<Button
								variant='secondary'
								className='bg-black text-white dark:bg-white dark:text-black shadow-sm'>
								<Users className='mr-2 h-4 w-4' /> Designers
							</Button>
							<Button
								variant='secondary'
								className='bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'>
								<Briefcase className='mr-2 h-4 w-4' /> Services
							</Button>
						</div>

						{/* State Filter Dropdown */}
						<div className='max-w-xl mx-auto lg:mx-0 mb-6'>
							<StateSelector onSelectJurisdiction={setSelectedJurisdiction} />
						</div>

						{/* Popular Tags */}
						<div className='flex items-center justify-center lg:justify-start flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400'>
							<span className='font-semibold text-gray-800 dark:text-white'>
								Popular:
							</span>
							{popularTags.map((tag) => (
								<button
									key={tag}
									className='px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
									{tag}
								</button>
							))}
						</div>
					</div>

					{/* Right Column: Image (Hidden on small screens) */}

					<div className='flex relative w-full h-full items-center justify-center p-4 sm:p-8'>
						<div className='absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 opacity-20 dark:opacity-30 rounded-3xl blur-3xl'></div>

						<div className='relative w-full h-auto aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl'>
						
						






{mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100/80 via-gray-200/60 to-gray-300/40 dark:from-gray-800/80 dark:via-gray-900/60 dark:to-gray-900/40 z-10">
                  <svg className="animate-spin h-12 w-12 text-indigo-500" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                </div>
              )}
              <img
                src={mapUrl}
                alt={`Map of ${selectedJurisdiction?.name}`}
                className='w-full h-full object-cover transition-opacity duration-700'
                style={{ opacity: mapLoading ? 0 : 1 }}
                onLoad={() => setMapLoading(false)}
                onError={() => setMapLoading(false)}
              />




							<div className='absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-indigo-900/40 to-transparent'></div>

							<div className='absolute inset-0 flex flex-col justify-between p-4 sm:p-6 text-white'>
								{/* Top Content: Jurisdiction Name */}
								<h2 className='font-bold text-indigo-400 text-2xl md:text-3xl text-shadow'>
									{selectedJurisdiction?.name}
								</h2>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									{/* Senators */}

									<div className='flex flex-col items-start p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10'>
										<div className='flex items-center text-sm font-medium text-gray-300 uppercase tracking-wider mb-2'>
											<Building className='h-4 w-4 mr-2' />
											Senators
										</div>
										<p className='text-4xl md:text-5xl font-bold text-white'>
											{/* {currentData?.senators?.total} */}102
										</p>
										<ul className='mt-4 space-y-1 text-gray-200 w-full'>
											<li className='flex justify-between items-center'>
												<span>Democrats</span>
												<span className='font-semibold text-blue-400'>
													{/* {currentData.senators.democrats} */} 5
												</span>
											</li>
											<li className='flex justify-between items-center'>
												<span>Republicans</span>
												<span className='font-semibold text-red-400'>
													{/* {currentData.senators.republicans} */}4
												</span>
											</li>
										</ul>
									</div>

									{/* Assemblymembers */}
									<div className='flex flex-col items-start p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10'>
										<div className='flex items-center text-sm font-medium text-gray-300 uppercase tracking-wider mb-2'>
											<Users className='h-4 w-4 mr-2' />
											{/* {currentData.assembly.name || "Assemblymembers"} */}
											55
										</div>
										<p className='text-4xl md:text-5xl font-bold text-white'>
											{/* {currentData.assembly.total} */}66
										</p>
										<ul className='mt-4 space-y-1 text-gray-200 w-full'>
											<li className='flex justify-between items-center'>
												<span>Democrats</span>
												<span className='font-semibold text-blue-400'>
													{/* {currentData.assembly.democrats} */}
													99
												</span>
											</li>
											<li className='flex justify-between items-center'>
												<span>Republicans</span>
												<span className='font-semibold text-red-400'>
													{/* {currentData.assembly.republicans} */}
													22
												</span>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
