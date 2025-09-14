import React from "react";
import { useUserData } from "../contexts/UserContext";
import useBills from "../hooks/useBills";
import BillCard from "@/components/BillCard";
import BillCardSkeleton from "@/components/BillCardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	BookmarkIcon,
	TrendingUp,
	Activity,
	HeartPulse,
	Home,
	Brain,
	GraduationCap,
	Leaf,
	Clock,
	type LucideIcon,
} from "lucide-react";
import usStates from "../data/usStates";
import type { States } from "./JurisdictionSelector";
import type { Bill } from "@/types";

interface StateBillsTabProps {
	userStateName: string;
}

const StateBillsTab: React.FC<StateBillsTabProps> = ({ userStateName }) => {
	const { userPreferences, savedBills } = useUserData();
	
	// Get user's state object for API calls
	const userStateObj = userPreferences?.selectedState ? 
		usStates.find(state => state.abbreviation === userPreferences.selectedState) as States | null : 
		null;

	// Fetch bills from user's state
	const { data: stateBills, isLoading: isLoadingStateBills } = useBills(userStateObj, null);
	
	// Fetch bills for different topics
	const { data: healthcareBills, isLoading: isLoadingHealthcare } = useBills(userStateObj, "healthcare");
	const { data: housingBills, isLoading: isLoadingHousing } = useBills(userStateObj, "housing");
	const { data: techBills, isLoading: isLoadingTech } = useBills(userStateObj, "ai");
	const { data: educationBills, isLoading: isLoadingEducation } = useBills(userStateObj, "education");
	const { data: environmentBills, isLoading: isLoadingEnvironment } = useBills(userStateObj, "environment");

	// Calculate stats
	const totalSavedBills = savedBills.length;
	const stateBillsFromLastWeek = stateBills?.filter(bill => {
		const billDate = new Date(bill.latest_action_date || bill.introduced);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return billDate > weekAgo;
	}).length || 0;

	// Recent activity - bills that have updates and are saved
	const recentActivity = savedBills.filter(savedBill => {
		const bill = savedBill.billData;
		if (!bill.latest_action_date) return false;
		const actionDate = new Date(bill.latest_action_date);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return actionDate > weekAgo;
	}).slice(0, 3);

	const DashboardStatsCard = ({ icon: Icon, title, value, description, color = "text-primary" }: {
		icon: LucideIcon;
		title: string;
		value: string | number;
		description: string;
		color?: string;
	}) => (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className={`h-4 w-4 ${color}`} />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);

	const BillSection = ({ 
		title, 
		bills, 
		isLoading, 
		icon: Icon, 
		color = "text-primary",
		showMax = 4
	}: {
		title: string;
		bills: Bill[] | undefined;
		isLoading: boolean;
		icon: LucideIcon;
		color?: string;
		showMax?: number;
	}) => (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Icon className={`h-5 w-5 ${color}`} />
				<h3 className="text-lg font-semibold">{title}</h3>
				{bills && bills.length > 0 && (
					<Badge variant="secondary">{bills.length}</Badge>
				)}
			</div>
			
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{Array.from({ length: showMax }).map((_, i) => (
						<BillCardSkeleton key={i} />
					))}
				</div>
			) : bills && bills.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{bills.slice(0, showMax).map((bill) => (
						<BillCard 
							key={bill.id} 
							bill={bill} 
							showSource={true}
							showProgressBar={true}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-8 text-muted-foreground">
					<Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No {title.toLowerCase()} bills found in {userStateName}</p>
				</div>
			)}
		</div>
	);

	if (!userPreferences?.selectedState) {
		return (
			<div className="text-center py-16">
				<div className="text-muted-foreground">
					<Home className="h-12 w-12 mx-auto mb-4" />
					Please set up your profile with a selected state to see personalized bill information.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Bills from {userStateName}
				</h2>
				<p className="text-muted-foreground">
					Stay up to date with legislation in your state
				</p>
			</div>

			{/* Dashboard Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<DashboardStatsCard
					icon={BookmarkIcon}
					title="Bills Saved"
					value={totalSavedBills}
					description="Total bills you've bookmarked"
					color="text-blue-600"
				/>
				<DashboardStatsCard
					icon={TrendingUp}
					title={`From ${userStateName} This Week`}
					value={stateBillsFromLastWeek}
					description="New bills with recent activity"
					color="text-green-600"
				/>
				<DashboardStatsCard
					icon={Activity}
					title="Recent Activity"
					value={recentActivity.length}
					description="Your saved bills with updates"
					color="text-orange-600"
				/>
				<DashboardStatsCard
					icon={Clock}
					title="Total Active"
					value={stateBills?.length || 0}
					description={`Bills currently in ${userStateName}`}
					color="text-purple-600"
				/>
			</div>

			{/* Recent Activity Section */}
			{recentActivity.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-orange-600" />
						<h3 className="text-lg font-semibold">Recent Activity</h3>
						<Badge variant="secondary">{recentActivity.length}</Badge>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{recentActivity.map((savedBill) => (
							<BillCard 
								key={savedBill.billId} 
								bill={savedBill.billData} 
								showSource={true}
								showProgressBar={true}
							/>
						))}
					</div>
				</div>
			)}

			{/* Trending in State */}
			<BillSection
				title={`Trending in ${userStateName}`}
				bills={stateBills?.filter(bill => bill.trendingReason === "Trending")}
				isLoading={isLoadingStateBills}
				icon={TrendingUp}
				color="text-green-600"
				showMax={6}
			/>

			{/* Topic Sections */}
			<BillSection
				title="Healthcare"
				bills={healthcareBills}
				isLoading={isLoadingHealthcare}
				icon={HeartPulse}
				color="text-red-600"
			/>

			<BillSection
				title="Housing"
				bills={housingBills}
				isLoading={isLoadingHousing}
				icon={Home}
				color="text-blue-600"
			/>

			<BillSection
				title="Technology"
				bills={techBills}
				isLoading={isLoadingTech}
				icon={Brain}
				color="text-purple-600"
			/>

			<BillSection
				title="Education"
				bills={educationBills}
				isLoading={isLoadingEducation}
				icon={GraduationCap}
				color="text-indigo-600"
			/>

			<BillSection
				title="Environment"
				bills={environmentBills}
				isLoading={isLoadingEnvironment}
				icon={Leaf}
				color="text-green-600"
			/>
		</div>
	);
};

export default StateBillsTab;