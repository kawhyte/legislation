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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Link, Zap, Users, Wallet, Scale } from "lucide-react";
import BillProgressStepper from "./BillProgressStepper";
import BookmarkButton from "./BookmarkButton";
import { toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";
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
import VoteByParty from "./VoteByParty";

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
	showVotes = false,
	showSource = false,
	showTrendingReason = false,
	viewMode = "detailed",
}: BillCardProps) => {
	const {
		structured,
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

	// Determine display props based on viewMode
	const shouldShowProgressBar =
		viewMode === "detailed" ? showProgressBar : false;
	const shouldShowSource = viewMode === "detailed" ? showSource : false;

	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		return () => {
			if (cleanup) cleanup();
		};
	}, [cleanup, bill.id]);

	const handleDecodeClick = () => {
		if (!structured && !summaryLoading && !summaryError) {
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
					<p className='text-lg font-medium text-foreground'>Analyzing Legislation</p>
					<p className='text-sm text-muted-foreground'>Our AI is decoding the details...</p>
				</div>
			);
		}

		if (summaryError) {
			return (
				<div className='p-6 text-center'>
					<p className='text-lg font-medium text-destructive mb-2'>Analysis Failed</p>
					<p className='text-sm text-muted-foreground mb-4'>
						Unable to generate the analysis at this time.
					</p>
					<Button
						variant='outline'
						onClick={generateSummary}
						className='text-destructive border-destructive/50 hover:bg-destructive/10'>
						<RefreshCw className='h-4 w-4 mr-2' />
						Retry Analysis
					</Button>
				</div>
			);
		}

		if (structured) {
			const hasDebate =
				structured.controversy.for.length > 0 ||
				structured.controversy.against.length > 0;

			return (
				<div className='space-y-3 p-1'>
					{/* The Gist */}
					<div className='bg-muted border border-border rounded-lg p-4'>
						<p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1'>
							The Gist
						</p>
						<p className='text-sm text-foreground leading-relaxed'>{structured.gist}</p>
					</div>

					{/* Who it Affects */}
					<div className='flex items-center gap-2 px-1'>
						<Users className='h-4 w-4 text-muted-foreground flex-shrink-0' />
						<span className='text-xs text-muted-foreground font-medium'>Who it Affects:</span>
						<Badge variant='secondary' className='text-xs'>{structured.whoItAffects}</Badge>
					</div>

					{/* Wallet Impact */}
					<div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-1'>
							<Wallet className='h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0' />
							<p className='text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide'>
								Wallet Impact
							</p>
						</div>
						<p className='text-sm text-foreground leading-relaxed'>{structured.walletImpact}</p>
					</div>

					{/* The Debate */}
					{hasDebate && (
						<div className='border border-border rounded-lg p-4'>
							<div className='flex items-center gap-2 mb-3'>
								<Scale className='h-4 w-4 text-muted-foreground flex-shrink-0' />
								<p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
									The Debate
								</p>
							</div>
							<div className='grid grid-cols-2 gap-3'>
								{structured.controversy.for.length > 0 && (
									<div>
										<p className='text-xs font-semibold text-green-600 dark:text-green-400 mb-1'>For</p>
										<ul className='space-y-1'>
											{structured.controversy.for.map((point, i) => (
												<li key={i} className='flex items-start gap-1.5'>
													<span className='text-green-500 mt-0.5 flex-shrink-0'>+</span>
													<span className='text-xs text-foreground/80 leading-relaxed'>{point}</span>
												</li>
											))}
										</ul>
									</div>
								)}
								{structured.controversy.against.length > 0 && (
									<div>
										<p className='text-xs font-semibold text-red-600 dark:text-red-400 mb-1'>Against</p>
										<ul className='space-y-1'>
											{structured.controversy.against.map((point, i) => (
												<li key={i} className='flex items-start gap-1.5'>
													<span className='text-red-500 mt-0.5 flex-shrink-0'>−</span>
													<span className='text-xs text-foreground/80 leading-relaxed'>{point}</span>
												</li>
											))}
										</ul>
									</div>
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
		<Card className='bg-card border-border hover:border-border/80 hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:bg-bill-card-accent-subtle'>
			{" "}
			<CardHeader className='p-4 space-y-3'>
				{/* --- TOP METADATA ROW --- */}
				<div className='flex items-center justify-between'>
					{/* Left side: State and Bill ID */}
					<div className='flex items-center gap-3'>
						<Avatar className='w-7 h-7 border border-border rounded-md shrink-0'>
							<AvatarImage src={flagUrl} alt={bill?.jurisdiction?.name} />
							<AvatarFallback className='text-xs bg-muted text-muted-foreground font-medium'>
								{bill?.jurisdiction?.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<span className='font-medium text-foreground/90'>
								{flagAbbreviation}
							</span>
							<span className='text-muted-foreground/60'>•</span>
							<span className='font-mono font-medium'>{bill.identifier}</span>
						</div>
					</div>

					{/* Right side: Actions */}
					<div className='flex items-center gap-2'>
						{/* {showTrendingReason && bill.trendingReason === "Trending" && (
							<div className='flex items-center gap-1.5 text-xs font-semibold bg-accent-yellow text-on-yellow px-3 py-1 rounded-full border border-accent-yellow-bolder/20'>
								<Zap className='h-3 w-3' />
								<span>Trending</span>
							</div>
						)} */}
						{/* <TooltipProvider> */}
						<BookmarkButton bill={bill} />
						{/* </TooltipProvider> */}
					</div>
				</div>

				{/* --- BILL TITLE (PRIMARY) --- */}
				<CardTitle className='text-base font-semibold line-clamp-3 text-foreground leading-relaxed'>
					{toSentenceCase(bill.title)}
				</CardTitle>

				{/* --- SECONDARY METADATA --- */}

				<div className='flex gap-8 items-center'>
					{bill.momentum && (
						<div className='flex justify-start items-center'>
							<MomentumBadge momentum={bill.momentum} />
						</div>
					)}

					{showTrendingReason && bill.trendingReason === "Trending" && (
						<div className='flex items-center gap-1.5 text-xs font-semibold bg-accent-yellow text-on-yellow px-3 py-1 rounded-full border border-accent-yellow-bolder/20'>
							<Zap className='h-3 w-3' />
							<span>Trending</span>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className='flex-grow flex flex-col justify-end space-y-3 p-4 pt-0'>
				{shouldShowProgressBar && <BillProgressStepper bill={bill} />}

				<div className='flex items-center gap-3 mt-3'>
					<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={handleDecodeClick}
								className='w-full bg-primary text-primary-foreground hover:bg-primary-hover border border-accent-magenta-bolder/20'
								size='sm'>
								<Sparkles className='h-4 w-4 mr-1' />
								Explain this Bill
							</Button>
						</DialogTrigger>
						<DialogContent className='bg-card sm:max-w-[625px]'>
							<DialogHeader>
								<DialogTitle className='flex items-center gap-3'>
									<Sparkles className='h-5 w-5 text-bill-card-action' />
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
			{showVotes && (
				<VoteByParty
					democratVotes={democratVotes}
					republicanVotes={republicanVotes}
					otherVotes={otherVotes}
				/>
			)}
			{shouldShowSource && (
				<CardFooter className='p-4 pt-2'>
					<div className='flex items-center justify-between w-full'>
						<div>
							{bill.sources && bill.sources.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-8px-rhythm-xs text-muted-foreground hover:text-foreground'>
											<Link className='h-3 w-3 mr-1.5' />
											<span>
												{bill.sources.length} Official Source
												{bill.sources.length > 1 ? "s" : ""}
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align='start'
										className='bg-popover text-popover-foreground border-border'>
										{bill.sources
											.filter((source) => source.note !== "API Details")
											.map((source, index) => (
												<DropdownMenuItem
													key={index}
													asChild
													className='hover:bg-accent focus:bg-accent'>
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
								<div className='flex items-center text-8px-rhythm-xs text-muted-foreground'>
									<span className='pr-1 '> Last Updated on </span>
									{/* <Calendar className='h-3 w-3 mr-1.5' /> */}
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
