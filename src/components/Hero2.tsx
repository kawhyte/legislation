import React, { useState } from "react";
import {
	Briefcase,
	Users,
	Image as ImageIcon,
	Star,
	ChevronDown,
	Building,
} from "lucide-react";
import StateSelector, { type States } from "../components/JurisdictionSelector";

// --- shadcn/ui Components (Simplified for example) ---
// In your actual app, you would import these from your components directory
// e.g. import { Button } from "@/components/ui/button";
// e.g. import { Select, ... } from "@/components/ui/select";

const Button = React.forwardRef(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const variants = {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive:
				"bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline:
				"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
		};
		const sizes = {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
			icon: "h-10 w-10",
		};
		const Comp = asChild ? "span" : "button";
		return (
			<Comp
				className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
					variants[variant] || variants.default
				} ${sizes[size] || sizes.default} ${className}`}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

// Simplified Select component for demonstration
const Select = ({ children }) => <div className='relative'>{children}</div>;
const SelectTrigger = ({ children, className }) => (
	<button
		className={`flex h-10 w-full items-center justify-between rounded-full border border-input bg-background px-6 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
		{children}
		<ChevronDown className='h-4 w-4 opacity-50' />
	</button>
);
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent = ({ children, className }) => (
	<div
		className={`absolute z-50 mt-2 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 ${className}`}>
		{children}
	</div>
);
const SelectItem = ({ children, value }) => (
	<div className='relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'>
		{children}
	</div>
);

const legislatureData = {
	CA: {
		name: "California",
		coords: { lon: -119.4179, lat: 36.7783 },
		zoom: 5.5,
		senators: {
			total: 40,
			democrats: 32, // Updated data for realism
			republicans: 8,
		},
		assembly: {
			total: 80,
			democrats: 62,
			republicans: 18,
		},
	},
	NV: {
		name: "Nevada",
		coords: { lon: -116.4194, lat: 38.8026 },
		zoom: 5.8,
		senators: {
			total: 21,
			democrats: 13,
			republicans: 8,
		},
		assembly: {
			total: 42,
			democrats: 28,
			republicans: 14,
		},
	},
	TX: {
		name: "Texas",
		coords: { lon: -99.9018, lat: 31.9686 },
		zoom: 5,
		senators: {
			total: 31,
			democrats: 12,
			republicans: 19,
		},
		assembly: {
			name: "House of Representatives",
			total: 150,
			democrats: 64,
			republicans: 86,
		},
	},
};

interface HeroSectionProps {
	selectedJurisdiction: string | null;
	setSelectedJurisdiction: (jurisdiction: string) => void;
}
// --- Main Hero Component ---
const HeroSection = ({ selectedJurisdiction, setSelectedJurisdiction }) => {
	const popularTags = [
		"app design",
		"landing page",
		"web design",
		"dashboard",
		"logo design",
	];
	const usStates = [
		"Alabama",
		"Alaska",
		"Arizona",
		"Arkansas",
		"California",
		"Colorado",
		"Connecticut",
		"Delaware",
		"Florida",
		"Georgia",
		"Hawaii",
		"Idaho",
		"Illinois",
		"Indiana",
		"Iowa",
		"Kansas",
		"Kentucky",
		"Louisiana",
		"Maine",
		"Maryland",
		"Massachusetts",
		"Michigan",
		"Minnesota",
		"Mississippi",
		"Missouri",
		"Montana",
		"Nebraska",
		"Nevada",
		"New Hampshire",
		"New Jersey",
		"New Mexico",
		"New York",
		"North Carolina",
		"North Dakota",
		"Ohio",
		"Oklahoma",
		"Oregon",
		"Pennsylvania",
		"Rhode Island",
		"South Carolina",
		"South Dakota",
		"Tennessee",
		"Texas",
		"Utah",
		"Vermont",
		"Virginia",
		"Washington",
		"West Virginia",
		"Wisconsin",
		"Wyoming",
	];

	const [selectedState, setSelectedState] = useState("CA");
	const currentData = legislatureData[selectedState];

	const geoapifyApiKey = "bbd7c80a0a3a43549778382e9e794add";
	const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-grey&width=800&height=600&center=lonlat:${currentData.coords.lon},${currentData.coords.lat}&zoom=${currentData.zoom}&apiKey=${geoapifyApiKey}`;

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
							<StateSelector
								onSelectJurisdiction={(jurisdiction) =>
									setSelectedJurisdiction(jurisdiction)
								}
							/>
							{/* <Select>
  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-pink-500">
    <SelectValue placeholder="Filter by state">
      {selectedJurisdiction || "Filter by state"}
    </SelectValue>
  </SelectTrigger>
  <SelectContent className="bg-white dark:bg-gray-800 max-h-60 overflow-y-auto">
    {usStates.map((state) => (
      <SelectItem
        key={state}
        value={state}
        onClick={() => setSelectedJurisdiction(state)}
        className={selectedJurisdiction === state ? "bg-pink-100 dark:bg-pink-900" : ""}
      >
        {state}
      </SelectItem>
    ))}
  </SelectContent>
</Select> */}
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
    <img
      src={mapUrl}
      alt={`Map of ${selectedJurisdiction.name}`}
      className='w-full h-full object-cover'
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/800x600/e2e8f0/475569?text=Map+of+${encodeURIComponent(
          selectedJurisdiction.name
        )}`;
      }}
    />

    {/* KEY CHANGE 2: Gradient Overlay
      - This sits between the image and the text to ensure text is readable against a busy image.
      - `absolute inset-0`: Makes it cover the entire parent.
      - `bg-gradient-to-t from-black/70 to-transparent`: Darker at the bottom, fading to clear at the top.
    */}
    <div className='absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-indigo-900/40 to-transparent'></div>

    {/* KEY CHANGE 3: Content Overlay
      - `absolute inset-0`: Makes it cover the parent, sitting on top of the image and gradient.
      - `flex flex-col justify-between`: This is a powerful combo. It creates a vertical layout and pushes the
        jurisdiction name to the top and the stats boxes to the bottom.
      - `p-4 sm:p-6`: Responsive padding.
    */}
    <div className='absolute inset-0 flex flex-col justify-between p-4 sm:p-6 text-white'>
      {/* Top Content: Jurisdiction Name */}
      <h2 className='font-bold text-indigo-400 text-2xl md:text-3xl text-shadow'>
        {selectedJurisdiction.name}
      </h2>

      {/* Bottom Content: Stats Boxes */}
      {/* `grid`: Makes the two stat boxes sit side-by-side on small screens and up. */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {/* Senators */}
      
        <div className='flex flex-col items-start p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10'>
          <div className='flex items-center text-sm font-medium text-gray-300 uppercase tracking-wider mb-2'>
            <Building className='h-4 w-4 mr-2' />
            Senators
          </div>
          <p className='text-4xl md:text-5xl font-bold text-white'>
            {currentData.senators.total}
          </p>
          <ul className='mt-4 space-y-1 text-gray-200 w-full'>
            <li className='flex justify-between items-center'>
              <span>Democrats</span>
              <span className='font-semibold text-blue-400'>
                {currentData.senators.democrats}
              </span>
            </li>
            <li className='flex justify-between items-center'>
              <span>Republicans</span>
              <span className='font-semibold text-red-400'>
                {currentData.senators.republicans}
              </span>
            </li>
          </ul>
        </div>
        
        {/* Assemblymembers */}
        <div className='flex flex-col items-start p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10'>
          <div className='flex items-center text-sm font-medium text-gray-300 uppercase tracking-wider mb-2'>
            <Users className='h-4 w-4 mr-2' />
            {currentData.assembly.name || "Assemblymembers"}
          </div>
          <p className='text-4xl md:text-5xl font-bold text-white'>
            {currentData.assembly.total}
          </p>
          <ul className='mt-4 space-y-1 text-gray-200 w-full'>
            <li className='flex justify-between items-center'>
              <span>Democrats</span>
              <span className='font-semibold text-blue-400'>
                {currentData.assembly.democrats}
              </span>
            </li>
            <li className='flex justify-between items-center'>
              <span>Republicans</span>
              <span className='font-semibold text-red-400'>
                {currentData.assembly.republicans}
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
