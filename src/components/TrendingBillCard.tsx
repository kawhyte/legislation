import type { Bill } from "../hooks/useBills";
import { Card } from "@/components/ui/card";
import { Flame, Brain, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";
import TinyBillProgressBar from "./TinyBillProgressBar";
import BookmarkButton from "./BookmarkButton";
import usStates from "../data/usStates";
import { useBillSummary } from "../hooks/useBillSummary";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "./ui/button";

interface TrendingBillCardProps {
	bill: Bill;
}

const TrendingBillCard = ({ bill }: TrendingBillCardProps) => {
	if (!bill.jurisdiction) {
		return null;
	}



	const stateInfo = usStates.find(
		(state) => state.name.toLowerCase() === bill.jurisdiction.name.toLowerCase()
	);
	const flagName = stateInfo?.name || "NA";
	const flagUrl = stateInfo?.flagUrl;

	const { isBookmarked } = useBookmarks();

	// --- AI Summary Logic (copied from BillCard.tsx) ---
	const {
		summary,
		impacts,
		isLoading: summaryLoading,
		error: summaryError,
		generateSummary,
		cleanup,
	} = useBillSummary(bill, {
		maxLength: 150,
		targetAge: "18-40",
	});

	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		return () => {
			if (cleanup) cleanup();
		};
	}, [cleanup, bill.id]);

	const handleDecodeClick = () => {
		if (!summary && !summaryLoading && !summaryError) {
			generateSummary();
		}
		setIsModalOpen(true);
	};

	const AIAnalysisContent = () => {
		if (summaryLoading) {
			return (
				<div className='flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]'>
					<div className='w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin'></div>
					<p className='text-lg font-medium text-slate-200'>Analyzing Legislation</p>
					<p className='text-sm text-slate-400'>Our AI is decoding the details...</p>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className='p-6 text-center'>
					<p className='text-lg font-medium text-red-400 mb-2'>Analysis Failed</p>
					<p className='text-sm text-slate-400 mb-4'>Unable to generate the analysis at this time.</p>
					<Button 
						variant='outline' 
						onClick={generateSummary}
						className='border-red-400/30 text-red-400 hover:bg-red-500/10'>
						<RefreshCw className='h-4 w-4 mr-2' />
						Retry Analysis
					</Button>
				</div>
			);
		}

		if (summary) {
			return (
				<div className='space-y-4 p-1'>
					<div className='bg-slate-800/50 border border-slate-700/50 rounded-lg p-4'>
						<p className='text-base text-slate-100 leading-relaxed'>{summary}</p>
					</div>
					
					{impacts?.length > 0 && (
						<div className='bg-blue-900/30 border border-blue-500/30 rounded-lg p-4'>
							<p className='text-sm font-bold text-blue-300 mb-3'>
								Potential Impact if Passed
							</p>
							<div className='space-y-3'>
								{impacts.map((impact, i) => (
									<div key={i} className='flex items-start gap-3'>
										<div className='w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0'></div>
										<p className='text-sm text-slate-300 leading-relaxed'>{impact}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			);
		}
		return null;
	};

	return (
		<Card className='group relative bg-slate-800/50 border-slate-700/50 p-4 transition-all duration-300 hover:bg-slate-800 hover:border-violet-500/50 flex flex-col'>
			<div className='absolute -inset-px rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md -z-10' />
			
			<div className="absolute top-3 right-3 flex items-center gap-1 z-20">
				<TooltipProvider delayDuration={200}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" onClick={handleDecodeClick} className="h-7 w-7 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10">
								<Brain className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Get AI-Powered Analysis</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-700 text-white sm:max-w-[625px]">
						<DialogHeader>
							<DialogTitle className='flex items-center gap-3'>
								<Sparkles className="h-5 w-5 text-violet-400" />
								<span className='text-xl'>AI-Powered Analysis</span>
							</DialogTitle>
						</DialogHeader>
						<div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
							<AIAnalysisContent />
						</div>
					</DialogContent>
				</Dialog>
				
				<BookmarkButton bill={bill} className="h-7 w-7" />
			</div>

			<div className='relative z-10 flex flex-col flex-grow space-y-4'>
				{/* Top Row: Bill ID */}
				<div className='flex items-center gap-2 text-xs text-slate-400 font-mono pr-16'>
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
					{bill.trendingReason ? (
						<div className="flex items-center gap-2 text-amber-400/90 flex-shrink min-w-0">
							<Flame className="h-4 w-4 flex-shrink-0" />
							<span className="capitalize font-medium truncate">{bill.trendingReason}</span>
						</div>
					) : <div />} 

					{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
				</div>
				{/* Middle Section: Title */}
				<div className='flex-grow'>
					<h3 className='font-semibold text-base text-slate-100 leading-tight line-clamp-3'>
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