import type { Bill } from "../hooks/useBills";
import usStates from "../data/usStates";
import { useBillSummary } from "../hooks/useBillSummary";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Clock, Gavel, XCircle, CheckCircle2, Calendar, Building2 } from "lucide-react";

import {formatDate, toSentenceCase}  from '../lib/utils'

interface BillCardProps {
	bill: Bill;
}


const BillCard = ({ bill }: BillCardProps) => {
	console.log("New bill", bill);

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

	const flagUrl = stateInfo
		? stateInfo.flagUrl
		: "https://placehold.co/32x24/cccccc/333333?text=N/A";

	const getProgressValue = (bill: Bill): number => {
		if (bill.enacted_date) return 100;
		if (bill.senate_passage_date) return 75;
		if (bill.house_passage_date) return 50;
		if (bill.introduced) return 25;
		return 0;
	};

	const progressValue = getProgressValue(bill);
	
	// Enhanced status badge with better visual hierarchy
	const StatusBadge = ({ outcome }: { outcome: string }) => {
		if (outcome === "Passed") {
			return (
				<Badge className='gap-1.5 pl-2.5 pr-3 py-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors'>
					<CheckCircle2 className='h-3.5 w-3.5' />
					Passed
				</Badge>
			);
		}
		if (outcome === "Failed") {
			return (
				<Badge className='gap-1.5 pl-2.5 pr-3 py-1.5 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-colors'>
					<XCircle className='h-3.5 w-3.5' />
					Failed
				</Badge>
			);
		}
		return (
			<Badge className='gap-1.5 pl-2.5 pr-3 py-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors'>
				<Clock className='h-3.5 w-3.5' />
				In Progress
			</Badge>
		);
	};

	// Enhanced summary section with better loading states
	const SummarySection = () => {
		if (summaryLoading) {
			return (
				<div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
					<div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-400 border-t-transparent"></div>
					<span className="text-sm text-slate-400">AI is analyzing this bill...</span>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className="flex items-center justify-between p-4 rounded-lg bg-red-950/20 border border-red-900/30">
					<span className="text-sm text-red-400">Unable to generate summary</span>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={retrySummary}
						className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-950/30"
					>
						<RefreshCw className="h-3 w-3 mr-1.5" />
						Retry
					</Button>
				</div>
			);
		}

		if (summary) {
			return (
				<div className="p-4 rounded-lg bg-gradient-to-br from-violet-950/20 to-blue-950/20 border border-violet-900/30">
					<div className="flex items-center mb-3">
						<div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 mr-2">
							<Sparkles className="h-3.5 w-3.5 text-violet-400" />
						</div>
						<span className="text-sm font-medium text-violet-300">
							AI Summary
						</span>
					</div>
					<p className="text-sm text-slate-300 leading-relaxed">
						{summary}
					</p>
				</div>
			);
		}

		return (
			<div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 border-dashed">
				<p className="text-sm text-slate-500 text-center">Summary not available</p>
			</div>
		);
	};

	return (
		<Card className='group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 hover:border-violet-500/30'>
			{/* Subtle background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			
			<CardHeader className="relative pb-4">
				{/* Header with state flag and status */}
				<div className='flex items-start justify-between gap-4 mb-4'>
					<div className="flex items-center gap-3">
						<Avatar className='w-10 h-10 border-2 border-slate-600/50 shadow-lg rounded-xl bg-slate-800 ring-2 ring-violet-500/10'>
							<AvatarImage
								src={flagUrl}
								alt={`${bill.jurisdiction.name} flag`}
								className='object-cover rounded-lg'
							/>
							<AvatarFallback className='bg-slate-700 text-slate-300 text-xs rounded-lg'>
								{bill.jurisdiction.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-1">
							<Badge variant="secondary" className="w-fit bg-slate-700/50 text-slate-300 border-slate-600/50">
								<Building2 className="h-3 w-3 mr-1" />
								{bill.jurisdiction.name}
							</Badge>
							<Badge variant="outline" className="w-fit bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
								{toSentenceCase(bill.subject[0])}
							</Badge>
						</div>
					</div>
					
					<StatusBadge outcome={bill.finalOutcome} />
				</div>

				{/* Bill title and identifier */}
				<div className='space-y-2'>
					<div className="text-sm font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded w-fit">
						{bill.identifier}
					</div>
					<CardTitle className='text-xl leading-tight text-slate-100 group-hover:text-white transition-colors'>
						{toSentenceCase(bill.title)}
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className='relative space-y-6'>
				{/* AI Summary Section */}
				<div>
					<h3 className='text-base font-semibold text-slate-200 mb-3 flex items-center'>
						<span className="w-1 h-4 bg-gradient-to-b from-violet-400 to-blue-400 rounded-full mr-3"></span>
						What this bill does
					</h3>
					<SummarySection />
				</div>

				{/* Progress Section - Minimal changes as requested */}
				<div className='space-y-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30'>
					<h3 className='text-sm font-medium text-slate-300 flex items-center'>
						<Gavel className='mr-2 h-4 w-4 text-slate-400' />
						Legislative Progress
					</h3>
					
					<div className='relative flex justify-between text-[10px] font-medium text-slate-500 mb-2'>
						<span className='text-center w-1/4'>Introduced</span>
						<span className='text-center w-1/4'>House</span>
						<span className='text-center w-1/4'>Senate</span>
						<span className='text-center w-1/4'>Enacted</span>
					</div>
					
					<Progress
						value={progressValue}
						className='h-2.5 w-full bg-slate-700/50 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-blue-500'
					/>
					
					<div className='relative flex justify-between text-xs text-slate-400 mt-2'>
						<span className='text-center w-1/4'>
							{formatDate(bill.first_action_date) || "—"}
						</span>
						<span className='text-center w-1/4'>
							{formatDate(bill.house_passage_date) || "—"}
						</span>
						<span className='text-center w-1/4'>
							{formatDate(bill.senate_passage_date) || "—"}
						</span>
						<span className='text-center w-1/4'>
							{formatDate(bill.enacted_date) || "—"}
						</span>
					</div>
				</div>

				{/* Footer information */}
				<div className="flex flex-col gap-3 pt-2 border-t border-slate-700/30">
					<div className='flex items-center text-xs text-slate-400'>
						<Calendar className="h-3 w-3 mr-1.5" />
						Last updated {formatDate(bill.latest_action_date) || "Unknown"}
					</div>

					{bill.sources && bill.sources.length > 0 && (
						<div className='flex flex-wrap gap-2 items-center'>
							<span className="text-xs text-slate-500">Sources:</span>
							{bill.sources.map((src, idx) => (
								<Badge
									key={idx}
									variant='outline'
									className='text-xs bg-slate-800/50 text-slate-400 border-slate-600/50 hover:border-slate-500/50 transition-colors'>
									{src}
								</Badge>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default BillCard;