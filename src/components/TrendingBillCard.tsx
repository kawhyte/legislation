import type { Bill } from "../hooks/useBills";
import { Card } from "@/components/ui/card";
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
		<Card className='group relative bg-slate-800/50 border-slate-700/50 p-4 transition-all duration-300 hover:bg-slate-800 hover:border-violet-500/50'>
			{/* Subtle glow effect on hover */}
			<div className='absolute  rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md' />
			
			<div className='relative z-10 flex flex-col justify-between h-full space-y-4'>
				{/* Header */}
				<div className='flex justify-between items-start gap-2 '>
					<div className='flex-1'>
						<div className='flex justify-between items-center mb-7'>
							<div className='flex items-center gap-2 text-xs text-slate-400 font-mono'>
								<Avatar className='w-5 h-5 border border-slate-700'>
									<AvatarImage src={flagUrl} alt={bill.jurisdiction.name} />
									<AvatarFallback className='text-[0.6rem] bg-slate-700'>
										{flagName}
									</AvatarFallback>
								</Avatar>
								<span>{flagName} . {bill.identifier}</span>
							</div>
							{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
						</div>
						<h3 className='font-semibold text-sm text-slate-100 leading-tight line-clamp-2'>
							{toSentenceCase(bill.title)}
						</h3>
					</div>
					<BookmarkButton bill={bill} className='text-slate-400 hover:text-yellow-400' />
				</div>

				{/* Footer */}
				<div className='space-y-3 pt-4'>
					<TinyBillProgressBar bill={bill} />
				</div>
			</div>
		</Card>
	);
};

export default TrendingBillCard;
