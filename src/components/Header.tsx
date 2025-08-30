// src/components/Header.tsx
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
    Bookmark,
    TrendingUp,
    Menu,
    X,
    Lightbulb,
} from "lucide-react";

import { useBookmarks } from "../contexts/BookmarkContext";
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

    const { bookmarkCount } = useBookmarks();
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
            <Button
                variant='ghost'
                onClick={() => navigate("/saved")}
                // UPDATED: Added hover:bg-accent for consistency
                className='text-muted-foreground hover:text-foreground hover:bg-accent relative'
            >
                Saved Bills
                {bookmarkCount > 0 && (
                    <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary text-primary-foreground border-2 border-background flex items-center justify-center'>
                        {bookmarkCount > 9 ? "9+" : bookmarkCount}
                    </Badge>
                )}
            </Button>
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
            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:bg-accent hover:text-foreground">
                Log In
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                Sign Up
            </Button>
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
                <Button
                    variant='ghost'
                    onClick={() => { navigate("/saved"); setIsMobileMenuOpen(false); }}
                    // UPDATED: Added text and hover styles
                    className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                >
                    <Bookmark className='h-4 w-4' />
                    Saved Bills
                </Button>
                <Button
                    variant='ghost'
                    onClick={() => { navigate("/why-this-matters"); setIsMobileMenuOpen(false); }}
                    // UPDATED: Added text and hover styles
                    className='w-full justify-start gap-3 text-base py-6 text-foreground hover:bg-accent'
                >
                    <Lightbulb className='h-4 w-4' />
                    Why This Matters
                </Button>
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