import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpertsCarousel from "./ExpertsCarousel";
import { 
	Search, 
	Sparkles, 
	Bell, 
	HelpCircle,
	CheckCircle
} from "lucide-react";

// Data moved to ExpertsCarousel component

const testimonials = [
	{
		quote:
			"As a small business owner, I used to be completely blindsided by new state regulations. This platform changed everything. Now I can track bills that might affect my industry and prepare in advance. It's saved me from countless headaches and potential fines.",
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

// New SEO-rich sections data
const howItWorksSteps = [
	{
		step: "1",
		icon: Search,
		title: "Search Bills",
		description: "Select your state and topics to find relevant legislation. Our database covers all 50 states with real-time updates.",
		color: "text-primary",
		bgColor: "bg-primary/10"
	},
	{
		step: "2", 
		icon: Sparkles,
		title: "Get AI Summaries",
		description: "Receive clear, concise summaries powered by AI. No more reading through pages of complex legal jargon.",
		color: "text-wellness-purple",
		bgColor: "bg-wellness-purple/10"
	},
	{
		step: "3",
		icon: Bell,
		title: "Stay Updated",
		description: "Track bill progress and receive notifications when legislation you care about moves through the process.",
		color: "text-wellness-green",
		bgColor: "bg-wellness-green/10"
	}
];

const faqData = [
	{
		question: "How often is the legislation data updated?",
		answer: "Our system updates bill information in real-time as soon as changes are reported by state legislatures, ensuring you always have the most current information."
	},
	{
		question: "Can I track bills from multiple states?",
		answer: "Yes! You can search and track legislation from all 50 states. Simply change your state selection or save bills from different jurisdictions to your dashboard."
	},
	{
		question: "How accurate are the AI-generated summaries?",
		answer: "Our AI summaries are trained on legislative documents and refined for accuracy. They provide clear, unbiased explanations of complex bills while highlighting key impacts."
	},
	{
		question: "Is this service free to use?",
		answer: "Yes, our core features including bill search, AI summaries, and basic tracking are completely free. We believe everyone should have access to legislative information."
	},
	{
		question: "What types of legislation can I track?",
		answer: "You can track all types of state legislation including healthcare, education, business regulations, environmental policy, housing, technology, and more."
	},
	{
		question: "Do you cover local city and county legislation?",
		answer: "Currently, we focus on state-level legislation. We're working to expand coverage to include major city and county ordinances in future updates."
	}
];


const QuoteIcon = () => (
	<svg
	
		width='48'
		height='36'
		viewBox='0 0 48 36'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='text-wellness-yellow mb-4'>
		<path
			d='M18 0H0V36H18V18H10C10 11.6 14.4 8 18 8V0ZM48 0H30V36H48V18H40C40 11.6 44.4 8 48 8V0Z'
			fill='currentColor'
		/>
	</svg>
);

const HomepageContent = () => {
	return (
		<div className="bg-white">
			{/* Experts Carousel Section */}
			<ExpertsCarousel />
			{/* How It Works Section */}
			<section className="py-20 sm:py-24 lg:py-32">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16 space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							How It Works
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
							Track legislation that matters to you in three simple steps
						</p>
					</div>
					
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
						{howItWorksSteps.map((item, index) => {
							const Icon = item.icon;
							return (
								<Card key={index} className="bg-card border-border p-8 sm:p-10 text-center hover:shadow-lg transition-all hover:-translate-y-1">
									<div className={`w-16 h-16 sm:w-20 sm:h-20 ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
										<Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${item.color}`} />
									</div>
									<h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
										{item.title}
									</h3>
									<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
										{item.description}
									</p>
								</Card>
							);
						})}
					</div>
				</div>
			</section>


			{/* Social Proof Section */}
			<section className="py-20 sm:py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
				<div className="container mx-auto px-4 relative z-10">
					{/* Floating animated avatars */}
					<div className="absolute inset-0 pointer-events-none">
						<div className="animate-float-slow absolute top-16 left-8 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full opacity-80"></div>
						<div className="animate-float-medium absolute top-32 right-12 w-12 h-12 bg-gradient-to-br from-wellness-purple/20 to-wellness-purple/40 rounded-full opacity-70 animation-delay-1000"></div>
						<div className="animate-float-fast absolute bottom-32 left-16 w-20 h-20 bg-gradient-to-br from-wellness-green/20 to-wellness-green/40 rounded-full opacity-60 animation-delay-2000"></div>
						<div className="animate-float-slow absolute bottom-20 right-8 w-14 h-14 bg-gradient-to-br from-wellness-pink/20 to-wellness-pink/40 rounded-full opacity-75 animation-delay-3000"></div>
						<div className="animate-float-medium absolute top-1/2 left-4 w-10 h-10 bg-gradient-to-br from-wellness-yellow/20 to-wellness-yellow/40 rounded-full opacity-80 animation-delay-4000"></div>
						<div className="animate-float-fast absolute top-1/4 right-20 w-18 h-18 bg-gradient-to-br from-primary/15 to-primary/30 rounded-full opacity-70 animation-delay-500"></div>
					</div>

					{/* Central stat with large number */}
					<div className="text-center mb-16">
						
						<div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-primary mb-4">
							10,000+
						</div>
						<p className="text-xl sm:text-2xl text-foreground font-semibold">
							Bills Tracked Daily
						</p>
					</div>

					{/* Main heading */}
					<div className="text-center mb-16 space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Join thousands who stay informed with our platform
						</h2>
					</div>
					
					{/* Bottom stats grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-5xl mx-auto">
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50</div>
							<p className="text-sm sm:text-base text-muted-foreground">States Covered</p>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-2">Real-time</div>
							<p className="text-sm sm:text-base text-muted-foreground">Updates</p>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-2">5,000+</div>
							<p className="text-sm sm:text-base text-muted-foreground">Informed Citizens</p>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
							<p className="text-sm sm:text-base text-muted-foreground">Monitoring</p>
						</div>
					</div>
				</div>
			</section>

			

			{/* Your Voice, Your Future Section */}
			<section className="py-20 sm:py-24 lg:py-32 bg-muted/20">
				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						<hr className="border-t border-border mb-12" />
						<div className="text-center mb-16 space-y-6">
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
								Your Voice, Your Future
							</h2>
						</div>
						
						<div className="grid md:grid-cols-2 gap-x-16 gap-y-20">
							{testimonials.map((testimonial, index) => (
								<div key={index} className="space-y-6">
									<QuoteIcon />
									<blockquote className="text-lg sm:text-xl text-foreground leading-relaxed">
										{testimonial.quote}
									</blockquote>
									<footer className="space-y-2">
										<p className="font-semibold text-foreground text-lg">
											{testimonial.author}
										</p>
										<p className="text-muted-foreground">{testimonial.title}</p>
									</footer>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20 sm:py-24 lg:py-32">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16 space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Frequently Asked Questions
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
							Get answers to common questions about tracking legislation
						</p>
					</div>
					
					<div className="grid md:grid-cols-2 gap-8 sm:gap-10 max-w-6xl mx-auto">
						{faqData.map((faq, index) => (
							<Card key={index} className="bg-card border-border p-8 sm:p-10 hover:border-primary/20 transition-all">
								<div className="flex items-start gap-4 mb-6">
									<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<HelpCircle className="h-5 w-5 text-primary" />
									</div>
									<h3 className="font-semibold text-foreground text-lg sm:text-xl">
										{faq.question}
									</h3>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-wellness-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<CheckCircle className="h-5 w-5 text-wellness-green" />
									</div>
									<p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
										{faq.answer}
									</p>
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Stay Informed, Stay Empowered Section */}
			<section className="py-20 sm:py-24 lg:py-32 bg-wellness-yellow">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-5xl mx-auto space-y-8">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Stay Informed, Stay Empowered
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground">
							Our platform is designed to demystify the legislative process,
							providing you with the clear, concise information you need to be an
							effective citizen.
						</p>
						<div className="flex flex-wrap justify-center gap-3 sm:gap-4">
							<Badge variant="secondary" className="text-sm sm:text-base px-4 py-2">Legislative Transparency</Badge>
							<Badge variant="secondary" className="text-sm sm:text-base px-4 py-2">Civic Engagement</Badge>
							<Badge variant="secondary" className="text-sm sm:text-base px-4 py-2">Government Accountability</Badge>
							<Badge variant="secondary" className="text-sm sm:text-base px-4 py-2">Informed Democracy</Badge>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomepageContent;