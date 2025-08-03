import React from 'react';
import { Briefcase, Users, Image as ImageIcon, Star, ChevronDown } from 'lucide-react';

// --- shadcn/ui Components (Simplified for example) ---
// In your actual app, you would import these from your components directory
// e.g. import { Button } from "@/components/ui/button";
// e.g. import { Select, ... } from "@/components/ui/select";

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
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
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Simplified Select component for demonstration
const Select = ({ children }) => <div className="relative">{children}</div>;
const SelectTrigger = ({ children, className }) => (
  <button className={`flex h-10 w-full items-center justify-between rounded-full border border-input bg-background px-6 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
);
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent = ({ children, className }) => <div className={`absolute z-50 mt-2 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 ${className}`}>{children}</div>;
const SelectItem = ({ children, value }) => <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" >{children}</div>;


// --- Main Hero Component ---
const HeroSection = () => {
  const popularTags = ["app design", "landing page", "web design", "dashboard", "logo design"];
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];


  return (
    <div className="bg-white dark:bg-gray-900 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content & Search */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tighter mb-4">
              Discover the <br />
              World's Top Designers
            </h1>
            <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8">
              Explore work from the most talented and accomplished designers ready to take on your next project.
            </p>

            {/* Tabs */}
            <div className="flex justify-center lg:justify-start space-x-2 mb-6">
                <Button variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
                    <ImageIcon className="mr-2 h-4 w-4" /> Shots
                </Button>
                <Button variant="secondary" className="bg-black text-white dark:bg-white dark:text-black shadow-sm">
                    <Users className="mr-2 h-4 w-4" /> Designers
                </Button>
                <Button variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
                    <Briefcase className="mr-2 h-4 w-4" /> Services
                </Button>
            </div>

            {/* State Filter Dropdown */}
            <div className="max-w-xl mx-auto lg:mx-0 mb-6">
                <Select>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-pink-500">
                        <SelectValue placeholder="Filter by state" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 max-h-60 overflow-y-auto">
                        {usStates.map((state) => (
                            <SelectItem key={state} value={state.toLowerCase().replace(' ', '-')}>
                                {state}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


            {/* Popular Tags */}
            <div className="flex items-center justify-center lg:justify-start flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-white">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Image (Hidden on small screens) */}
          <div className="hidden lg:flex relative w-full h-full items-center justify-center p-8">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 opacity-20 dark:opacity-30 rounded-3xl blur-3xl"></div>
             <div className="relative bg-black/50 backdrop-blur-sm rounded-3xl p-4 shadow-2xl w-[280px] h-[560px] md:w-[300px] md:h-[600px]">
                <div className="w-full h-full bg-black rounded-2xl flex flex-col justify-between p-4">
                    {/* Phone UI Mockup */}
                    <div>
                        <div className="flex justify-between items-center text-white mb-8">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span className="font-semibold">Passage</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>

                        <div className="relative w-48 h-48 mx-auto rounded-full bg-gray-800 shadow-lg flex items-center justify-center">
                            <img 
                                src="https://images.unsplash.com/photo-1559268297-c69b75a4d6a3?q=80&w=2574&auto=format&fit=crop" 
                                alt="Airplane wing from window" 
                                className="w-44 h-44 rounded-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/7f9cf5/ffffff?text=Image'; }}
                            />
                            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                        </div>
                    </div>
                    
                    <div className="text-white text-center">
                        <div className="flex items-center justify-center space-x-8 my-8">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 4L4 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 4L4 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(10, 0)"/></svg>
                            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z"/></svg>
                            </div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4L20 10L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 4L20 10L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-10, 0)"/></svg>
                        </div>
                        <p className="text-sm text-gray-400">Next Songs</p>
                    </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-black text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                    AmazingUI
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
