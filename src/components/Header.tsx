// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
    Bookmark,
    TrendingUp,
    Menu,
    X,
    Lightbulb,
    User,
    Settings,
    LogOut,
} from "lucide-react";

import { useUserData } from "../contexts/UserContext";
import { useUser } from '@/hooks/useAuth';
import { signOut } from '@/services/authService';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { userPreferences } = useUserData();
    const { isSignedIn, user } = useUser();
    const navigate = useNavigate();

    const Logo = () => (
        <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
        >
            <div className='flex items-center justify-center w-8 h-8 rounded-lg'>
                {/* <PrismIcon className='h-4 w-4 text-primary-foreground' /> */}
<img src="./favicon.png"/>

            </div>
            <span className='text-lg font-bold text-foreground'>Billhound</span>
        </div>
    );

    const DesktopNav = () => (
        <nav className="hidden lg:flex items-center gap-4">
            <Button
                variant='ghost'
                onClick={() => navigate('/')}
                // UPDATED: Added hover:bg-accent for consistency
                className='text-muted-foreground hover:text-foreground hover:bg-accent'
            >
                Home
            </Button>
            {isSignedIn && (
                <Button
                    variant='ghost'
                    onClick={() => navigate("/dashboard")}
                    // UPDATED: Added hover:bg-accent for consistency
                    className='text-muted-foreground hover:text-foreground hover:bg-accent'
                >
                    Dashboard
                </Button>
            )}
            <Button
                variant='ghost'
                onClick={() => navigate("/why-this-matters")}
                // UPDATED: Added hover:bg-accent for consistency
                className='text-muted-foreground hover:text-foreground hover:bg-accent'
            >
                Why This Matters
            </Button>
        </nav>
    );

    const UserActions = () => (
        <div className='flex items-center gap-2'>
            {isSignedIn ? (
                // Authenticated user actions
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                        src={user?.photoURL || ''} 
                                        alt={userPreferences?.displayName || user?.displayName || user?.email || 'User'} 
                                    />
                                    <AvatarFallback>
                                        {userPreferences?.displayName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block text-sm font-medium">
                                    {(() => {
                                        const name = userPreferences?.displayName || user?.displayName || 'User';
                                        return name.length > 12 ? name.substring(0, 12) + '...' : name;
                                    })()}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex items-center justify-start gap-2 p-2">
                                <div className="flex flex-col space-y-1 leading-none">
                                    {(userPreferences?.displayName || user?.displayName) && (
                                        <p className="font-medium">
                                            {userPreferences?.displayName || user?.displayName}
                                        </p>
                                    )}
                                    {user?.email && (
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                <Bookmark className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/profile-setup')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                // Unauthenticated user actions
                <>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/sign-in')}
                        className="hidden sm:inline-flex text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        Log In
                    </Button>
                    <Button 
                        onClick={() => navigate('/sign-up')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Sign Up
                    </Button>
                </>
            )}
            <Button
                variant='ghost'
                size='icon'
                className='lg:hidden text-muted-foreground hover:bg-accent hover:text-foreground'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
        </div>
    );

    const MobileMenu = () => (
        <div
            className={`lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
            }`}
        >
            <div className='p-4 space-y-2'>
                <Button
                    variant='ghost'
                    onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
                    // UPDATED: Added text and hover styles
                    className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                >
                    <TrendingUp className='h-4 w-4' />
                    Home
                </Button>
                {isSignedIn && (
                    <Button
                        variant='ghost'
                        onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }}
                        // UPDATED: Added text and hover styles
                        className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                    >
                        <Bookmark className='h-4 w-4' />
                        Dashboard
                    </Button>
                )}
                <Button
                    variant='ghost'
                    onClick={() => { navigate("/why-this-matters"); setIsMobileMenuOpen(false); }}
                    // UPDATED: Added text and hover styles
                    className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                >
                    <Lightbulb className='h-4 w-4' />
                    Why This Matters
                </Button>
                
                {/* Mobile Auth Actions */}
                {isSignedIn ? (
                    <>
                        <div className="border-t border-border pt-2 mt-2">
                            <Button
                                variant='ghost'
                                onClick={() => { navigate("/profile-setup"); setIsMobileMenuOpen(false); }}
                                className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                            >
                                <Settings className='h-4 w-4' />
                                Settings
                            </Button>
                            <Button
                                variant='ghost'
                                onClick={() => {
                                    signOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                            >
                                <LogOut className='h-4 w-4' />
                                Sign Out
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="border-t border-border pt-2 mt-2 space-y-2">
                        <Button
                            variant='ghost'
                            onClick={() => { navigate("/sign-in"); setIsMobileMenuOpen(false); }}
                            className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                        >
                            <User className='h-4 w-4' />
                            Log In
                        </Button>
                        <Button
                            onClick={() => { navigate("/sign-up"); setIsMobileMenuOpen(false); }}
                            className='w-full justify-start gap-3 text-base py-6 bg-primary text-primary-foreground hover:bg-primary/90'
                        >
                            <User className='h-4 w-4' />
                            Sign Up
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
                    : "bg-background/0 border-b border-transparent"
            }`}
        >
            <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    <Logo />
                    <DesktopNav />
                    <UserActions />
                </div>
            </div>
            <MobileMenu />
        </header>
    );
};

export default Header;