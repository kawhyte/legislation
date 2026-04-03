import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserData } from "../contexts/UserContext";
import useBills from "../hooks/useBills";
import BillCard from "@/components/BillCard";
import BillCardSkeleton from "@/components/BillCardSkeleton";
import YourRepsWidget from "./YourRepsWidget";
import { parseLocationInput } from "../utils/zipToJurisdiction";
import {
	Activity,
	HeartPulse,
	Home,
	Brain,
	GraduationCap,
	Leaf,
	LayoutGrid,
	TrendingUp,
	Users,
} from "lucide-react";
import usStates from "../data/usStates";
import type { States } from "./JurisdictionSelector";

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
	const [activeTopic, setActiveTopic] = useState<TopicValue>("all");

	const userStateObj = userPreferences?.selectedState
		? (usStates.find((s) => s.abbreviation === userPreferences.selectedState) as States | null)
		: null;

	// Resolve stored zip code to lat/lng coords for rep lookup
	const [zipCoords, setZipCoords] = useState<{ lat: number; lng: number } | null>(null);
	useEffect(() => {
		if (!userPreferences?.zipCode) { setZipCoords(null); return; }
		parseLocationInput(userPreferences.zipCode)
			.then(result => { if (result.zipCoords) setZipCoords(result.zipCoords); })
			.catch(() => setZipCoords(null));
	}, [userPreferences?.zipCode]);

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
		if (!bill.latest_action_date) return false;
		const d = new Date(bill.latest_action_date);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return d > weekAgo;
	}).length ?? 0;

	const gainingMomentumCount = allBills?.filter((b) =>
		b.momentum?.level != null && ['High', 'Passed', 'Enacted'].includes(b.momentum.level)
	).length ?? 0;

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
					Bills your state is working on right now, sorted by latest activity.
				</p>
			</div>

			{/* Stats strip */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Moving Fast</p>
					<p className="text-3xl font-black text-foreground">{allBills ? gainingMomentumCount : "—"}</p>
					<p className="text-xs text-muted-foreground mt-0.5">bills picking up speed</p>
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
					<p className="text-xs text-muted-foreground mt-0.5">bills in the spotlight</p>
				</div>
			</div>

			{/* Your Representatives */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<Users className="h-5 w-5 text-muted-foreground" />
					<h3 className="text-lg font-bold text-foreground">Your Representatives</h3>
				</div>
				{zipCoords ? (
					<YourRepsWidget coords={zipCoords} stateName={userStateName} layout="horizontal" />
				) : (
					<div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
						<p className="text-sm font-semibold text-foreground">See who represents you in {userStateName}</p>
						<p className="text-xs text-muted-foreground mt-1">
							Add your zip code in{" "}
							<Link to="/profile-setup" className="underline font-medium hover:text-foreground transition-colors">
								Profile
							</Link>{" "}
							to see who represents you and how they vote.
						</p>
					</div>
				)}
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

			{/* Bill count */}
			<p className="text-sm text-muted-foreground">
				{isLoading ? "Loading…" : `${activeBills?.length ?? 0} bill${activeBills?.length !== 1 ? "s" : ""}`}
			</p>

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
							viewMode="detailed"
						/>
					))}
				</div>
			) : (
				<div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
					<TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
					<p className="font-semibold text-foreground mb-1">No bills found</p>
					<p className="text-sm text-muted-foreground">
						No {activeTopic !== "all" ? activeTopic : ""} bills are active in {userStateName} right now.
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
						<h3 className="text-lg font-bold text-foreground">Recent updates on your saved bills</h3>
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
									viewMode="detailed"
								/>
							))}
					</div>
				</div>
			)}

		</div>
	);
};

export default StateBillsTab;
