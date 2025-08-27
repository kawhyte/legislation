// src/components/BillCard.tsx
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
import {
	RefreshCw,
	Sparkles,
	Link,
	Flame,
	Calendar,
	ArrowUp,
	ArrowDown,
	Zap,
} from "lucide-react";
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
import type { BillCardProps } from "@/types";

const getDomainFromUrl = (url: string) => {
	try {
		const hostname = new URL(url).hostname;
		return hostname.replace(/^www\./, "");
	} catch (error) {
		console.error("Invalid source URL:", url, error);
		return "Official Source";
	}
};

const BillCard = ({
	bill,
	showProgressBar = true,
	showFooter = false,
	showTrendingReason = false,
}: BillCardProps) => {
	const {
		summary,
		impacts,
		isLoading: summaryLoading,
		error: summaryError,
		generateSummary,
		cleanup,
	} = useBillSummary(bill, {
		maxLength: 150,
		targetAge: "30-40",
	});

	const democratVotes = 102;
	const republicanVotes = 88;
	const otherVotes = 12;
	const totalVotes = democratVotes + republicanVotes + otherVotes;
	const demPercent = (democratVotes / totalVotes) * 100;
	const repPercent = (republicanVotes / totalVotes) * 100;
	const otherPercent = (otherVotes / totalVotes) * 100;

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
		(state) =>
			state.name.toLowerCase() === bill?.jurisdiction?.name.toLowerCase()
	);
	const flagUrl = stateInfo?.flagUrl || "https://placehold.co/32x24";
	const flagAbbreviation = stateInfo?.abbreviation || "NA";

	const AIAnalysisContent = () => {
		if (summaryLoading) {
			return (
				<div className='flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]'>
					<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
					<p className='text-lg font-medium text-foreground'>
						Analyzing Legislation
					</p>
					<p className='text-sm text-muted-foreground'>
						Our AI is decoding the details...
					</p>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className='p-6 text-center'>
					<p className='text-lg font-medium text-destructive mb-2'>
						Analysis Failed
					</p>
					<p className='text-sm text-muted-foreground mb-4'>
						Unable to generate the analysis at this time.
					</p>
					<Button
						variant='outline'
						onClick={generateSummary}
						className='border-destructive/30 text-destructive hover:bg-destructive/10'>
						<RefreshCw className='h-4 w-4 mr-2' />
						Retry Analysis
					</Button>
				</div>
			);
		}

		if (summary) {
			return (
				<div className='space-y-4 p-1'>
					<div className='bg-accent/50 border border-border rounded-lg p-4'>
						<p className='text-base text-foreground leading-relaxed'>
							{summary}
						</p>
					</div>

					{impacts && impacts.length > 0 && (
						<div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
							<p className='text-sm font-bold text-blue-600 mb-3'>
								Potential Impact if Passed
							</p>
							<div className='space-y-3'>
								{impacts.map((impact, i) => (
									<div key={i} className='flex items-start gap-3'>
										<div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0'></div>
										<p className='text-sm text-foreground/80 leading-relaxed'>
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
		<Card className=' bg-muted border hover:border-border/80 hover:shadow-lg transition-all duration-300 flex flex-col h-full'>
			<CardHeader className='p-4 space-y-1'>
				{/* --- TOP LINE METADATA --- */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2 text-xs text-muted-foreground'>
						<Avatar className='w-6 h-6 border border-border rounded-md'>
							<AvatarImage src={flagUrl} alt={bill?.jurisdiction?.name} />
							<AvatarFallback className='text-xs bg-muted text-muted-foreground'>
								{bill?.jurisdiction?.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className='font-medium text-foreground/80'>
							{flagAbbreviation}
						</span>
						<span>•</span>
						<span className='font-mono'>{bill.identifier}</span>
					</div>
					<TooltipProvider>
						<BookmarkButton bill={bill} />
					</TooltipProvider>
				</div>

				{/* --- BILL TITLE (PRIMARY) --- */}
				<CardTitle className='text-base font-semibold line-clamp-3 h-12 text-foreground leading-snug'>
					{toSentenceCase(bill.title)}
				</CardTitle>

				{/* --- SECONDARY METADATA --- */}
				<div className='flex justify-start items-center gap-2'>
					{showTrendingReason && bill.trendingReason && (
						<div className='flex items-center gap-2 text-amber-600/90 flex-shrink min-w-0 mr-2'>
							<Zap className='h-4 w-4 flex-shrink-0 ' />
							<span className='capitalize font-medium truncate text-sm'>
								{bill.trendingReason}
							</span>
						</div>
					)}
					{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
				</div>
			</CardHeader>

			<CardContent className='flex-grow flex flex-col justify-end space-y-2 p-4 pt-0'>
				{showProgressBar && <BillProgressStepper bill={bill} />}

				<div className='flex items-center gap-2 mt-2'>
					<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
						<DialogTrigger asChild>
							<Button onClick={handleDecodeClick} className='w-full' size='sm'>
								<Sparkles className='h-4 w-4 mr-1' />
								Explain this Bill
							</Button>
						</DialogTrigger>
						<DialogContent className='bg-card sm:max-w-[625px]'>
							<DialogHeader>
								<DialogTitle className='flex items-center gap-3'>
									<Sparkles className='h-5 w-5 text-primary' />
									<span className='text-sm font-medium text-muted-foreground'>
										Powered by AI to find what matters
									</span>
								</DialogTitle>
							</DialogHeader>
							<div className='max-h-[70vh] overflow-y-auto p-1 pr-4'>
								<AIAnalysisContent />
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
			<div className='w-full px-5'>
				<label className='text-sm  font-mono  text-foreground/80 block mb-2'>
					Votes by Party
				</label>
				<div className='flex flex-wrap items-center gap-2'>
					{/* Democrat Pill */}
					<div className='flex items-center gap-2.5 px-2 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200'>
						<span className='font-bold text-xs'>DEM</span>
						<span className='font-semibold text-sm'>{democratVotes}</span>
					</div>

					{/* Republican Pill */}
					<div className='flex items-center gap-2.5 px-2 py-1 rounded-full bg-red-50 text-red-800 border border-red-200'>
						<span className='font-bold text-xs'>REP</span>
						<span className='font-semibold text-sm'>{republicanVotes}</span>
					</div>

					{/* Other Pill */}
					<div className='flex items-center gap-2.5 px-2 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200'>
						<span className='font-bold text-xs'>OTHER</span>
						<span className='font-semibold text-sm'>{otherVotes}</span>
					</div>
				</div>
			</div>

			{showFooter && (
				<CardFooter className='p-4 pt-2'>
					<div className='flex items-center justify-between w-full'>
						<div>
							{bill.sources && bill.sources.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-xs text-muted-foreground hover:text-foreground'>
											<Link className='h-3 w-3 mr-1.5' />
											<span>
												{bill.sources.length} Official Source
												{bill.sources.length > 1 ? "s" : ""}
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='start'>
										{bill.sources
											.filter((source) => source.note !== "API Details")
											.map((source, index) => (
												<DropdownMenuItem key={index} asChild>
													<a
														href={source.url}
														target='_blank'
														rel='noopener noreferrer'>
														{source.note || getDomainFromUrl(source.url)}
													</a>
												</DropdownMenuItem>
											))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>

						<div>
							{bill.latest_action_date && (
								<div className='flex items-center text-xs text-muted-foreground'>
									<Calendar className='h-3 w-3 mr-1.5' />
									<span>
										{new Date(bill.latest_action_date).toLocaleDateString(
											"en-US",
											{ month: "short", day: "numeric", year: "numeric" }
										)}
									</span>
								</div>
							)}
						</div>
					</div>
				</CardFooter>
			)}
		</Card>
	);
};

export default BillCard;
