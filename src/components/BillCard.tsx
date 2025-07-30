import type { Bill } from "../hooks/useBills";
import usStates from "../data/usStates";
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

interface BillCardProps {
	bill: Bill;
}

const toSentenceCase = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};



const BillCard = ({ bill }: BillCardProps) => {
	
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

	return (
		<Card className='w-full'>
			<CardHeader className='flex flex-row items-center gap-3 space-y-0 pb-2'>
				<Avatar className='w-8 h-8'>
					<AvatarImage src={flagUrl} alt={`${bill.jurisdiction.name} flag`} />
					<AvatarFallback>N/A</AvatarFallback>
				</Avatar>
				<CardTitle className='text-blue-700 font-semibold text-sm'>
					{bill.jurisdiction.name
						? `${bill.jurisdiction.name} - ${bill.identifier}`
						: "N/A"}
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-3 pt-4'>
				{/* <div className='flex justify-between text-xs text-gray-500'>
                    <span>Introduced: {bill.introduced || "N/A"}</span>
                    <span>Status: {bill.status || "N/A"}</span>
                </div> */}

				{/* New Progress Section */}
				<div className='mt-4 space-y-2'>
					<div className='relative flex justify-between text-[10px] font-medium text-gray-600'>
						<span className='text-center w-1/4'>Introduced</span>
						<span className='text-center w-1/4'>House</span>
						<span className='text-center w-1/4'>Senate</span>
						<span className='text-center w-1/4'>Became Law</span>
					</div>
					<Progress value={progressValue} className='h-2 w-full bg-gray-200 mb-2' />
					<div className='relative flex justify-between text-xs text-gray-500 mt-1'>
						<span className='text-center w-1/4'>
							{bill.introduced || "N/A"}
						</span>
						{/* Assuming you have a 'house_passage_date' and 'senate_passage_date' in your Bill type */}
						{/* For now, using placeholder or N/A if not available */}
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
				{/* End New Progress Section */}

				<CardDescription className='text-xs text-gray-700 line-clamp-5'>
					{bill.title ? toSentenceCase(bill.title) : "N/A"}
				</CardDescription>
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
