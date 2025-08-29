import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const lawImpact = [
	{
		id: 1,
		icon: "/justice.svg",
		title: "Justice & Equality",
		description:
			"Laws ensure fair treatment and protect your fundamental rights, creating a just society for everyone.",
	},

	{
		id: 2,
		icon: "/hands.svg",
		title: "Community & Services",
		description:
			"Legislation funds and regulates public services like schools, parks, roads, and healthcare that you use every day.",
	},

	{
		id: 3,
		icon: "/forms.svg",
		title: "Economic Opportunity",
		description:
			"From minimum wage to business regulations, laws create the economic environment for jobs and innovation to flourish.",
	},
];

// A small, reusable component for the quotation mark icon to keep the main component clean.
const QuoteIcon = () => (
	<svg
		width='48'
		height='36'
		viewBox='0 0 48 36'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='text-muted-foreground/50 mb-4'>
		<path
			d='M18 0H0V36H18V18H10C10 11.6 14.4 8 18 8V0ZM48 0H30V36H48V18H40C40 11.6 44.4 8 48 8V0Z'
			fill='currentColor'
		/>
	</svg>
);

// The data for the testimonials, defined here for clarity.
const testimonials = [
	{
		quote:
			"As a small business owner, I used to be completely blindsided by new state regulations. This platform changed everything. Now I can track bills that might affect my industry and prepare in advance. It’s saved me from countless headaches and potential fines.",
		author: "Sarah Chen",
		title: "Owner, The Corner Cafe",
	},
	{
		quote:
			"I always wanted to be more involved in local politics but found the whole process overwhelming. Being able to get clear summaries of upcoming legislation has been a game-changer. I finally feel informed enough to talk to my representatives and advocate for issues that matter to my community.",
		author: "Marcus Thorne",
		title: "Community Organizer & Parent",
	},
];
// const FeatureCard = ({
// 	icon,
// 	title,
// 	children,
// }: {
// 	icon: React.ReactNode;
// 	title: string;
// 	children: React.ReactNode;
// }) => (
// 	<div className='bg-card border border-border rounded-lg shadow-lg p-6 flex flex-col items-center text-center'>
// 		<div className='bg-info/10 text-info rounded-full p-4 mb-4'>{icon}</div>
// 		<h3 className='text-xl font-bold text-foreground mb-2'>{title}</h3>
// 		<p className='text-muted-foreground'>{children}</p>
// 	</div>
// );

const WhyThisMattersPage: React.FC = () => {
	return (
		<div className='bg-background min-h-screen'>
			<header className=' text-secondary-foreground text-center py-20'>
				<div className='container mx-auto px-4'>
					<h1 className='text-5xl font-extrabold mb-4'>
						Why Legislation Matters
					</h1>
					<p className='text-xl max-w-3xl mx-auto'>
						From your morning coffee to your evening news, laws shape every
						aspect of your life. Understanding them is the first step to shaping
						your future.
					</p>
				</div>
			</header>

			<main className='container mx-auto px-4 py-16'>
				<h2 className='text-3xl font-bold text-center text-foreground mb-12'>
					How Laws Impact Your Daily Life
				</h2>

				<div className='grid md:grid-cols-3 gap-8'>
					{lawImpact.map((item) => (
						<Card className='bg-pastel-beige border-border p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6'>
							{/* Image Placeholder */}
							{/* A simple placeholder to represent the notebook icon from the screenshot. */}
							<div className='flex-shrink-0'>
								<img
									src={item.icon}
									alt={item.title}
									className='w-24 h-30 rounded-lg border-2 border-foreground'
								/>
							</div>

							{/* Text Content and Button */}
							<div className='flex flex-col items-center sm:items-start text-center sm:text-left'>
								<h3 className='text-xl font-semibold text-foreground'>
									{item.title}
								</h3>
								<p className='text-muted-foreground mt-1 mb-4'>
									{item.description}
								</p>
							</div>
						</Card>
					))}
				</div>

				<section className='bg-background py-16 sm:py-24'>
					<div className='container mx-auto px-4'>
						{/* Horizontal line and section title */}
						<div className='max-w-7xl mx-auto text-left'>
							<hr className='border-t border-border mb-8' />
							<h2 className='text-3xl font-bold text-foreground'>
								Your Voice, Your Future
							</h2>
						</div>

						{/* Grid for the testimonial cards */}
						<div className='max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16'>
							{testimonials.map((testimonial, index) => (
								<div key={index}>
									<QuoteIcon />
									<blockquote className='text-lg text-foreground leading-relaxed'>
										{testimonial.quote}
									</blockquote>
									<footer className='mt-6'>
										<p className='font-semibold text-foreground'>
											{testimonial.author}
										</p>
										<p className='text-muted-foreground'>{testimonial.title}</p>
									</footer>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className='mt-20 bg-pastel-lavender rounded-4xl text-primary  p-12 text-center'>
					<h2 className='text-4xl font-bold mb-4'>
						Stay Informed, Stay Empowered
					</h2>
					<p className='text-xl max-w-3xl mx-auto mb-6'>
						Our platform is designed to demystify the legislative process,
						providing you with the clear, concise information you need to be an
						effective citizen.
					</p>

					<Button
						size='lg'
						className='bg-primary-foreground text-primary font-bold py-3 px-8 rounded-full hover:bg-primary-foreground/90 transition-transform transform hover:scale-105'>
						Start Tracking Bills
					</Button>
				</section>
			</main>
		</div>
	);
};

export default WhyThisMattersPage;
