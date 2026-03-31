import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpertsCarousel from "@/components/ExpertsCarousel";
import DemoPlayground from "@/components/DemoPlayground";
import { Search, Sparkles, Bell, HelpCircle, CheckCircle } from "lucide-react";

const howItWorksSteps = [
	{
		icon: Search,
		title: "Search Bills",
		description: "Enter your zip code to find relevant legislation. Our database covers all 50 states with real-time updates.",
		color: "text-primary",
		bgColor: "bg-primary/10",
	},
	{
		icon: Sparkles,
		title: "Get AI Summaries",
		description: "Receive clear, concise summaries powered by AI. No more reading through pages of complex legal jargon.",
		color: "text-wellness-purple",
		bgColor: "bg-wellness-purple/10",
	},
	{
		icon: Bell,
		title: "Stay Updated",
		description: "Track bill progress and receive notifications when legislation you care about moves through the process.",
		color: "text-wellness-green",
		bgColor: "bg-wellness-green/10",
	},
];

const faqData = [
	{
		question: "How often is the legislation data updated?",
		answer: "Our system updates bill information in real-time as soon as changes are reported by state legislatures.",
	},
	{
		question: "Can I track bills from multiple states?",
		answer: "Yes! You can search and track legislation from all 50 states by entering any zip code.",
	},
	{
		question: "How accurate are the AI-generated summaries?",
		answer: "Our AI summaries provide clear, unbiased explanations of complex bills while highlighting key impacts.",
	},
	{
		question: "Is this service free to use?",
		answer: "Yes, bill search, AI summaries, and basic tracking are completely free.",
	},
	{
		question: "What types of legislation can I track?",
		answer: "Healthcare, education, business regulations, environmental policy, housing, technology, and more.",
	},
	{
		question: "Do you cover local city and county legislation?",
		answer: "Currently we focus on state-level legislation. Local coverage is on our roadmap.",
	},
];

const testimonials = [
	{
		quote: "As a small business owner, I used to be completely blindsided by new state regulations. Now I can track bills that might affect my industry and prepare in advance.",
		author: "Sarah Chen",
		title: "Owner, The Corner Cafe",
	},
	{
		quote: "Being able to get clear summaries of upcoming legislation has been a game-changer. I finally feel informed enough to talk to my representatives.",
		author: "Marcus Thorne",
		title: "Community Organizer & Parent",
	},
];

const QuoteIcon = () => (
	<svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-wellness-yellow mb-4">
		<path d="M18 0H0V36H18V18H10C10 11.6 14.4 8 18 8V0ZM48 0H30V36H48V18H40C40 11.6 44.4 8 48 8V0Z" fill="currentColor" />
	</svg>
);

const AboutPage = () => (
	<div className="bg-background">
		<ExpertsCarousel />

		{/* How It Works */}
		<section className="container-section">
			<div className="container-legislation">
				<div className="text-center mb-12 space-y-4">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">How It Works</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Track legislation that matters to you in three simple steps
					</p>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{howItWorksSteps.map((item, i) => {
						const Icon = item.icon;
						return (
							<Card key={i} className="bg-card border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-6 text-center">
								<div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
									<Icon className={`h-8 w-8 ${item.color}`} />
								</div>
								<h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
								<p className="text-muted-foreground">{item.description}</p>
							</Card>
						);
					})}
				</div>
			</div>
		</section>

		{/* Demo */}
		<section className="mb-16">
			<DemoPlayground />
		</section>

		{/* Stats */}
		<section className="container-section bg-muted/30">
			<div className="container-legislation">
				<div className="text-center mb-12">
					<div className="text-7xl font-bold text-primary mb-4">10,000+</div>
					<p className="text-2xl font-semibold text-foreground">Bills Tracked Daily</p>
				</div>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
					{[["50", "States Covered"], ["Real-time", "Updates"], ["5,000+", "Informed Citizens"], ["24/7", "Monitoring"]].map(([val, label]) => (
						<div key={label} className="text-center">
							<div className="text-3xl font-bold text-primary mb-1">{val}</div>
							<p className="text-sm text-muted-foreground">{label}</p>
						</div>
					))}
				</div>
			</div>
		</section>

		{/* Testimonials */}
		<section className="container-section bg-muted/20">
			<div className="container-legislation max-w-6xl mx-auto">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">Your Voice, Your Future</h2>
				<div className="grid md:grid-cols-2 gap-12">
					{testimonials.map((t, i) => (
						<div key={i} className="space-y-4">
							<QuoteIcon />
							<blockquote className="text-lg text-foreground">{t.quote}</blockquote>
							<footer>
								<p className="font-semibold text-foreground">{t.author}</p>
								<p className="text-muted-foreground text-sm">{t.title}</p>
							</footer>
						</div>
					))}
				</div>
			</div>
		</section>

		{/* FAQ */}
		<section className="container-section">
			<div className="container-legislation">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">Frequently Asked Questions</h2>
				<div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
					{faqData.map((faq, i) => (
						<Card key={i} className="border-2 border-foreground rounded-xl p-6">
							<div className="flex items-start gap-3 mb-3">
								<HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
								<h3 className="font-semibold text-foreground">{faq.question}</h3>
							</div>
							<div className="flex items-start gap-3">
								<CheckCircle className="h-5 w-5 text-wellness-green flex-shrink-0 mt-0.5" />
								<p className="text-muted-foreground text-sm">{faq.answer}</p>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>

		{/* Footer CTA */}
		<section className="container-section bg-wellness-yellow">
			<div className="container-legislation text-center max-w-4xl mx-auto space-y-6">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground">Stay Informed, Stay Empowered</h2>
				<p className="text-lg text-muted-foreground">
					Our platform demystifies the legislative process, giving you the clear information you need to be an effective citizen.
				</p>
				<div className="flex flex-wrap justify-center gap-2">
					{["Legislative Transparency", "Civic Engagement", "Government Accountability", "Informed Democracy"].map(label => (
						<Badge key={label} variant="secondary" className="px-4 py-2 border-2 border-foreground">{label}</Badge>
					))}
				</div>
			</div>
		</section>
	</div>
);

export default AboutPage;
