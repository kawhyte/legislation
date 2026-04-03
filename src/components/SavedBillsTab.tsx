import React, { useState } from "react";
import { useUserData } from "../contexts/UserContext";
import BillCard from "@/components/BillCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
	Search,
	Bookmark,
	Trash2,
	SortAsc,
	Calendar,
	MapPin,
	Plus,
	Zap,
	Clock,
} from "lucide-react";

interface SavedBillsTabProps {
	onSwitchToExplore?: () => void;
}

const MOMENTUM_ORDER: Record<string, number> = {
	'Enacted': 5, 'Passed': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Stalled': 0,
};

const SavedBillsTab: React.FC<SavedBillsTabProps> = ({ onSwitchToExplore }) => {
	const { savedBills, removeSavedBill } = useUserData();
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"date" | "title" | "state" | "momentum">("date");

	const bills = savedBills.map((sb) => sb.billData);

	// Stats computed from saved bills only
	const savedUpdatedThisWeek = savedBills.filter((sb) => {
		if (!sb.billData.latest_action_date) return false;
		const d = new Date(sb.billData.latest_action_date);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return d > weekAgo;
	}).length;

	const savedGainingMomentum = savedBills.filter((sb) =>
		sb.billData.momentum?.level != null &&
		["High", "Passed", "Enacted"].includes(sb.billData.momentum.level)
	).length;

	// Filter
	const filteredBills = bills.filter((bill) =>
		bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		bill.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(bill.jurisdiction?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Sort
	const sortedBills = [...filteredBills].sort((a, b) => {
		switch (sortBy) {
			case "title":
				return a.title.localeCompare(b.title);
			case "state":
				return (a.jurisdiction?.name ?? "").localeCompare(b.jurisdiction?.name ?? "");
			case "momentum": {
				const aLevel = a.momentum?.level ?? "";
				const bLevel = b.momentum?.level ?? "";
				return (MOMENTUM_ORDER[bLevel] ?? -1) - (MOMENTUM_ORDER[aLevel] ?? -1);
			}
			case "date":
			default: {
				const savedBillA = savedBills.find((sb) => sb.billId === a.id);
				const savedBillB = savedBills.find((sb) => sb.billId === b.id);
				if (savedBillA && savedBillB) {
					return new Date(savedBillB.savedAt).getTime() - new Date(savedBillA.savedAt).getTime();
				}
				return new Date(b.latest_action_date || "").getTime() - new Date(a.latest_action_date || "").getTime();
			}
		}
	});

	const handleClearAll = () => {
		toast.error("Remove all saved bills?", {
			description: "This will permanently delete all your saved bills and cannot be undone.",
			action: {
				label: "Yes, Remove All",
				onClick: async () => {
					try {
						await Promise.all(savedBills.map((sb) => removeSavedBill(sb.billId)));
						toast.success(`Removed ${savedBills.length} saved bills`);
					} catch {
						toast.error("Failed to remove saved bills. Please try again.");
					}
				},
			},
			cancel: { label: "Cancel", onClick: () => {} },
			duration: 10000,
		});
	};

	if (savedBills.length === 0) {
		return (
			<div className='text-center py-20'>
				<div className='flex justify-center mb-6'>
					<div className='w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center border-2 border-border'>
						<Bookmark className='h-10 w-10 text-muted-foreground' />
					</div>
				</div>
				<h2 className='text-2xl font-bold text-foreground mb-3'>No saved bills yet</h2>
				<p className='text-base text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed'>
					Bookmark bills you care about so you can track them here.
				</p>
				<Button onClick={onSwitchToExplore} className='px-6 py-3'>Browse Bills</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-start justify-between'>
				<div className='space-y-1'>
					<h2 className='text-2xl sm:text-3xl font-bold text-foreground'>Your Saved Bills</h2>
					<p className='text-base text-muted-foreground'>
						You're tracking {savedBills.length} bill{savedBills.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Button
					onClick={onSwitchToExplore}
					className='border-2 border-foreground bg-primary text-primary-foreground font-semibold shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150'>
					<Plus className='h-4 w-4 mr-2' />
					Add More Bills
				</Button>
			</div>

			{/* Stats strip */}
			<div className='grid grid-cols-2 gap-4'>
				<div className='bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center gap-3'>
					<div className='w-9 h-9 rounded-lg bg-primary/20 border-2 border-foreground flex items-center justify-center flex-shrink-0'>
						<Clock className='h-4 w-4 text-foreground' />
					</div>
					<div>
						<p className='text-2xl font-black text-foreground leading-none'>{savedUpdatedThisWeek}</p>
						<p className='text-xs text-muted-foreground mt-0.5'>updated this week</p>
					</div>
				</div>
				<div className='bg-card border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))] flex items-center gap-3'>
					<div className='w-9 h-9 rounded-lg bg-primary/20 border-2 border-foreground flex items-center justify-center flex-shrink-0'>
						<Zap className='h-4 w-4 text-foreground' />
					</div>
					<div>
						<p className='text-2xl font-black text-foreground leading-none'>{savedGainingMomentum}</p>
						<p className='text-xs text-muted-foreground mt-0.5'>gaining momentum</p>
					</div>
				</div>
			</div>

			{/* Search + Sort + View in one row */}
			<div className='flex flex-col lg:flex-row gap-3'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						type='text'
						placeholder='Search by title, bill number, or state...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-10 border-2 border-foreground bg-card shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus-visible:ring-0 focus-visible:shadow-none focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] transition-all'
					/>
				</div>
				<div className='flex items-center gap-2 flex-wrap'>
					<span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Sort</span>
					{(
						[
							{ value: "date",     label: "Date",     icon: Calendar },
							{ value: "momentum", label: "Momentum", icon: Zap      },
							{ value: "title",    label: "Title",    icon: SortAsc  },
							{ value: "state",    label: "State",    icon: MapPin   },
						] as const
					).map(({ value, label, icon: Icon }) => (
						<button
							key={value}
							onClick={() => setSortBy(value)}
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 ${
								sortBy === value
									? "bg-foreground text-background border-foreground"
									: "bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground"
							}`}>
							<Icon className='h-3.5 w-3.5' />
							{label}
						</button>
					))}
					</div>
			</div>

			{/* Search results count */}
			{searchQuery && (
				<p className='text-sm text-muted-foreground'>
					{sortedBills.length} result{sortedBills.length !== 1 ? "s" : ""} for "{searchQuery}"
				</p>
			)}

			{/* Bills Grid */}
			{sortedBills.length > 0 ? (
				<div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6'>
					{sortedBills.map((bill) => (
						<BillCard showSource key={bill.id} bill={bill} viewMode="detailed" />
					))}
				</div>
			) : (
				<div className='text-center py-20'>
					<div className='flex justify-center mb-6'>
						<div className='w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center border-2 border-border'>
							<Search className='h-10 w-10 text-muted-foreground' />
						</div>
					</div>
					<h3 className='text-xl font-semibold text-foreground mb-4'>No bills match your search</h3>
					<p className='text-muted-foreground mb-6'>Try adjusting your search terms or clear the search</p>
					<Button onClick={() => setSearchQuery("")} variant='outline' className='px-6 py-3'>
						Clear Search
					</Button>
				</div>
			)}

			{/* Remove All — de-emphasised at the bottom */}
			<div className='flex justify-center pt-4 border-t border-border'>
				<button
					onClick={handleClearAll}
					className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors duration-150'>
					<Trash2 className='h-3.5 w-3.5' />
					Remove all saved bills
				</button>
			</div>
		</div>
	);
};

export default SavedBillsTab;
