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

// --- Lucide Icons (as inline SVGs) ---
const Scale = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}>
		<path d='m16 16 3-8 3 8c-2 1-4 1-6 0' />
		<path d='M2 16h3' />
		<path d='M11 16h3' />
		<path d='M12 3v18' />
		<path d='M3 7h2' />
		<path d='M9 7h2' />
		<path d='M5 16c-2.2 0-4-1.8-4-4s1.8-4 4-4' />
		<path d='M19 16c2.2 0 4-1.8 4-4s-1.8-4-4-4' />
	</svg>
);
const CheckCircle2 = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}>
		<path d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' />
		<path d='m9 12 2 2 4-4' />
	</svg>
);
const XCircle = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}>
		<circle cx='12' cy='12' r='10' />
		<path d='m15 9-6 6' />
		<path d='m9 9 6 6' />
	</svg>
);
const Clock = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		{...props}>
		<circle cx='12' cy='12' r='10' />
		<polyline points='12 6 12 12 16 14' />
	</svg>
);
const Gavel = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		strokeWidth={2}
		{...props}>
		<path d='M14 4l6 6M3 21l6-6m1.5-1.5l7-7M16.5 7.5l-7 7' />
		<path d='M3 21h7v-2H3v2z' />
	</svg>
);

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
	const StatusBadge = ({ outcome }) => {
		if (outcome === "Passed") {
			return (
				<Badge variant='success' className='gap-1.5 pl-2'>
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
			<Badge variant='info' className='gap-1.5 pl-2'>
				<Clock className='h-3.5 w-3.5' />
				In Progress
			</Badge>
		);
	};

	<Avatar className='w-8 h-8'>
		<AvatarImage src={flagUrl} alt={`${bill.jurisdiction.name} flag`} />
		<AvatarFallback>N/A</AvatarFallback>
	</Avatar>;
	return (
		<Card className='flex flex-col transition-shadow duration-300 hover:shadow-xl dark:bg-gray-900/60'>
			<CardHeader>
				<div className='flex flex-row-reverse items-start justify-between gap-4 mb-3'>
					<StatusBadge outcome={bill.finalOutcome} />

					<CardDescription className='pt-1 font-medium text-purple-600 dark:text-purple-400'>
						<Badge variant={"secondary"}> {bill.subject}</Badge>
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
				<div className='flex-1 line-clamp-3'>
					<CardTitle className='text-xl text-gray-800 dark:text-gray-100'>
						{bill.identifier}: {bill.title}
					</CardTitle>
					{/* <CardDescription className='pt-1 font-medium text-purple-600 dark:text-purple-400'>
							{bill.subject}
						</CardDescription> */}
				</div>
			</CardHeader>
			<CardContent className='flex flex-col flex-grow gap-8'>
				<div>
					<h3 className='text-base font-semibold text-gray-700 dark:text-gray-300 mb-2'>
						The simple version:
					</h3>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						{" "}
						{bill.title ? toSentenceCase(bill.title) : "N/A"}
					</p>
				</div>
				{/* New Progress Section */}
				<div className='mt-4 space-y-2'>
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

				{/* <CardDescription className='text-xs text-gray-700 line-clamp-5'>
					{bill.title ? toSentenceCase(bill.title) : "N/A"}
				</CardDescription> */}

				<div>
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
