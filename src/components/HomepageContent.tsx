import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	Search, 
	Sparkles, 
	Bell, 
	BarChart3,
	Users,
	MapPin,
	Clock,
	HelpCircle,
	CheckCircle
} from "lucide-react";

// Data from WhyThisMattersPage
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
		color: "text-blue-600"
	},
	{
		step: "2", 
		icon: Sparkles,
		title: "Get AI Summaries",
		description: "Receive clear, concise summaries powered by AI. No more reading through pages of complex legal jargon.",
		color: "text-purple-600"
	},
	{
		step: "3",
		icon: Bell,
		title: "Stay Updated",
		description: "Track bill progress and receive notifications when legislation you care about moves through the process.",
		color: "text-green-600"
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

const coverageStats = [
	{
		icon: MapPin,
		number: "50",
		label: "States Covered",
		description: "Complete coverage of all US state legislatures"
	},
	{
		icon: BarChart3,
		number: "10,000+",
		label: "Active Bills",
		description: "Currently tracking thousands of pieces of legislation"
	},
	{
		icon: Clock,
		number: "Real-time",
		label: "Updates",
		description: "Instant notifications when bills change status"
	},
	{
		icon: Users,
		number: "5,000+", 
		label: "Informed Citizens",
		description: "Growing community of engaged users"
	}
];

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

const HomepageContent = () => {
	return (
		<div className="bg-background">
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
								<Card key={index} className="bg-card border-border p-8 sm:p-10 text-center hover:shadow-lg transition-shadow">
									<Icon className={`h-12 w-12 sm:h-14 sm:w-14 ${item.color} mx-auto mb-6`} />
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

			{/* Coverage & Statistics Section */}
			<section className="py-20 sm:py-24 lg:py-32 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16 space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Comprehensive Legislative Coverage
						</h2>
						<p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
							Access the most complete database of state legislation with real-time updates
						</p>
					</div>
					
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-6xl mx-auto">
						{coverageStats.map((stat, index) => {
							const Icon = stat.icon;
							return (
								<Card key={index} className="bg-card border-border p-8 sm:p-10 text-center">
									<Icon className="h-12 w-12 sm:h-14 sm:w-14 text-primary mx-auto mb-6" />
									<div className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
										{stat.number}
									</div>
									<div className="font-semibold text-foreground mb-4 text-lg sm:text-xl">
										{stat.label}
									</div>
									<p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
										{stat.description}
									</p>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			{/* How Laws Impact Your Daily Life Section */}
			<section className="py-20 sm:py-24 lg:py-32">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16 space-y-6">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							How Laws Impact Your Daily Life
						</h2>
					</div>
					
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
						{lawImpact.map((item) => (
							<Card key={item.id} className="bg-card border-border p-8 sm:p-10 text-center">
								<div className="flex justify-center mb-6">
									<img
										src={item.icon}
										alt={item.title}
										className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg border-2 border-foreground"
									/>
								</div>
								<h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
									{item.title}
								</h3>
								<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
									{item.description}
								</p>
							</Card>
						))}
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
							<Card key={index} className="bg-card border-border p-8 sm:p-10">
								<div className="flex items-start gap-4 mb-6">
									<HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
									<h3 className="font-semibold text-foreground text-lg sm:text-xl">
										{faq.question}
									</h3>
								</div>
								<div className="flex items-start gap-4">
									<CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
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
			<section className="py-20 sm:py-24 lg:py-32 bg-primary/10">
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