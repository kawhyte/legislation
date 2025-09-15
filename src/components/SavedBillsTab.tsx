import React, { useState } from "react";
import { useUserData } from "../contexts/UserContext";
import BillCard from "@/components/BillCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
	Search,
	Bookmark,
	Trash2,
	Filter,
	SortAsc,
	Calendar,
	MapPin,
} from "lucide-react";

const SavedBillsTab: React.FC = () => {
	const { savedBills, removeSavedBill } = useUserData();
	const [searchQuery, setSearchQuery] = useState("");
	const filterStatus = "all";
	const [sortBy, setSortBy] = useState<"date" | "title" | "state">("date");

	// Extract bill data from savedBills for filtering and sorting
	const bills = savedBills.map(savedBill => savedBill.billData);

	// Filter and search logic
	const filteredBills = bills.filter((bill) => {
		const matchesSearch =
			bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			bill.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(bill.jurisdiction?.name ?? "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesFilter =
			filterStatus === "all" ||
			(bill.status ?? "")
				.toLowerCase()
				.includes((filterStatus as string).toLowerCase());

		return matchesSearch && matchesFilter;
	});

	// Sort logic
	const sortedBills = [...filteredBills].sort((a, b) => {
		switch (sortBy) {
			case "title":
				return a.title.localeCompare(b.title);
			case "state":
				return (a.jurisdiction?.name ?? "").localeCompare(
					b.jurisdiction?.name ?? ""
				);
			case "date":
			default: {
				// For saved bills, we can also sort by savedAt date
				const savedBillA = savedBills.find(sb => sb.billId === a.id);
				const savedBillB = savedBills.find(sb => sb.billId === b.id);
				if (savedBillA && savedBillB) {
					return new Date(savedBillB.savedAt).getTime() - new Date(savedBillA.savedAt).getTime();
				}
				return (
					new Date(b.latest_action_date || "").getTime() -
					new Date(a.latest_action_date || "").getTime()
				);
			}
		}
	});

	const handleClearAll = () => {
		toast.error("Are you sure you want to remove all saved bills? This action cannot be undone.", {
			action: {
				label: "Delete All",
				onClick: async () => {
					try {
						const clearPromises = savedBills.map(savedBill => 
							removeSavedBill(savedBill.billId)
						);
						await Promise.all(clearPromises);
						toast.success(`Successfully removed ${savedBills.length} saved bills`);
					} catch (error) {
						console.error('Error clearing all bills:', error);
						toast.error("Failed to remove saved bills. Please try again.");
					}
				}
			},
			cancel: {
				label: "Cancel",
				onClick: () => {
					// Toast automatically dismisses
				}
			},
			duration: 10000, // 10 seconds timeout
		});
	};

	if (savedBills.length === 0) {
		return (
			<div className='text-center py-20'>
				<div className='flex justify-center mb-8'>
					<div className='w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center border border-border'>
						<Bookmark className='h-12 w-12 text-muted-foreground' />
					</div>
				</div>
				<h2 className='text-2xl sm:text-3xl font-bold text-foreground mb-6'>
					No Saved Bills Yet
				</h2>
				<p className='text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed'>
					Start bookmarking bills that interest you to keep track of
					important legislation.
				</p>
				<Button onClick={() => window.history.back()} className="px-6 py-3">Browse Bills</Button>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			{/* Header */}
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div className="space-y-2">
						<h2 className='text-2xl sm:text-3xl font-bold text-foreground'>
							Your Saved Bills
						</h2>
						<p className='text-lg text-muted-foreground'>
							You have {savedBills.length} bill{savedBills.length !== 1 ? "s" : ""}{" "}
							saved for later
						</p>
					</div>
					<Button
						onClick={handleClearAll}
						variant='outline'
						className='text-destructive border-destructive/50 hover:bg-destructive/10'>
						<Trash2 className='h-4 w-4 mr-2' />
						Remove All
					</Button>
				</div>

				{/* Enhanced Search and Filters Section */}
				<div className='bg-muted/50 border border-border rounded-lg p-6 space-y-6'>
					<div className="flex items-center gap-3">
						
						<h3 className="text-lg font-semibold text-foreground">Search & Filter Your Bills</h3>
					</div>
					
					<div className='flex flex-col lg:flex-row gap-6'>
						{/* Search */}
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								type='text'
								placeholder='Search by title, bill number, or state...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10 py-3 bg-background border-border'
							/>
						</div>

						{/* Sort Options */}
						<div className='flex flex-col sm:flex-row gap-3'>
							<span className="text-sm font-medium text-muted-foreground self-center">Sort by:</span>
							<div className='flex gap-2'>
								<Button
									variant={sortBy === "date" ? "default" : "outline"}
									size='sm'
									onClick={() => setSortBy("date")}
									className='gap-2'>
									<Calendar className='h-4 w-4' /> Date
								</Button>
								<Button
									variant={sortBy === "title" ? "default" : "outline"}
									size='sm'
									onClick={() => setSortBy("title")}
									className='gap-2'>
									<SortAsc className='h-4 w-4' /> Title
								</Button>
								<Button
									variant={sortBy === "state" ? "default" : "outline"}
									size='sm'
									onClick={() => setSortBy("state")}
									className='gap-2'>
									<MapPin className='h-4 w-4' /> State
								</Button>
							</div>
						</div>
					</div>

					{/* Results count */}
					{searchQuery && (
						<div className='pt-2 border-t border-border'>
							<Badge variant='outline' className="bg-accent text-accent-foreground">
								{sortedBills.length} result{sortedBills.length !== 1 ? "s" : ""} found
							</Badge>
						</div>
					)}
				</div>
			</div>

			{/* Bills Grid */}
			{sortedBills.length > 0 ? (
				<div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6'>
					{sortedBills.map((bill) => (
						<BillCard showSource key={bill.id} bill={bill} />
					))}
				</div>
			) : (
				<div className='text-center py-20'>
					<div className='flex justify-center mb-6'>
						<div className='w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center border border-border'>
							<Filter className='h-10 w-10 text-muted-foreground' />
						</div>
					</div>
					<h3 className='text-xl font-semibold text-foreground mb-4'>
						No bills match your search
					</h3>
					<p className='text-muted-foreground mb-6'>
						Try adjusting your search terms or clear the search to see all saved bills
					</p>
					<Button onClick={() => setSearchQuery("")} variant='outline' className="px-6 py-3">
						Clear Search
					</Button>
				</div>
			)}
		</div>
	);
};

export default SavedBillsTab;