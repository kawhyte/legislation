import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface HeroSectionProps {
	onSearch: (zip: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
	const [zip, setZip] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (zip.length === 5) onSearch(zip);
	};

	return (
		<div className='min-h-[75vh] flex flex-col items-center justify-center px-4 py-16'>
			<div className='w-full max-w-2xl text-center space-y-8'>
				<div className='space-y-4'>
					<h1 className='text-5xl sm:text-6xl font-black text-foreground leading-tight tracking-tight'>
						What laws are brewing<br />near you?
					</h1>
					<p className='text-lg text-muted-foreground max-w-md mx-auto'>
						Enter your zip code — we'll show you exactly what's moving through your state legislature.
					</p>
				</div>

				<form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 items-stretch'>
					<Input
						type='text'
						inputMode='numeric'
						pattern='[0-9]*'
						maxLength={5}
						placeholder='e.g. 90210'
						value={zip}
						onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
						className='text-2xl h-16 px-6 border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] focus-visible:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] focus-visible:ring-0 transition-shadow font-mono tracking-widest placeholder:text-muted-foreground/40 placeholder:font-sans placeholder:tracking-normal placeholder:text-xl'
					/>
					<Button
						type='submit'
						disabled={zip.length !== 5}
						className='h-16 px-8 text-lg font-bold border-4 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-40 disabled:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] disabled:translate-x-0 disabled:translate-y-0 transition-all duration-150 whitespace-nowrap bg-primary text-primary-foreground'
					>
						<Search className='h-5 w-5 mr-2' />
						Find My Bills
					</Button>
				</form>

				<p className='text-xs text-muted-foreground/60'>
					Covers all 50 states · Powered by AI · Always free
				</p>
			</div>
		</div>
	);
};

export default HeroSection;
