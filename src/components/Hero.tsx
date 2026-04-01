import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search } from "lucide-react";
import usStates from "../data/usStates";
import type { States } from "./JurisdictionSelector";
import { parseLocationInput } from "../utils/zipToJurisdiction";

interface HeroSectionProps {
	onSelectState: (state: States) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSelectState }) => {
	const [query, setQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState('');
	const [showStateSelect, setShowStateSelect] = useState(false);

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
		<div className='min-h-[75vh] flex flex-col items-center justify-center px-4 py-16'>
			<div className='w-full max-w-2xl text-center space-y-8'>
				<div className='space-y-4'>
					<h1 className='text-5xl sm:text-6xl font-black text-foreground leading-tight tracking-tight'>
						What laws are brewing<br />near you?
					</h1>
					<p className='text-lg text-muted-foreground max-w-md mx-auto'>
						Enter your zip code or state — we'll show you exactly what's moving through your legislature.
					</p>
				</div>

				<form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 items-stretch'>
					<Input
						type='text'
						placeholder='Enter Zip Code or State…'
						value={query}
						onChange={e => { setQuery(e.target.value); setError(''); }}
						className='text-2xl h-16 px-6 border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] focus-visible:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] focus-visible:ring-0 transition-shadow placeholder:text-muted-foreground/40 placeholder:text-xl'
					/>
					<Button
						type='submit'
						disabled={!query.trim() || isSearching}
						className='h-16 px-8 text-lg font-bold border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-40 disabled:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150 whitespace-nowrap bg-primary text-primary-foreground'
					>
						<Search className='h-5 w-5 mr-2' />
						{isSearching ? 'Searching…' : 'Find My Bills'}
					</Button>
				</form>

				{error && (
					<p className='text-sm font-semibold text-destructive border-2 border-destructive rounded-xl px-4 py-2 inline-block'>
						{error}
					</p>
				)}

				{/* State dropdown fallback */}
				<div className='space-y-3'>
					<button
						type='button'
						onClick={() => setShowStateSelect(v => !v)}
						className='text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors'
					>
						{showStateSelect ? 'Hide' : 'Or select your state →'}
					</button>

					{showStateSelect && (
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
					)}
				</div>

				<p className='text-xs text-muted-foreground/60'>
					Covers all 50 states · Powered by AI · Always free
				</p>
			</div>
		</div>
	);
};

export default HeroSection;
