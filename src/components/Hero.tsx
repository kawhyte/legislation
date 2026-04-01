import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MapPin, Sparkles, Bookmark } from "lucide-react";

import usStates from "../data/usStates";
import type { States } from "./JurisdictionSelector";
import { parseLocationInput } from "../utils/zipToJurisdiction";

interface HeroSectionProps {
	onSelectState: (state: States) => void;
}

const FEATURE_PILLS = [
	{ icon: MapPin,     label: "All 50 US states"    },
	{ icon: Sparkles,   label: "State Legislations in plain English with AI "  },
	{ icon: Bookmark,   label: "Save  and track bills"        },
] as const;

const HeroSection: React.FC<HeroSectionProps> = ({ onSelectState }) => {
	const [query, setQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!query.trim()) return;
		setIsSearching(true);
		setError('');
		try {
			const state = await parseLocationInput(query);
			onSelectState(state);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong.');
		} finally {
			setIsSearching(false);
		}
	};

	const handleStateSelect = (value: string) => {
		const state = usStates.find(s => s.abbreviation === value) as States | undefined;
		if (state) {
			setError('');
			onSelectState(state);
		}
	};

	return (
		<div className='min-h-[65vh] flex flex-col items-center justify-center px-4 py-16'>
			<div className='w-full max-w-2xl text-center space-y-6'>

				{/* HEADLINE */}
				<div className='space-y-3'>
					<h1 className='text-5xl sm:text-6xl font-black text-foreground leading-tight tracking-tight'>
						Laws that affect you,<br />explained plainly.
					</h1>
					<p className='text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed'>
						Search active bills from your state and let AI translate the legal language into plain English — no background needed.
					</p>
				</div>

				{/* FEATURE PILLS */}
				<div className='flex items-center justify-center gap-3 flex-wrap'>
					{FEATURE_PILLS.map(({ icon: Icon, label }) => (
						<span
							key={label}
							className='inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-full px-3 py-1.5'>
							<Icon className='h-3 w-3' />
							{label}
						</span>
					))}
				</div>

				{/* ZIP / STATE SEARCH */}
				<form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 items-stretch'>
					<Input
						type='text'
						placeholder='Enter zip code or state name…'
						value={query}
						onChange={e => { setQuery(e.target.value); setError(''); }}
						className='text-2xl h-16 px-6 border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] focus-visible:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] focus-visible:ring-0 transition-shadow placeholder:text-muted-foreground/40 placeholder:text-xl'
					/>
					<Button
						type='submit'
						disabled={!query.trim() || isSearching}
						className='h-16 px-8 text-lg font-bold border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-40 disabled:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150 whitespace-nowrap bg-primary text-primary-foreground'
					>
						{isSearching ? 'Searching…' : 'Find Bills'}
					</Button>
				</form>

				{error && (
					<p className='text-sm font-semibold text-destructive border-2 border-destructive rounded-xl px-4 py-2 inline-block'>
						{error}
					</p>
				)}

				{/* DIVIDER */}
				<div className='flex items-center gap-3 text-muted-foreground/50 text-xs font-semibold uppercase tracking-widest'>
					<span className='flex-1 h-px bg-border' />
					or browse by state
					<span className='flex-1 h-px bg-border' />
				</div>

				{/* STATE SELECT — always visible */}
				<Select onValueChange={handleStateSelect}>
					<SelectTrigger className='w-full max-w-sm mx-auto h-12 border-2 border-foreground rounded-xl shadow-[3px_3px_0px_0px_hsl(var(--foreground))] text-base'>
						<SelectValue placeholder='Choose a state…' />
					</SelectTrigger>
					<SelectContent>
						{usStates.map(state => (
							<SelectItem key={state.abbreviation} value={state.abbreviation}>
								{state.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

			</div>
		</div>
	);
};

export default HeroSection;
