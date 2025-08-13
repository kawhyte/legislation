import { useEffect, useState } from "react";
import usStates from "../data/usStates";
import { useBillSummary } from "../hooks/useBillSummary";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Link, Flame } from "lucide-react"; // Removed unused icons
import BillProgressStepper from "./BillProgressStepper";
import BookmarkButton from "./BookmarkButton";
import { toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {  BillCardProps } from "@/types";

const getDomainFromUrl = (url: string) => {
	try {
		const hostname = new URL(url).hostname;
		return hostname.replace(/^www\./, "");
	} catch (error) {
		console.error("Invalid source URL:", url, error);
		return "Official Source";
	}
};

const BillCard = ({ bill, showProgressBar = true, showTrendingReason = false }: BillCardProps) => {
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

	const stateInfo = usStates.find(
		(state) => state.name.toLowerCase() === bill?.jurisdiction?.name.toLowerCase()
	);
	const flagUrl = stateInfo?.flagUrl || "https://placehold.co/32x24";
	const flagAbbreviation = stateInfo?.abbreviation || "NA";

	const AIAnalysisContent = () => {
		if (summaryLoading) {
			return (
				<div className='flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]'>
					<div className='w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin'></div>
					<p className='text-lg font-medium text-slate-200'>
						Analyzing Legislation
					</p>
					<p className='text-sm text-slate-400'>
						Our AI is decoding the details...
					</p>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className='p-6 text-center'>
					<p className='text-lg font-medium text-red-400 mb-2'>
						Analysis Failed
					</p>
					<p className='text-sm text-slate-400 mb-4'>
						Unable to generate the analysis at this time.
					</p>
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
						<p className='text-base text-slate-100 leading-relaxed'>
							{summary}
						</p>
					</div>

					{impacts && impacts.length > 0 && (
						<div className='bg-blue-900/30 border border-blue-500/30 rounded-lg p-4'>
							<p className='text-sm font-bold text-blue-300 mb-3'>
								Potential Impact if Passed
							</p>
							<div className='space-y-3'>
								{impacts.map((impact, i) => (
									<div key={i} className='flex items-start gap-3'>
										<div className='w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0'></div>
										<p className='text-sm text-slate-300 leading-relaxed'>
											{impact}
										</p>
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
		<Card className='bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 hover:border-slate-600/60 transition-all duration-200 flex flex-col h-full'>
			<CardHeader className='p-4 -mt-4 space-y-3'>
				{/* --- TOP LINE METADATA --- */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2 text-xs text-slate-400'>
						<Avatar className='w-6 h-6 border border-slate-600 rounded-md'>
							<AvatarImage src={flagUrl} alt={bill?.jurisdiction?.name} />
							<AvatarFallback className='text-xs'>
								{bill?.jurisdiction?.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className='font-medium'>{flagAbbreviation}</span>
						<span>•</span>
						<span className='font-mono'>{bill.identifier}</span>
					</div>
					<TooltipProvider>
						<BookmarkButton className='h-8 w-8 p-0' bill={bill} />
					</TooltipProvider>
				</div>

				{/* --- BILL TITLE (PRIMARY) --- */}
				<CardTitle className='text-base font-bold line-clamp-3 h-12 text-slate-50 leading-snug'>
					{toSentenceCase(bill.title)}
				</CardTitle>

				{/* --- SECONDARY METADATA --- */}
				<div className='flex items-center gap-2'>
					{showTrendingReason && bill.trendingReason && (
						<div className="flex items-center gap-2 text-amber-400/90 flex-shrink min-w-0">
							<Flame className="h-4 w-4 flex-shrink-0" />
							<span className="capitalize font-medium truncate w-60">{bill.trendingReason}</span>
						</div>
					)}
					{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
				</div>
			</CardHeader>

			<CardContent className='flex-grow flex flex-col justify-between space-y-4 p-4 pt-0'>
				{showProgressBar && <BillProgressStepper bill={bill} />}

				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						<Button
							onClick={handleDecodeClick}
							className='w-full' // Using default primary button style
						>
							<Sparkles className='h-4 w-4 mr-2' />
							Explain This Bill
						</Button>
					</DialogTrigger>
					<DialogContent className='bg-slate-900/95 backdrop-blur-xl border-slate-700 text-white sm:max-w-[625px]'>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-3'>
								<Sparkles className='h-5 w-5 text-violet-400' />
								<span className='text-xl'>
									Powered by AI to find what matters
								</span>
							</DialogTitle>
						</DialogHeader>
						<div className='max-h-[70vh] overflow-y-auto p-1 pr-4'>
							<AIAnalysisContent />
						</div>
					</DialogContent>
				</Dialog>
			</CardContent>

			<CardFooter className=''>
				<div className='flex items-center justify-start w-full -ml-2 -mt-4 -mb-2'>
					{bill.sources && bill.sources.length > 0 && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='sm'
									className='text-xs text-slate-400 hover:text-slate-200'>
									<Link className='h-3 w-3 mr-2' />

									{bill.sources?.length > 0 && (
										<div className='flex items-center gap-1.5 text-xs text-slate-500'>
											<span>
												{bill.sources.length} Official Source
												{bill.sources.length > 1 ? "s" : ""}
											</span>
										</div>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='start'
								className='bg-slate-800 border-slate-700 text-slate-200'>
								{bill.sources
									.filter((source) => source.note !== "API Details")
									.map((source, index) => (
										<DropdownMenuItem key={index} asChild>
											<a
												href={source.url}
												target='_blank'
												rel='noopener noreferrer'
												className='hover:bg-slate-700/50'>
												{source.note || getDomainFromUrl(source.url)}
											</a>
										</DropdownMenuItem>
									))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</CardFooter>
		</Card>
	);
};

export default BillCard;