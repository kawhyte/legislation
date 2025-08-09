// BillCardCompact.tsx - Improved Version
import type { Bill } from "../hooks/useBills";
import usStates from "../data/usStates";
import { useBillSummary } from "../hooks/useBillSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	RefreshCw,
	Sparkles,
	Gavel,
	Calendar,
	Brain,
	ChevronRight,
	FileText,
} from "lucide-react";
import { useEffect } from "react";
import BillProgressBar from "./BillProgressBar";
import StatusBadge from "./StatusBadge";
import BookmarkButton from "./BookmarkButton";
import { formatDate, toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";

interface BillCardProps {
	bill: Bill;
}

const BillCardCompact = ({ bill }: BillCardProps) => {
	const {
		summary,
		impacts,
		isLoading: summaryLoading,
		error: summaryError,
		generateSummary,
		cleanup,
	} = useBillSummary(bill.title, {
		maxLength: 150,
		targetAge: "18-40",
	});

	useEffect(() => {
		return () => {
			if (cleanup) cleanup();
		};
	}, [cleanup, bill.id]);

	const stateInfo = usStates.find(
		(state) => state.name.toLowerCase() === bill.jurisdiction.name.toLowerCase()
	);
	const flagUrl = stateInfo?.flagUrl || "https://placehold.co/32x24";
	const flagAbbreviation = stateInfo?.abbreviation || "NA";

	const LoadingDots = () => (
		<div className='flex items-center space-x-1'>
			<div className='w-1 h-1 bg-violet-400 rounded-full animate-pulse'></div>
			<div className='w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-75'></div>
			<div className='w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-150'></div>
		</div>
	);

	const AIAnalysisSection = () => {
		if (!summary && !summaryLoading && !summaryError) {
			return (
				<div className='bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-400/20 rounded-lg p-3'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Brain className="h-4 w-4 text-violet-400" />
							<span className="text-sm font-medium text-slate-200">AI Analysis</span>
						</div>
						<Button
							onClick={generateSummary}
							size='sm'
							className='bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white text-xs px-3 py-1.5 h-auto'>
							<Sparkles className='h-3 w-3 mr-1' />
							Decode Bill
							<ChevronRight className='h-3 w-3 ml-1' />
						</Button>
					</div>
					<p className="text-xs text-slate-400 mt-2">
						Get an AI-powered breakdown of what this bill actually does
					</p>
				</div>
			);
		}

		if (summaryLoading) {
			return (
				<div className='bg-violet-500/5 border border-violet-400/20 rounded-lg p-3'>
					<div className='flex items-center gap-3'>
						<div className='w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin'></div>
						<div className='flex-1'>
							<div className='flex items-center gap-2 mb-1'>
								<Brain className="h-4 w-4 text-violet-400" />
								<span className="text-sm font-medium text-slate-200">AI Analysis</span>
							</div>
							<p className='text-xs text-violet-400 flex items-center gap-1'>
								Analyzing legislation <LoadingDots />
							</p>
						</div>
					</div>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className='bg-red-500/5 border border-red-400/20 rounded-lg p-3'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Brain className="h-4 w-4 text-red-400" />
							<span className="text-sm font-medium text-red-400">Analysis Failed</span>
						</div>
						<Button 
							variant='outline' 
							size='sm' 
							onClick={generateSummary}
							className='text-xs px-3 py-1.5 h-auto border-red-400/30 text-red-400 hover:bg-red-500/10'>
							<RefreshCw className='h-3 w-3 mr-1' />
							Retry
						</Button>
					</div>
					<p className='text-xs text-red-400/80 mt-1'>
						Unable to generate analysis
					</p>
				</div>
			);
		}

		if (summary) {
			return (
				<div className='bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-400/20 rounded-lg p-3 space-y-3'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Brain className="h-4 w-4 text-violet-400" />
							<span className="text-sm font-medium text-slate-200">AI Analysis</span>
						</div>
						<Button
							variant='ghost'
							size='sm'
							onClick={generateSummary}
							className='text-xs px-2 py-1 h-auto text-violet-400 hover:text-violet-300 hover:bg-violet-500/10'>
							<RefreshCw className='h-3 w-3 mr-1' />
							Refresh
						</Button>
					</div>
					
					<div className='bg-slate-800/40 border border-slate-600/30 rounded-md p-2.5'>
						<p className='text-xs text-slate-100 leading-relaxed'>{summary}</p>
					</div>
					
					{impacts?.length > 0 && (
						<div className='bg-blue-500/5 border border-blue-400/20 rounded-md p-2.5'>
							<p className='text-xs font-medium text-blue-400 mb-2'>
								Potential Impact if Passed
							</p>
							<div className='grid grid-cols-1 gap-1'>
								{impacts.slice(0, 3).map((impact, i) => (
									<div key={i} className='flex items-start gap-2'>
										<div className='w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0'></div>
										<p className='text-xs text-slate-300 leading-relaxed'>{impact}</p>
									</div>
								))}
								{impacts.length > 3 && (
									<p className='text-xs text-blue-400/70 mt-1'>
										+{impacts.length - 3} more impacts
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			);
		}

		return null;
	};

	return (
		<Card className='bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 hover:border-slate-600/60 transition-all duration-200'>
			<CardHeader className='pb-3'>
				{/* Compact header row */}
				<div className='flex items-center justify-between mb-2'>
					<div className='flex items-center gap-2'>
						<Avatar className='w-7 h-7 border border-slate-600 rounded-md'>
							<AvatarImage src={flagUrl} alt={bill.jurisdiction.name} />
							<AvatarFallback className='text-xs'>
								{bill.jurisdiction.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='flex items-center gap-1.5 text-xs text-slate-400'>
							<span className='font-medium'>{flagAbbreviation}</span>
							<span>•</span>
							<span className='font-mono'>{bill.identifier}</span>
							{bill.sources?.length > 0 && (
								<>
									<span>•</span>
									<div className='flex items-center gap-1'>
										<FileText className='h-3 w-3' />
										<span>{bill.sources.length}</span>
									</div>
								</>
							)}
						</div>
					</div>
					<div className='flex items-center gap-2'>
						{/* <span className='text-xs text-slate-500'>
							{formatDate(bill.latest_action_date) || "Unknown"}
						</span> */}
						<BookmarkButton
							className='h-6 w-6 p-0 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10'
							bill={bill}
						/>
					</div>
				</div>

				{/* Status badges */}
				<div className='flex items-center gap-2 mb-3'>
					<StatusBadge bill={bill} showMomentum={true} />
					{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
				</div>

				{/* Title */}
				<CardTitle className='text-sm font-semibold line-clamp-2 text-slate-100 leading-tight'>
					{toSentenceCase(bill.title)}
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-4 pt-0'>
				<BillProgressBar bill={bill} />
				<AIAnalysisSection />
			</CardContent>
		</Card>
	);
};

export default BillCardCompact;