import type { Bill } from "../hooks/useBills";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";
import TinyBillProgressBar from "./TinyBillProgressBar";
import BookmarkButton from "./BookmarkButton";
import usStates from "../data/usStates";

interface TrendingBillCardProps {
	bill: Bill;
}

const TrendingBillCard = ({ bill }: TrendingBillCardProps) => {
	const stateInfo = usStates.find(
		(state) => state.name.toLowerCase() === bill.jurisdiction.name.toLowerCase()
	);
	const flagName = stateInfo?.name || "NA";
	const flagUrl = stateInfo?.flagUrl;

	

	return (
		<Card className='group relative bg-slate-800/50 border-slate-700/50 p-4 transition-all duration-300 hover:bg-slate-800 hover:border-violet-500/50 flex flex-col'>
			{/* Subtle glow effect on hover */}
			<div className='absolute -inset-px rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md -z-10' />
			
			<BookmarkButton bill={bill} className='absolute top-3 right-3 text-slate-500 hover:text-yellow-400 z-20' />

			<div className='relative z-10 flex flex-col flex-grow space-y-4'>
				{/* Top Row: Bill ID */}
				<div className='flex items-center gap-2 text-xs text-slate-400 font-mono'>
					<Avatar className='w-5 h-5 border border-slate-700'>
						<AvatarImage src={flagUrl} alt={bill.jurisdiction.name} />
						<AvatarFallback className='text-[0.6rem] bg-slate-700'>
							{flagName}
						</AvatarFallback>
					</Avatar>
					<span>{flagName} • {bill.identifier}</span>
				</div>


				{/* Status Row: Trending Reason and Momentum */}
				<div className='flex justify-between items-center gap-4 text-xs'>
					{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
					{bill.trendingReason ? (
						<div className="flex items-center gap-2 text-amber-400/90 flex-shrink min-w-0">
							<Flame className="h-4 w-4 flex-shrink-0" />
							<span className="capitalize font-medium truncate">{bill.trendingReason}</span>
						</div>
					) : <div />} 

				</div>
				{/* Middle Section: Title */}
				<div className='flex-grow'>
					<h3 className='font-semibold text-sm text-slate-100 leading-tight line-clamp-3'>
						{toSentenceCase(bill.title)}
					</h3>
				</div>

				{/* Footer: Progress Bar */}
				<div className='pt-2'>
					<TinyBillProgressBar bill={bill} />
				</div>
			</div>
		</Card>
	);
};

export default TrendingBillCard;
