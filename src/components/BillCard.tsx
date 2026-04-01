// src/components/BillCard.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { RefreshCw, Sparkles, Link, Zap, Users, Wallet, Scale, Clock, User, Tag } from "lucide-react";
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
import type { BillCardProps, BillSummaryData } from "@/types";

const getDomainFromUrl = (url: string) => {
	try {
		const hostname = new URL(url).hostname;
		return hostname.replace(/^www\./, "");
	} catch {
		return "Official Source";
	}
};

type AIAnalysisContentProps = {
	isLoading: boolean;
	error: string | null;
	structured: BillSummaryData | null;
	onRetry: () => void;
};

const AIAnalysisContent = ({ isLoading, error, structured, onRetry }: AIAnalysisContentProps) => {
	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]'>
				<div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
				<p className='text-lg font-medium text-foreground'>Analyzing Legislation</p>
				<p className='text-sm text-muted-foreground'>Our AI is decoding the details...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='p-6 text-center'>
				<p className='text-lg font-medium text-destructive mb-2'>Analysis Failed</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Unable to generate the analysis at this time.
				</p>
				<Button
					variant='outline'
					onClick={onRetry}
					className='border-2 border-destructive text-destructive hover:bg-destructive/10'>
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
				<div className='flex items-start gap-2 px-1'>
					<Users className='h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5' />
					<span className='text-xs text-muted-foreground font-medium whitespace-nowrap'>Who it Affects:</span>
					<span className='text-xs font-semibold text-foreground leading-snug'>{structured.whoItAffects}</span>
				</div>
				<div className='bg-muted border-2 border-foreground rounded-xl p-4'>
					<p className='text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1'>
						The Gist
					</p>
					<p className='text-sm text-foreground leading-relaxed'>{structured.gist}</p>
				</div>

				<div className='bg-amber-50 dark:bg-amber-950/30 border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'>
					<div className='flex items-center gap-2 mb-1'>
						<Wallet className='h-4 w-4 text-amber-800 dark:text-amber-600 flex-shrink-0' />
						<p className='text-xs font-bold text-amber-900 dark:text-amber-600 uppercase tracking-wide'>
							Wallet Impact
						</p>
					</div>
					<p className='text-sm text-foreground leading-relaxed'>{structured.walletImpact}</p>
				</div>

				{hasDebate && (
					<div className='border-2 border-foreground rounded-xl p-4'>
						<div className='flex items-center gap-2 mb-3'>
							<Scale className='h-4 w-4 text-muted-foreground flex-shrink-0' />
							<p className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>
								The Debate
							</p>
						</div>
						<div className='grid grid-cols-2 gap-3'>
							{structured.controversy.for.length > 0 && (
								<div>
									<p className='text-sm font-bold text-green-600 dark:text-green-400 mb-2'>For</p>
									<ul className='space-y-2'>
										{structured.controversy.for.map((point, i) => (
											<li key={i} className='flex items-start gap-1.5'>
												<span className='text-green-500 mt-0.5 flex-shrink-0 font-bold'>+</span>
												<span className='text-sm text-foreground leading-relaxed'>{point}</span>
											</li>
										))}
									</ul>
								</div>
							)}
							{structured.controversy.against.length > 0 && (
								<div>
									<p className='text-sm font-bold text-red-600 dark:text-red-400 mb-2'>Against</p>
									<ul className='space-y-2'>
										{structured.controversy.against.map((point, i) => (
											<li key={i} className='flex items-start gap-1.5'>
												<span className='text-red-500 mt-0.5 flex-shrink-0 font-bold'>−</span>
												<span className='text-sm text-foreground leading-relaxed'>{point}</span>
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

const BillCard = ({
	bill,
	showProgressBar = true,
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

	const shouldShowProgressBar = viewMode === "detailed" && showProgressBar;
	const shouldShowSource = viewMode === "detailed" && showSource;

	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		return () => { if (cleanup) cleanup(); };
	}, [cleanup, bill.id]);

	const handleDecodeClick = useCallback(() => {
		if (!structured && !summaryLoading && !summaryError) {
			generateSummary();
		}
		setIsModalOpen(true);
	}, [structured, summaryLoading, summaryError, generateSummary]);

	const stateInfo = useMemo(
		() => usStates.find(
			(state) => state.name.toLowerCase() === bill?.jurisdiction?.name.toLowerCase()
		),
		[bill?.jurisdiction?.name]
	);
	const flagUrl = stateInfo?.flagUrl || "https://placehold.co/32x24";
	const flagAbbreviation = stateInfo?.abbreviation || "NA";

	// Derived display data
	const subjectTags = useMemo(() => bill.subject?.slice(0, 3) || [], [bill.subject]);
	const primarySponsor = useMemo(
		() => bill.sponsorships?.find((s) => s.primary),
		[bill.sponsorships]
	);
	const hasLatestActivity = Boolean(bill.latest_action_description);

	return (
		<Card className='bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] flex flex-col h-full transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]'>
			<CardHeader className='p-4 space-y-3'>
				{/* TOP ROW: flag + bill ID + bookmark */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<Avatar className='w-7 h-7 border-2 border-foreground rounded-md shrink-0'>
							<AvatarImage src={flagUrl} alt={bill?.jurisdiction?.name} />
							<AvatarFallback className='text-xs bg-muted text-foreground font-bold'>
								{bill?.jurisdiction?.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='flex items-center gap-2 text-sm'>
							<span className='font-bold text-foreground'>{flagAbbreviation}</span>
							<span className='text-muted-foreground/60'>•</span>
							<span className='font-mono text-xs font-semibold text-muted-foreground'>{bill.identifier}</span>
						</div>
					</div>
					<BookmarkButton bill={bill} />
				</div>

				{/* BILL TITLE */}
				<CardTitle className='text-base font-semibold line-clamp-3 text-foreground leading-relaxed'>
					{toSentenceCase(bill.title)}
				</CardTitle>

				{/* STATUS ROW: momentum + trending */}
				<div className='flex gap-2 items-center flex-wrap'>
					{bill.momentum && <MomentumBadge momentum={bill.momentum} />}
					{showTrendingReason && bill.trendingReason === "Trending" && (
						<div className='flex items-center gap-1.5 text-xs font-bold bg-accent-yellow text-on-yellow px-2.5 py-1 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]'>
							<Zap className='h-3 w-3' />
							<span>Trending</span>
						</div>
					)}
				</div>

				{/* SUBJECT TAGS */}
				{subjectTags.length > 0 && (
					<div className='flex items-center gap-1.5 flex-wrap'>
						<Tag className='h-3 w-3 text-muted-foreground flex-shrink-0' />
						{subjectTags.map((subject, i) => (
							<span
								key={i}
								className='text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border font-medium'>
								{subject}
							</span>
						))}
					</div>
				)}
			</CardHeader>

			<CardContent className='flex-grow flex flex-col justify-end space-y-3 p-4 pt-0'>
				{/* LATEST ACTIVITY */}
				{hasLatestActivity && (
					<div className='flex items-start gap-2 bg-muted/50 rounded-lg px-3 py-2'>
						<Clock className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5' />
						<p className='text-xs text-muted-foreground leading-snug line-clamp-2'>
							{bill.latest_action_description}
						</p>
					</div>
				)}

				{/* PRIMARY SPONSOR */}
				{primarySponsor?.person?.name && (
					<div className='flex items-center gap-1.5'>
						<User className='h-3 w-3 text-muted-foreground flex-shrink-0' />
						<span className='text-xs text-muted-foreground'>
							Sponsored by{" "}
							<span className='font-semibold text-foreground'>{primarySponsor.person.name}</span>
						</span>
					</div>
				)}

				{shouldShowProgressBar && <BillProgressStepper bill={bill} />}

				{/* AI ANALYSIS CTA */}
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogTrigger asChild>
						{!structured && !summaryLoading ? (
							<button
								onClick={handleDecodeClick}
								className='w-full mt-2 p-5 bg-muted border-2 border-dashed border-foreground/40 rounded-lg hover:bg-muted/80 hover:border-foreground/70 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group'>
								<Sparkles size={20} className='text-primary group-hover:scale-110 transition-transform' />
								<span className='font-bold text-sm text-foreground'>Translate to Plain English</span>
								<span className='text-xs text-muted-foreground'>AI explains what this bill actually means</span>
							</button>
						) : (
							<Button
								onClick={handleDecodeClick}
								className='w-full border-2 border-foreground bg-primary text-primary-foreground font-semibold shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150'
								size='sm'>
								<Sparkles className='h-4 w-4 mr-1.5' />
								{summaryLoading ? 'Analyzing…' : 'View Analysis'}
							</Button>
						)}
					</DialogTrigger>
					<DialogContent className='bg-card border-2 border-foreground rounded-xl shadow-[6px_6px_0px_0px_hsl(var(--foreground))] sm:max-w-[625px]'>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-3'>
								<Sparkles className='h-5 w-5 text-primary' />
								<span className='text-sm font-semibold text-muted-foreground'>
									Powered by AI — what actually matters
								</span>
							</DialogTitle>
						</DialogHeader>
						<div className='max-h-[70vh] overflow-y-auto p-1 pr-4'>
							<AIAnalysisContent
								isLoading={summaryLoading}
								error={summaryError}
								structured={structured}
								onRetry={generateSummary}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</CardContent>

			{shouldShowSource && (
				<CardFooter className='p-4 pt-2 flex items-center justify-between'>
					{bill.sources && bill.sources.length > 0 && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='sm'
									className='text-xs text-muted-foreground hover:text-foreground'>
									<Link className='h-3 w-3 mr-1.5' />
									{bill.sources.length} Official Source{bill.sources.length > 1 ? "s" : ""}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='start' className='border-2 border-foreground rounded-xl'>
								{bill.sources
									.filter((source) => source.note !== "API Details")
									.map((source, index) => (
										<DropdownMenuItem key={index} asChild className='hover:bg-accent focus:bg-accent'>
											<a href={source.url} target='_blank' rel='noopener noreferrer'>
												{source.note || getDomainFromUrl(source.url)}
											</a>
										</DropdownMenuItem>
									))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					{bill.latest_action_date && (
						<span className='text-xs text-muted-foreground'>
							Updated{" "}
							{new Date(bill.latest_action_date).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</span>
					)}
				</CardFooter>
			)}
		</Card>
	);
};

export default BillCard;
