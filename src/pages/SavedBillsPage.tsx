import React, { useState } from "react";
import { useBookmarks } from "../contexts/BookmarkContext";
import BillCard from "@/components/BillCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Bookmark,
	Trash2,
	Filter,
	SortAsc,
	Calendar,
	MapPin,
} from "lucide-react";

const SavedBillsPage: React.FC = () => {
	const { bookmarkedBills, clearAllBookmarks, bookmarkCount } = useBookmarks();
	const [searchQuery, setSearchQuery] = useState("");
	const filterStatus = "all";
	const [sortBy, setSortBy] = useState<"date" | "title" | "state">("date");

	// Filter and search logic
	const filteredBills = bookmarkedBills.filter((bill) => {
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
			default:
				return (
					new Date(b.latest_action_date || "").getTime() -
					new Date(a.latest_action_date || "").getTime()
				);
		}
	});

	const handleClearAll = () => {
		if (
			window.confirm(
				"Are you sure you want to remove all saved bills? This action cannot be undone."
			)
		) {
			clearAllBookmarks();
		}
	};

	if (bookmarkCount === 0) {
		return (
		<div className='min-h-screen bg-background'>
                <div className='container mx-auto px-4 py-8'>
                    <div className='text-center py-16'>
                        <div className='flex justify-center mb-6'>
                            <div className='w-20 h-20 bg-muted rounded-full flex items-center justify-center'>
								<Bookmark className='h-10 w-10 text-slate-600' />
							</div>
						</div>
                        <h2 className='text-2xl font-bold text-foreground mb-4'>
							No Saved Bills Yet
						</h2>
                        <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
							Start bookmarking bills that interest you to keep track of
							important legislation.
						</p>
						<Button
							onClick={() => window.history.back()}
							>
							Browse Bills
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
<div className='min-h-screen bg-background'>			
	<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-6'>
						<div>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>
								Saved Bills
							</h1>
							 <p className='text-muted-foreground'>
								You have {bookmarkCount} bill{bookmarkCount !== 1 ? "s" : ""} saved for
								later review
							</p>
						</div>
						<Button
							onClick={handleClearAll}
							variant='outline'
							className='text-destructive border-destructive/50 hover:bg-destructive/10'>
							<Trash2 className='h-4 w-4 mr-2' />
							Clear All
						</Button>
					</div>

					{/* Search and Filters */}
					<div className='flex flex-col md:flex-row gap-4'>
						{/* Search */}
						<div className='relative flex-1'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								type='text'
								placeholder='Search saved bills...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10 bg-slate-400/50 border-slate-400/50 '
							/>
						</div>

						{/* Sort */}
						  <div className='flex gap-2'>
                            {/* NOTE: This sorting logic with variants is already theme-aware. No changes needed. */}
                            <Button variant={sortBy === "date" ? "secondary" : "outline"} size='sm' onClick={() => setSortBy("date")} className='gap-2'>
                                <Calendar className='h-4 w-4' /> Date
                            </Button>
                            <Button variant={sortBy === "title" ? "secondary" : "outline"} size='sm' onClick={() => setSortBy("title")} className='gap-2'>
                                <SortAsc className='h-4 w-4' /> Title
                            </Button>
                            <Button variant={sortBy === "state" ? "secondary" : "outline"} size='sm' onClick={() => setSortBy("state")} className='gap-2'>
                                <MapPin className='h-4 w-4' /> State
                            </Button>
                        </div>
					</div>

					{/* Results count */}
					{searchQuery && (
						<div className='mt-4'>
							<Badge
								variant='outline'
								>
								{sortedBills.length} result{sortedBills.length !== 1 ? "s" : ""}{" "}
								found
							</Badge>
						</div>
					)}
				</div>

				{/* Bills Grid */}
				{sortedBills.length > 0 ? (
					<div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6'>
						{sortedBills.map((bill) => (
							<BillCard showSource key={bill.id} bill={bill} />
						))}
					</div>
				) : (
					<div className='text-center py-16'>
						 <div className='text-muted-foreground mb-4'>
							<Filter className='h-12 w-12 mx-auto mb-4' />
							No bills match your search criteria
						</div>
						<Button
							onClick={() => setSearchQuery("")}
							variant='outline'
							>
							Clear Search
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SavedBillsPage;
