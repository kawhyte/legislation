import React, { useState } from "react";
import { useUserData } from "../contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SavedBillsTab from "../components/SavedBillsTab";
import StateBillsTab from "../components/StateBillsTab";
import ExploreBillsTab from "../components/ExploreBillsTab";

const DashboardPage: React.FC = () => {
	const { userPreferences, savedBills } = useUserData();
	const [activeTab, setActiveTab] = useState("saved");

	// Get user's state name for display
	const userStateName = userPreferences?.selectedState ? 
		// Convert abbreviation to full name
		(() => {
			const stateMap: Record<string, string> = {
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
			return stateMap[userPreferences.selectedState] || userPreferences.selectedState;
		})() : "Your State";

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-12'>
				{/* Header */}
				<div className='mb-12 space-y-4'>
					<h1 className='text-3xl sm:text-4xl font-bold text-foreground'>
						Dashboard
					</h1>
					<p className='text-lg text-muted-foreground'>
						Track legislation, explore bills, and stay informed
					</p>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-12">
						<TabsTrigger value="saved" className="flex items-center gap-2">
							Saved Bills
							{savedBills.length > 0 && (
								<Badge className='h-5 px-2 text-xs bg-primary text-primary-foreground'>
									{savedBills.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="state">Bills from {userStateName}</TabsTrigger>
						<TabsTrigger value="explore">Explore Bills</TabsTrigger>
					</TabsList>

					<TabsContent value="saved" className="mt-0">
						<SavedBillsTab />
					</TabsContent>

					<TabsContent value="state" className="mt-0">
						<StateBillsTab userStateName={userStateName} />
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
