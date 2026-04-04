'use client';

// src/components/Header.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bookmark, Menu, X, Settings, LogOut } from "lucide-react";
import { useUserData } from "../contexts/UserContext";
import { useUser } from "@/hooks/useAuth";
import { signOut } from "@/services/authService";

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const { userPreferences } = useUserData();
	const { isSignedIn, user } = useUser();
	const navigate = useNavigate();
	const location = useLocation();

	// Active page detection
	const isActive = (path: string) =>
		path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

	// Scroll shadow
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 10);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Lock body scroll when drawer is open
	useEffect(() => {
		document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [isMobileMenuOpen]);

	// Close drawer on route change
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, [location.pathname]);

	const navLinks = [
		{ label: "Home", path: "/" },
		{ label: "Trending", path: "/trending" },
		...(isSignedIn ? [{ label: "Dashboard", path: "/dashboard" }] : []),
	];

	const Logo = () => (
		<div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate("/")}>
			<img src='/favicon.png' alt='Billhound' className='w-8 h-8' />
			<span className='text-lg font-bold text-foreground'>Billhound</span>
		</div>
	);

	const DesktopNav = () => (
		<nav className='hidden lg:flex items-center gap-1'>
			{navLinks.map(({ label, path }) => (
				<button
					key={path}
					onClick={() => navigate(path)}
					className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
						isActive(path)
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground hover:bg-accent"
					}`}>
					{label}
					{isActive(path) && (
						<span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary' />
					)}
				</button>
			))}
		</nav>
	);

	const UserActions = () => (
		<div className='flex items-center gap-3'>
			{isSignedIn ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' className='flex items-center gap-2.5 h-auto px-2.5 py-1.5 rounded-full'>
							<Avatar className='h-8 w-8'>
								<AvatarImage
									src={user?.photoURL || undefined}
									alt={userPreferences?.displayName || user?.displayName || "User"}
									referrerPolicy='no-referrer'
								/>
								<AvatarFallback>
									{userPreferences?.displayName?.charAt(0) ||
										user?.displayName?.charAt(0) ||
										user?.email?.charAt(0) ||
										"U"}
								</AvatarFallback>
							</Avatar>
							<span className='hidden sm:block text-sm font-medium'>
								{(() => {
									const name = userPreferences?.displayName || user?.displayName || "User";
									return name.length > 14 ? name.substring(0, 14) + "…" : name;
								})()}
							</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-56' align='end' forceMount>
						<div className='px-4 py-3'>
							{(userPreferences?.displayName || user?.displayName) && (
								<p className='font-medium text-sm'>
									{userPreferences?.displayName || user?.displayName}
								</p>
							)}
							{user?.email && (
								<p className='w-[200px] truncate text-xs text-muted-foreground mt-0.5'>
									{user.email}
								</p>
							)}
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate("/dashboard")}>
							<Bookmark className='mr-2 h-4 w-4' />
							Dashboard
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => navigate("/profile-setup")}>
							<Settings className='mr-2 h-4 w-4' />
							Edit Profile
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => signOut()}>
							<LogOut className='mr-2 h-4 w-4' />
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<>
					<Button
						variant='ghost'
						onClick={() => navigate("/sign-in")}
						className='hidden sm:inline-flex text-sm text-muted-foreground hover:bg-accent hover:text-foreground'>
						Log In
					</Button>
					<Button
						onClick={() => navigate("/sign-up")}
						className='text-sm bg-primary text-primary-foreground hover:bg-primary/90'>
						Sign Up
					</Button>
				</>
			)}
			{/* Hamburger — always shows Menu icon; X is inside the drawer */}
			<Button
				variant='ghost'
				size='icon'
				className='lg:hidden text-muted-foreground hover:bg-accent hover:text-foreground'
				onClick={() => setIsMobileMenuOpen(true)}>
				<Menu className='h-5 w-5' />
			</Button>
		</div>
	);

	return (
		<>
			<header
				className={`sticky top-0 z-50 transition-all duration-300 ${
					isScrolled
						? "bg-background/90 backdrop-blur-lg border-b border-border shadow-sm"
						: "bg-background border-b border-transparent"
				}`}>
				<div className='container-legislation'>
					<div className='flex items-center justify-between h-16'>
						<Logo />
						<DesktopNav />
						<UserActions />
					</div>
				</div>
			</header>

			{/* Mobile drawer backdrop */}
			{isMobileMenuOpen && (
				<div
					className='lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm'
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile drawer — slides in from right */}
			<div
				className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-background z-50 shadow-2xl border-l border-border
					flex flex-col transform transition-transform duration-300 ease-in-out
					${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>

				{/* Drawer header */}
				<div className='flex items-center justify-between px-5 py-4 border-b border-border'>
					<span className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>Menu</span>
					<button
						onClick={() => setIsMobileMenuOpen(false)}
						className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'>
						<X className='h-5 w-5' />
					</button>
				</div>

				{/* Nav links */}
				<nav className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto'>
					{navLinks.map(({ label, path }) => (
						<button
							key={path}
							onClick={() => navigate(path)}
							className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
								isActive(path)
									? "bg-accent text-foreground font-semibold"
									: "text-foreground hover:bg-accent"
							}`}>
							{label}
						</button>
					))}
				</nav>

				{/* Account section */}
				<div className='border-t border-border px-3 py-4 space-y-0.5'>
					{isSignedIn ? (
						<>
							<button
								onClick={() => navigate("/profile-setup")}
								className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-foreground hover:bg-accent transition-colors'>
								<Settings className='h-4 w-4 text-muted-foreground flex-shrink-0' />
								Edit Profile
							</button>
							<button
								onClick={() => signOut()}
								className='w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'>
								<LogOut className='h-4 w-4 flex-shrink-0' />
								Sign Out
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => navigate("/sign-in")}
								className='w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors'>
								Log In
							</button>
							<button
								onClick={() => navigate("/sign-up")}
								className='w-full text-center px-4 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'>
								Sign Up
							</button>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default Header;
