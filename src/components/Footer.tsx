'use client';

import { Link } from "react-router-dom";

const Footer = () => (
	<footer className='border-t border-border bg-background'>
		<div className='container-legislation py-8'>
			<div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
				<div className='flex items-center gap-2'>
					<img src='/favicon.png' alt='Billhound' className='w-5 h-5' />
					<span className='text-sm font-semibold text-foreground'>Billhound</span>
				</div>
				<nav className='flex items-center gap-6'>
					<Link
						to='/about'
						className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
						About
					</Link>
				</nav>
				<p className='text-xs text-muted-foreground'>© 2026 Billhound</p>
			</div>
		</div>
	</footer>
);

export default Footer;
