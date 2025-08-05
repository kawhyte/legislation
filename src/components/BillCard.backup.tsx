import type { Bill } from "../hooks/useBills";
import usStates from "../data/usStates";
import { useBillSummary } from "../hooks/useBillSummary";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Clock,Gavel,XCircle, CheckCircle2 } from "lucide-react";

interface BillCardProps {
	bill: Bill;
}








const toSentenceCase = (text: string) => {
	if (!text) return "";
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const impact = [
	"Promotes cleaner energy sources like wind and solar.",
	"Could lead to more green energy jobs in the state.",
	"May affect the cost of your electricity bill.",
];

const BillCard = ({ bill }: BillCardProps) => {
	console.log("New bill", bill);

	// Use the AI summary hook
	const { 
		summary, 
		isLoading: summaryLoading, 
		error: summaryError, 
		retry: retrySummary 
	} = useBillSummary(bill.title, {
		enabled: true,
		maxLength: 150,
		targetAge: "18-40"
	});

	const stateInfo = usStates.find(
		(state) => state.name.toLowerCase() === bill.jurisdiction.name.toLowerCase()
	);

	// Get the flag URL, or a placeholder if not found
	const flagUrl = stateInfo
		? stateInfo.flagUrl
		: "https://placehold.co/32x24/cccccc/333333?text=N/A"; // Placeholder for missing flag

	// Determine the progress value based on the bill's dates.
	// This is more reliable than parsing the status string.
	const getProgressValue = (bill: Bill): number => {
		if (bill.enacted_date) return 100;
		if (bill.senate_passage_date) return 75;
		if (bill.house_passage_date) return 50;
		if (bill.introduced) return 25;
		return 0;
	};

	const progressValue = getProgressValue(bill);
	
	// --- Helper Component for Status Badge ---
	const StatusBadge = ({ outcome }: { outcome: string }) => {
		if (outcome === "Passed") {
			return (
				<Badge variant='outline' className='gap-1.5 pl-2 bg-green-100 text-green-800 border-green-300'>
					<CheckCircle2 className='h-3.5 w-3.5' />
					Passed
				</Badge>
			);
		}
		if (outcome === "Failed") {
			return (
				<Badge variant='destructive' className='gap-1.5 pl-2'>
					<XCircle className='h-3.5 w-3.5' />
					Failed
				</Badge>
			);
		}
		return (
			<Badge variant='outline' className='gap-1.5 pl-2'>
				<Clock className='h-3.5 w-3.5' />
				In Progress
			</Badge>
		);
	};

	// Summary Display Component
	const SummarySection = () => {
		if (summaryLoading) {
			return (
				<div className="flex items-center space-x-2">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
					<span className="text-sm text-gray-500">AI is summarizing...</span>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className="flex items-center justify-between">
					<span className="text-sm text-red-500">Failed to generate summary</span>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={retrySummary}
						className="h-6 px-2"
					>
						<RefreshCw className="h-3 w-3 mr-1" />
						Retry
					</Button>
				</div>
			);
		}

		if (summary) {
			return (
				<div className="relative">
					<div className="flex items-center mb-2">
						<Sparkles className="h-4 w-4 text-purple-500 mr-2" />
						<span className="text-sm font-medium text-purple-600 dark:text-purple-400">
							AI Summary
						</span>
					</div>
					<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
						{summary}
					</p>
				</div>
			);
		}

		return null;
	};

	return (
		<Card className='flex flex-col transition-shadow duration-300 hover:shadow-xl dark:bg-gray-900/60'>
			<CardHeader>
				<div className='flex flex-row-reverse items-start justify-between gap-4 mb-3'>
					<StatusBadge outcome={bill.finalOutcome} />

					<CardDescription className='pt-1 font-medium text-purple-600 dark:text-purple-400'>
						<Badge variant={"secondary"}> {toSentenceCase(bill.subject[0])}</Badge>
					</CardDescription>
					<Avatar className='w-9 h-9 border-2 border-gray-50 dark:border-gray-700 shadow-sm rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center'>
						<AvatarImage
							src={flagUrl}
							alt={`${bill.jurisdiction.name} flag`}
							className='object-cover rounded-md'
						/>
						<AvatarFallback className='bg-gray-50 dark:bg-gray-600 text-gray-100 text-xs rounded-md'>
							N/A
						</AvatarFallback>
					</Avatar>
				</div>
				<div className='flex-1 line-clamp-2'>
					<CardTitle className='text-xl text-gray-800 dark:text-gray-100'>
						{bill.identifier}: {bill.title}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className='flex flex-col flex-grow gap-6'>
				{/* AI Summary Section */}
				<div>
					<h3 className='text-base font-semibold text-gray-700 dark:text-gray-300 mb-3'>
						What this bill does:
					</h3>
					<SummarySection />
				</div>

	{/* Impact Section */}
				<div>
					<h3 className='mb-2 flex items-center text-base font-semibold text-gray-700 dark:text-gray-300'>
						<Gavel className='mr-2 h-5 w-5 text-gray-500' />
						<span>If this becomes law...</span>
					</h3>
					<ul className='list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400'>
						{impact.map((point) => (
							<li key={point}>{point}</li>
						))}
					</ul>
				</div>



				{/* Progress Section */}
				<div className='space-y-2'>
					<div className='relative flex justify-between text-[10px] font-medium text-gray-600'>
						<span className='text-center w-1/4'>Introduced</span>
						<span className='text-center w-1/4'>House</span>
						<span className='text-center w-1/4'>Senate</span>
						<span className='text-center w-1/4'>Became Law</span>
					</div>
					<Progress
						value={progressValue}
						className='h-2 w-full bg-gray-200 mb-2'
					/>
					<div className='relative flex justify-between text-xs text-gray-500 mt-1'>
						<span className='text-center w-1/4'>
							{bill.first_action_date || "N/A"}
						</span>
						<span className='text-center w-1/4'>
							{bill.house_passage_date || "N/A"}
						</span>
						<span className='text-center w-1/4'>
							{bill.senate_passage_date || "N/A"}
						</span>
						<span className='text-center w-1/4'>
							{bill.enacted_date || "N/A"}
						</span>
					</div>
				</div>

			

				<p className='text-xs text-gray-700'>
					Last activity posted on{" "}
					{bill.latest_action_date ? bill.latest_action_date : "N/A"}
				</p>

				<div className='text-xs text-gray-500 flex flex-wrap gap-2 items-center'>
					Bill Source(s):
					{bill.sources && bill.sources.length > 0 ? (
						bill.sources.map((src, idx) => (
							<Badge
								key={idx}
								variant='secondary'
								className='bg-blue-100 text-blue-800 font-medium'>
								{src}
							</Badge>
						))
					) : (
						<span>N/A</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default BillCard;