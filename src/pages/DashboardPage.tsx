import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserData } from "../contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SavedBillsTab from "../components/SavedBillsTab";
import StateBillsTab from "../components/StateBillsTab";
import ExploreBillsTab from "../components/ExploreBillsTab";
import TrendingBillsTab from "../components/TrendingBillsTab";

const STATE_NAMES: Record<string, string> = {
	"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
	"CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
	"HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
	"KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
	"MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
	"MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
	"NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
	"OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
	"SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
	"VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};

const DashboardPage: React.FC = () => {
	const { userPreferences, savedBills } = useUserData();
	const [searchParams] = useSearchParams();
	const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'state');

	const stateAbbr = userPreferences?.selectedState ?? "";
	const userStateName = STATE_NAMES[stateAbbr] || stateAbbr || "Your State";
	const firstName = userPreferences?.displayName?.split(" ")[0] ?? null;

	return (
		<div className='min-h-screen bg-background'>
			<div className='container-legislation container-section'>

				{/* Page header */}
				<div className='mb-8 space-y-1'>
					<h1 className='text-3xl sm:text-4xl font-black text-foreground'>
						{firstName ? `Welcome back, ${firstName}` : "Your Dashboard"}
					</h1>
					<p className='text-base text-muted-foreground'>
						Tracking legislation in {userStateName} and beyond.
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="flex w-full bg-transparent rounded-none p-0 h-auto mb-8 border-b-2 border-border gap-0">
						<TabsTrigger
							value="state"
							className="flex-1 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium data-[state=active]:font-bold px-3 sm:px-5 py-3 border-b-[3px] border-transparent data-[state=active]:border-accent-yellow -mb-[2px] transition-colors text-sm sm:text-base"
						>
							{/* {stateAbbr ? `My ${stateAbbr}` : "My State"} */}
							{ "My State"}
						</TabsTrigger>
						<TabsTrigger
							value="saved"
							className="flex-1 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium data-[state=active]:font-bold px-3 sm:px-5 py-3 border-b-[3px] border-transparent data-[state=active]:border-accent-yellow -mb-[2px] transition-colors text-sm sm:text-base inline-flex items-center gap-2"
						>
							Saved
							{savedBills.length > 0 && (
								<Badge className='h-5 px-1.5 rounded-full text-xs bg-primary text-primary-foreground'>
									{savedBills.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger
							value="trending"
							className="flex-1 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground font-medium data-[state=active]:font-bold px-3 sm:px-5 py-3 border-b-[3px] border-transparent data-[state=active]:border-accent-yellow -mb-[2px] transition-colors text-sm sm:text-base"
						>
							What's Hot
						</TabsTrigger>
					</TabsList>

					<TabsContent value="state" className="mt-0">
						<StateBillsTab userStateName={userStateName} />
					</TabsContent>

					<TabsContent value="saved" className="mt-0">
						<SavedBillsTab onSwitchToExplore={() => setActiveTab("explore")} />
					</TabsContent>

					<TabsContent value="trending" className="mt-0">
						<TrendingBillsTab />
					</TabsContent>

					<TabsContent value="explore" className="mt-0">
						<ExploreBillsTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default DashboardPage;
