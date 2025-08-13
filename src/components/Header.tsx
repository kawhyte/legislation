import { useState, useEffect } from "react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
	Search,
	Bookmark,
	TrendingUp,
	User,
	Menu,
	X,
	Gavel,
	Sparkles,
} from "lucide-react";
import { useBookmarks } from "../contexts/BookmarkContext";

import { useNavigate } from "react-router-dom";

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const { bookmarkCount } = useBookmarks();
	const navigate = useNavigate();

	const Logo = () => (
		 <div 
    className="flex items-center gap-3 cursor-pointer" 
    onClick={() => navigate('/')}
  >
			{/* Logo Icon */}
			<div className='relative'>
				<div className='flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg'>
					<Gavel className='h-5 w-5 text-white' />
				</div>
				{/* Subtle glow effect */}
				<div className='absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 opacity-20 blur-sm -z-10' />
			</div>

			{/* Logo Text */}
			<div className='hidden sm:block'>
				<h1 className='text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'>
					LegisTrack
				</h1>
				<p className='text-xs text-slate-400 -mt-1'>Legislation Made Simple</p>
			</div>
		</div>
	);

	const UserActions = () => (
		<div className='flex items-center gap-3'>
			{/* Desktop Navigation */}
			<div className='hidden lg:flex items-center gap-2'>
				<Button
					variant='ghost'
					onClick={() => navigate('/trending')}
					size='sm'
					className='gap-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200'>
					<TrendingUp className='h-4 w-4 text-emerald-400' />
					Trending Bills
				</Button>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => navigate("/saved")}
					className='gap-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 relative'>
					<Bookmark className='h-4 w-4 text-violet-400' />
					Saved Bills
					{bookmarkCount > 0 && (
						<Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-violet-500 text-white border-0 flex items-center justify-center'>
							{bookmarkCount > 9 ? "9+" : bookmarkCount}
						</Badge>
					)}
				</Button>
			</div>

			{/* Mobile Search Toggle */}
			<Button
				variant='ghost'
				size='sm'
				className='md:hidden text-slate-400 hover:text-white hover:bg-slate-800/50'>
				<Search className='h-4 w-4' />
			</Button>

			{/* Mode Toggle */}
			<ModeToggle />

			{/* Mobile Menu Toggle */}
			<Button
				variant='ghost'
				size='sm'
				className='lg:hidden text-slate-400 hover:text-white hover:bg-slate-800/50'
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
				{isMobileMenuOpen ? (
					<X className='h-4 w-4' />
				) : (
					<Menu className='h-4 w-4' />
				)}
			</Button>
		</div>
	);

	const MobileMenu = () => (
		<div
			className={`lg:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 transition-all duration-300 ${
				isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
			}`}>
			<div className='p-4 space-y-4'>

				{/* Mobile Navigation Links */}
				<div className='grid grid-cols-2 gap-3'>
					<Button
						variant='ghost'
						onClick={() => navigate('/trending')}
						className='justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800/50 p-4'>
						<TrendingUp className='h-4 w-4 text-emerald-400' />
						Trending Bills
					</Button>

					<Button
						variant='ghost'
						onClick={() => {
							navigate("/saved");
							setIsMobileMenuOpen(false); // Close mobile menu
						}}
						className='justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800/50 p-4 relative'>
						<Bookmark className='h-4 w-4 text-violet-400' />
						Saved Bills
						{bookmarkCount > 0 && (
							<Badge className='ml-auto h-5 w-5 p-0 text-xs bg-violet-500 text-white border-0 flex items-center justify-center'>
								{bookmarkCount > 9 ? "9+" : bookmarkCount}
							</Badge>
						)}
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<header
				className={`sticky top-0 z-50 transition-all duration-300 ${
					isScrolled
						? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-slate-900/20"
						: "bg-slate-900/60 backdrop-blur-sm border-b border-slate-800/50"
				}`}>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						{/* Logo */}
						<Logo />

						{/* User Actions */}
						<UserActions />
					</div>
				</div>

				{/* Mobile Menu */}
				<MobileMenu />
			</header>

			{/* Spacer to prevent content jump when header becomes sticky */}
			<div className='h-0' />
		</>
	);
};

export default Header;