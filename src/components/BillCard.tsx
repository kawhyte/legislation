'use client';

// src/components/BillCard.tsx
import { useMemo } from "react";
import NextLink from "next/link";
import usStates from "../data/usStates";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Link as LinkIcon, Zap, User, Calendar } from "lucide-react";
import BillProgressStepper from "./BillProgressStepper";
import BookmarkButton from "./BookmarkButton";
import { toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";
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
	} catch {
		return "Official Source";
	}
};

const BillCard = ({
	bill,
	showProgressBar = true,
	showSource = false,
	showTrendingReason = false,
	viewMode = "detailed",
}: BillCardProps) => {
	const shouldShowProgressBar = viewMode === "detailed" && showProgressBar;
	const shouldShowSource = viewMode === "detailed" && showSource;

	const stateInfo = useMemo(
		() => usStates.find(
			(state) => state.name.toLowerCase() === bill?.jurisdiction?.name.toLowerCase()
		),
		[bill?.jurisdiction?.name]
	);
	const flagUrl = stateInfo?.flagUrl || "https://placehold.co/32x24";
	const flagAbbreviation = stateInfo?.abbreviation || "NA";

	// Derived display data
	const primarySponsor = useMemo(
		() => bill.sponsorships?.find((s) => s.primary),
		[bill.sponsorships]
	);
	return (
		<NextLink href={`/bill/${encodeURIComponent(bill.id)}`} className='block h-full'>
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

				</CardHeader>

				<CardContent className='flex-grow flex flex-col justify-end space-y-3 p-4 pt-0'>
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

					{/* The whole card navigates to /bill/[id]; this is a visual affordance, not a button */}
					<div className='w-full border-2 border-foreground bg-primary text-primary-foreground font-semibold shadow-[3px_3px_0px_0px_hsl(var(--foreground))] rounded-md flex items-center justify-center gap-1.5 h-9 text-sm'>
						<Sparkles className='h-4 w-4' />
						View Full Bill &amp; AI Analysis
					</div>
				</CardContent>

				{shouldShowSource && (
					<CardFooter className='p-4 pt-3 flex items-center justify-between gap-2 border-t border-foreground/20'>
						{bill.sources && bill.sources.length > 0 && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										onClick={(e) => e.stopPropagation()}
										className='h-auto py-1 px-2.5 text-xs font-medium text-muted-foreground border border-border rounded-md bg-muted hover:bg-accent hover:text-foreground gap-1.5'>
										<LinkIcon className='h-3 w-3' />
										{bill.sources.length} Official Source{bill.sources.length > 1 ? "s" : ""}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='border-2 border-foreground rounded-xl'>
									{bill.sources
										.filter((source) => source.note !== "API Details")
										.map((source, index) => (
											<DropdownMenuItem key={index} asChild className='hover:bg-accent focus:bg-accent'>
												<a href={source.url} target='_blank' rel='noopener noreferrer' onClick={(e) => e.stopPropagation()}>
													{source.note || getDomainFromUrl(source.url)}
												</a>
											</DropdownMenuItem>
										))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{bill.latest_action_date && (
							<div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md bg-muted px-2.5 py-1'>
								<Calendar className='h-3 w-3' />
								<span>
									{new Date(bill.latest_action_date).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							</div>
						)}
					</CardFooter>
				)}
			</Card>
		</NextLink>
	);
};

export default BillCard;
