// src/components/DemoBillCard.tsx
import { useState } from "react";
import usStates from "../data/usStates";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Bookmark, BookmarkCheck } from "lucide-react";
import BillProgressStepper from "./BillProgressStepper";
import { toSentenceCase } from "../lib/utils";
import MomentumBadge from "./MomentumBadge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDemo } from "@/contexts/DemoContext";
import type { Bill } from "@/types";

interface DemoBillCardProps {
	bill: Bill;
	showProgressBar?: boolean;
	showTrendingReason?: boolean;
	viewMode?: 'detailed' | 'quick';
}

const DemoBillCard = ({
	bill,
	showProgressBar = true,
	showTrendingReason = false,
	viewMode = "detailed",
}: DemoBillCardProps) => {
	const { 
		getDemoExplanation, 
		saveDemoBill, 
		removeDemoBill, 
		isDemoBillSaved 
	} = useDemo();
	
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showExplanation, setShowExplanation] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	// Determine display props based on viewMode
	const shouldShowProgressBar = viewMode === "detailed" ? showProgressBar : false;

	const stateInfo = usStates.find(
		(state) => state.name.toLowerCase() === bill?.jurisdiction?.name.toLowerCase()
	);
	const flagUrl = stateInfo?.flagUrl || "https://placehold.co/32x24";
	const flagAbbreviation = stateInfo?.abbreviation || "NA";

	const isSaved = isDemoBillSaved(bill.id);

	const handleBookmarkClick = () => {
		if (isSaved) {
			removeDemoBill(bill.id);
		} else {
			saveDemoBill(bill);
		}
	};

	const handleExplainClick = () => {
		setIsModalOpen(true);
		if (!showExplanation) {
			setIsGenerating(true);
			// Simulate AI thinking time
			setTimeout(() => {
				setIsGenerating(false);
				setShowExplanation(true);
			}, 2500);
		}
	};

	const explanation = getDemoExplanation(bill.id);

	const AIAnalysisContent = () => {
		if (isGenerating) {
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

		if (showExplanation && explanation) {
			return (
				<div className='space-y-4 p-1'>
					<div className='bg-muted/20 border border-border rounded-lg p-4'>
						<p className='text-base text-foreground leading-relaxed'>
							{explanation.summary}
						</p>
					</div>

					{explanation.impacts && explanation.impacts.length > 0 && (
						<div className='bg-gray-900 border border-info/20 rounded-lg p-4'>
							<p className='text-sm font-bold text-wellness-yellow mb-3'>
								Potential Impact if Passed
							</p>
							<div className='space-y-3'>
								{explanation.impacts.map((impact, i) => (
									<div key={i} className='flex items-start gap-3'>
										<div className='w-1.5 h-1.5 bg-wellness-yellow rounded-full mt-1.5 flex-shrink-0'></div>
										<p className='text-sm text-primary-foreground leading-relaxed'>
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

		return (
			<div className='p-6 text-center'>
				<p className='text-lg font-medium text-foreground mb-2'>
					Ready to Analyze
				</p>
				<p className='text-sm text-muted-foreground mb-4'>
					Click "Explain this Bill" to see our AI analysis in action.
				</p>
			</div>
		);
	};

	return (
		<Card className='bg-card border-border hover:border-border/80 hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:bg-card/95'>
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
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBookmarkClick}
							className={`h-8 w-8 p-0 ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
						>
							{isSaved ? (
								<BookmarkCheck className="h-4 w-4 fill-current" />
							) : (
								<Bookmark className="h-4 w-4" />
							)}
						</Button>
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

					{showTrendingReason && (
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
								onClick={handleExplainClick}
								className='w-full bg-primary text-primary-foreground hover:bg-primary-hover border border-accent-magenta-bolder/20'
								size='sm'
							>
								<Sparkles className='h-4 w-4 mr-1' />
								Explain this Bill
							</Button>
						</DialogTrigger>
						<DialogContent className='bg-card sm:max-w-[625px]'>
							<DialogHeader>
								<DialogTitle className='flex items-center gap-3'>
									<Sparkles className='h-5 w-5 text-bill-card-action' />
									<span className='text-sm font-medium text-muted-foreground'>
										Demo: AI-Powered Analysis
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
		</Card>
	);
};

export default DemoBillCard;