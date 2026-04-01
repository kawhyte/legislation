import React, { useState } from "react";
import { useUserData } from "../contexts/UserContext";
import useBills from "../hooks/useBills";
import BillCard from "@/components/BillCard";
import BillCardSkeleton from "@/components/BillCardSkeleton";
import BillViewSwitcher from "./BillViewSwitcher";
import {
	Activity,
	HeartPulse,
	Home,
	Brain,
	GraduationCap,
	Leaf,
	LayoutGrid,
	TrendingUp,
} from "lucide-react";
import usStates from "../data/usStates";
import type { States } from "./JurisdictionSelector";
import type { BillViewMode } from "@/types";

interface StateBillsTabProps {
	userStateName: string;
}

const TOPICS = [
	{ label: "All",          value: "all",         icon: LayoutGrid    },
	{ label: "Healthcare",   value: "healthcare",   icon: HeartPulse    },
	{ label: "Housing",      value: "housing",      icon: Home          },
	{ label: "Technology",   value: "ai",           icon: Brain         },
	{ label: "Education",    value: "education",    icon: GraduationCap },
	{ label: "Environment",  value: "environment",  icon: Leaf          },
] as const;

type TopicValue = typeof TOPICS[number]["value"];

const StateBillsTab: React.FC<StateBillsTabProps> = ({ userStateName }) => {
	const { userPreferences, savedBills } = useUserData();
	const [viewMode, setViewMode] = useState<BillViewMode>("detailed");
	const [activeTopic, setActiveTopic] = useState<TopicValue>("all");

	const userStateObj = userPreferences?.selectedState
		? (usStates.find((s) => s.abbreviation === userPreferences.selectedState) as States | null)
		: null;

	// All topic data pre-fetched in background
	const { data: allBills,         isLoading: loadingAll         } = useBills(userStateObj, null);
	const { data: healthcareBills,  isLoading: loadingHealthcare  } = useBills(userStateObj, "healthcare");
	const { data: housingBills,     isLoading: loadingHousing     } = useBills(userStateObj, "housing");
	const { data: techBills,        isLoading: loadingTech        } = useBills(userStateObj, "ai");
	const { data: educationBills,   isLoading: loadingEducation   } = useBills(userStateObj, "education");
	const { data: environmentBills, isLoading: loadingEnvironment } = useBills(userStateObj, "environment");

	const billsMap: Record<TopicValue, { bills: typeof allBills; loading: boolean }> = {
		all:         { bills: allBills,         loading: loadingAll         },
		healthcare:  { bills: healthcareBills,  loading: loadingHealthcare  },
		housing:     { bills: housingBills,     loading: loadingHousing     },
		ai:          { bills: techBills,        loading: loadingTech        },
		education:   { bills: educationBills,   loading: loadingEducation   },
		environment: { bills: environmentBills, loading: loadingEnvironment },
	};

	const { bills: activeBills, loading: isLoading } = billsMap[activeTopic];

	const recentlyActiveCount = allBills?.filter((bill) => {
		const d = new Date(bill.latest_action_date || bill.introduced);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return d > weekAgo;
	}).length ?? 0;

	if (!userPreferences?.selectedState) {
		return (
			<div className="text-center py-20">
				<Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<p className="text-base text-muted-foreground">
					Set up your profile with a home state to see personalized bills.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Tab header */}
			<div className="space-y-1">
				<h2 className="text-2xl sm:text-3xl font-bold text-foreground">
					What's happening in {userStateName}
				</h2>
				<p className="text-base text-muted-foreground">
					Active legislation from your state legislature, sorted by recent activity.
				</p>
			</div>

			{/* Stats strip */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Active Bills</p>
					<p className="text-3xl font-black text-foreground">{allBills?.length ?? "—"}</p>
					<p className="text-xs text-muted-foreground mt-0.5">in {userStateName} right now</p>
				</div>
				<div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Updated This Week</p>
					<p className="text-3xl font-black text-foreground">{recentlyActiveCount}</p>
					<p className="text-xs text-muted-foreground mt-0.5">bills with new activity</p>
				</div>
				<div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">You've Saved</p>
					<p className="text-3xl font-black text-foreground">{savedBills.length}</p>
					<p className="text-xs text-muted-foreground mt-0.5">bills to track</p>
				</div>
				<div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Trending</p>
					<p className="text-3xl font-black text-foreground">
						{allBills?.filter((b) => b.trendingReason === "Trending").length ?? "—"}
					</p>
					<p className="text-xs text-muted-foreground mt-0.5">gaining momentum now</p>
				</div>
			</div>

			{/* Topic filter pills */}
			<div className="flex items-center gap-2 flex-wrap">
				{TOPICS.map(({ label, value, icon: Icon }) => (
					<button
						key={value}
						onClick={() => setActiveTopic(value)}
						className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 ${
							activeTopic === value
								? "bg-foreground text-background border-foreground"
								: "bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground"
						}`}>
						<Icon className="h-3.5 w-3.5" />
						{label}
					</button>
				))}
			</div>

			{/* View switcher + count */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{isLoading
						? "Loading…"
						: `${activeBills?.length ?? 0} bill${activeBills?.length !== 1 ? "s" : ""}`}
				</p>
				<BillViewSwitcher value={viewMode} onValueChange={setViewMode} />
			</div>

			{/* Bills grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => <BillCardSkeleton key={i} />)}
				</div>
			) : activeBills && activeBills.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{activeBills.map((bill) => (
						<BillCard
							key={bill.id}
							bill={bill}
							showSource
							showProgressBar
							showTrendingReason
							viewMode={viewMode}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
					<TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
					<p className="font-semibold text-foreground mb-1">No bills found</p>
					<p className="text-sm text-muted-foreground">
						No {activeTopic !== "all" ? activeTopic : ""} bills are currently active in {userStateName}.
					</p>
				</div>
			)}

			{/* Saved bills with recent updates */}
			{savedBills.some((sb) => {
				const d = new Date(sb.billData.latest_action_date || "");
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				return d > weekAgo;
			}) && (
				<div className="space-y-4 pt-4 border-t-2 border-border">
					<div className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-muted-foreground" />
						<h3 className="text-lg font-bold text-foreground">Your saved bills — recent updates</h3>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{savedBills
							.filter((sb) => {
								const d = new Date(sb.billData.latest_action_date || "");
								const weekAgo = new Date();
								weekAgo.setDate(weekAgo.getDate() - 7);
								return d > weekAgo;
							})
							.slice(0, 3)
							.map((sb) => (
								<BillCard
									key={sb.billId}
									bill={sb.billData}
									showSource
									showProgressBar
									viewMode={viewMode}
								/>
							))}
					</div>
				</div>
			)}

		</div>
	);
};

export default StateBillsTab;
