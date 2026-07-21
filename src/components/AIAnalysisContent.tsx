'use client';

import { RefreshCw, Users, Wallet, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillSummaryData } from "@/types";

export type AIAnalysisContentProps = {
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

				<div className='bg-amber-50 border-2 border-foreground rounded-xl p-4 shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'>
					<div className='flex items-center gap-2 mb-1'>
						<Wallet className='h-4 w-4 text-amber-800 flex-shrink-0' />
						<p className='text-xs font-bold text-amber-900 uppercase tracking-wide'>
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
									<p className='text-sm font-bold text-green-600 mb-2'>For</p>
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
									<p className='text-sm font-bold text-red-600 mb-2'>Against</p>
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

export default AIAnalysisContent;
