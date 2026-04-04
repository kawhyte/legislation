'use client';

import { Search, Sparkles, Bookmark, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ExpertsCarousel from "@/components/ExpertsCarousel";

const howItWorksSteps = [
	{
		icon: Search,
		number: "01",
		title: "Find Your State's Bills",
		description: "Enter your zip code or pick your state to see active legislation from your state legislature — updated in real time.",
	},
	{
		icon: Sparkles,
		number: "02",
		title: "Read It in Plain English",
		description: "Our AI translates dense legal text into clear, simple language. No law degree needed to understand what a bill actually does.",
	},
	{
		icon: Bookmark,
		number: "03",
		title: "Save & Track",
		description: "Bookmark bills you care about and follow their progress through the legislative process from your personal dashboard.",
	},
	{
		icon: Users,
		number: "04",
		title: "Know Who Represents You",
		description: "See your local representatives and check how they've voted on the bills that matter to you — no political science degree required.",
	},
];

const faqData = [
	{
		question: "Is this free to use?",
		answer: "Yes — searching bills, reading AI summaries, and saving bills is completely free. No credit card required.",
	},
	{
		question: "How current is the bill data?",
		answer: "Bill information updates in real time as state legislatures report changes, so you're always seeing the latest status.",
	},
	{
		question: "How accurate are the AI summaries?",
		answer: "Our AI provides clear, unbiased explanations focused on what a bill does and who it affects. We always recommend reading the bill text for important decisions.",
	},
	{
		question: "Do you cover local city or county laws?",
		answer: "Not yet — we focus on state-level legislation across all 50 states. Local coverage is planned for a future update.",
	},
];

const testimonials = [
	{
		quote: "As a small business owner, I used to be blindsided by new regulations. Now I can track bills that might affect my industry and actually prepare for what's coming.",
		author: "Sarah Chen",
		title: "Owner, The Corner Cafe",
	},
	{
		quote: "Getting clear summaries of upcoming legislation has been a game-changer. I finally feel informed enough to talk to my representatives.",
		author: "Marcus Thorne",
		title: "Community Organizer & Parent",
	},
];

const QuoteIcon = () => (
	<svg width="28" height="21" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent-yellow">
		<path d="M18 0H0V36H18V18H10C10 11.6 14.4 8 18 8V0ZM48 0H30V36H48V18H40C40 11.6 44.4 8 48 8V0Z" fill="currentColor" />
	</svg>
);

const AboutPage = () => (
	<div className="bg-background">

		{/* Mission Hero */}
		<section className="container-section">
			<div className="container-legislation">
				<div className="max-w-3xl mx-auto text-center space-y-5">
					<h1 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
						Laws are being made in your name.{" "}
						<span className="underline decoration-accent-yellow decoration-[5px] underline-offset-4">
							Know what they say.
						</span>
					</h1>
					<p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
						We pull live bill data from all 50 state legislatures and use AI to translate legal jargon
						into plain English — so anyone can stay informed, not just lawyers.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1">
						{[
							"All 50 states",
							"Real-time updates",
							"Always free",
						].map((label) => (
							<div key={label} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
								<span className="w-2 h-2 rounded-full bg-accent-yellow flex-shrink-0" />
								{label}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>

		{/* How Laws Impact You */}
		<ExpertsCarousel />

		{/* How It Works */}
		<section className="container-section">
			<div className="container-legislation">
				<div className="text-center mb-10 space-y-2">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground">How It Works</h2>
					<p className="text-base text-muted-foreground">Four steps to go from confused to informed</p>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
					{howItWorksSteps.map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.number}
								className="bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6 space-y-4"
							>
								<div className="flex items-center justify-between">
									<div className="w-12 h-12 bg-accent-yellow rounded-xl flex items-center justify-center">
										<Icon className="h-6 w-6 text-text-on-yellow" />
									</div>
									<span className="text-4xl font-black text-border select-none">{item.number}</span>
								</div>
								<div>
									<h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>

		{/* Testimonials */}
		<section className="container-section bg-muted/30">
			<div className="container-legislation">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-10">
					What People Are Saying
				</h2>
				<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
					{testimonials.map((t, i) => (
						<div
							key={i}
							className="bg-card border-2 border-foreground rounded-xl shadow-[3px_3px_0px_0px_hsl(var(--foreground))] p-7 space-y-4"
						>
							<QuoteIcon />
							<blockquote className="text-base text-foreground leading-relaxed">
								"{t.quote}"
							</blockquote>
							<footer>
								<p className="font-bold text-foreground">{t.author}</p>
								<p className="text-sm text-muted-foreground">{t.title}</p>
							</footer>
						</div>
					))}
				</div>
			</div>
		</section>

		{/* FAQ */}
		<section className="container-section">
			<div className="container-legislation">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-10">
					Common Questions
				</h2>
				<div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
					{faqData.map((faq, i) => (
						<div key={i} className="bg-card border border-border rounded-xl p-6 space-y-2">
							<h3 className="font-bold text-foreground">{faq.question}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
						</div>
					))}
				</div>
			</div>
		</section>

		{/* CTA */}
		<section className="container-section bg-accent-yellow">
			<div className="container-legislation text-center max-w-2xl mx-auto space-y-5">
				<h2 className="text-3xl sm:text-4xl font-black text-text-on-yellow">
					Ready to get started?
				</h2>
				<p className="text-base text-text-on-yellow/80 leading-relaxed">
					Search bills from your state, read plain-English summaries, see how your reps voted, and save the bills that matter to you. Free, always.
				</p>
				<div className="flex flex-wrap justify-center gap-3">
					<Button
						asChild
						size="lg"
						className="bg-foreground text-background hover:bg-foreground/90 font-bold border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)]"
					>
						<Link to="/sign-up">
							Create Free Account
							<ArrowRight className="h-4 w-4 ml-2" />
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="border-2 border-foreground bg-transparent hover:bg-foreground/10 font-semibold text-foreground"
					>
						<Link to="/">Browse Bills First</Link>
					</Button>
				</div>
			</div>
		</section>

	</div>
);

export default AboutPage;
