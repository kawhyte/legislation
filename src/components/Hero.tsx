import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MapPin, Sparkles, Bookmark } from "lucide-react";

import JurisdictionSelector, { type States } from "./JurisdictionSelector";
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
	const [selectedState, setSelectedState] = useState<States | null>(null);

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

	return (
		<div className='min-h-[65vh] flex flex-col items-center justify-center px-4 py-16'>
			<div className='w-full max-w-2xl text-center space-y-6'>

				{/* HEADLINE */}
				<div className='space-y-3'>
					<h1 className='text-5xl sm:text-6xl font-black text-foreground leading-tight tracking-tight'>
						Laws that affect you,<br />explained plainly.
					</h1>
					<p className='text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed'>
						Search active bills from your state and let AI translate the legal language into plain English.
					</p>
				</div>

				{/* FEATURE PILLS */}
				{/* <div className='hidden sm:flex items-center justify-center gap-3 flex-wrap'>
					{FEATURE_PILLS.map(({ icon: Icon, label }) => (
						<span
							key={label}
							className='inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded-full px-3 py-1.5'>
							<Icon className='h-3 w-3' />
							{label}
						</span>
					))}
				</div> */}

				{/* PRIMARY: State flag dropdown — full width */}
				<JurisdictionSelector
					selectedJurisdiction={selectedState}
					onSelectJurisdiction={(state) => {
						if (state) {
							setSelectedState(state);
							setError('');
							onSelectState(state);
						}
					}}
					triggerClassName='h-14 text-base border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] py-0 px-6'
				/>

				{/* SECONDARY: ZIP search */}
				<div className='flex items-center gap-3 text-muted-foreground/50 text-xs font-semibold uppercase tracking-widest'>
					<span className='flex-1 h-px bg-border' />
					or search by zip code
					<span className='flex-1 h-px bg-border' />
				</div>

				<form onSubmit={handleSubmit} className='flex gap-3 items-stretch'>
					<Input
						type='text'
						placeholder='Enter zip code…'
						value={query}
						onChange={e => { setQuery(e.target.value); setError(''); }}
						className='flex-1 text-lg h-14 px-6 border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] focus-visible:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] focus-visible:ring-0 transition-shadow placeholder:text-muted-foreground/40'
					/>
					<Button
						type='submit'
						disabled={!query.trim() || isSearching}
						className='h-14 px-8 text-lg font-bold border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-40 disabled:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150 whitespace-nowrap bg-primary text-primary-foreground'
					>
						{isSearching ? 'Searching…' : 'Find Bills'}
					</Button>
				</form>

				{error && (
					<p className='text-sm font-semibold text-destructive border-2 border-destructive rounded-xl px-4 py-2 inline-block'>
						{error}
					</p>
				)}

			</div>
		</div>
	);
};

export default HeroSection;
