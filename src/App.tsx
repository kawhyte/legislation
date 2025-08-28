import { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BillGrid from "./components/BillGrid";
import Header from "./components/Header";
import { type States } from "./components/JurisdictionSelector";
import Hero from "./components/Hero";
import SavedBillsPage from "./pages/SavedBillsPage";
import TrendingBillsPage from "./pages/TrendingBillsPage";
import WhyItMatters from "./pages/WhyItMatters";
import WhyThisMattersPage from "./pages/WhyThisMattersPage"; // Import the new page

const HomePage = ({
	selectedJurisdiction,
	setSelectedJurisdiction,
	selectedTopic,
	setSelectedTopic,
}: {
	selectedJurisdiction: States | null;
	setSelectedJurisdiction: (state: States | null) => void;
	selectedTopic: string | null;
	setSelectedTopic: (topic: string | null) => void;
}) => {
	const resultsRef = useRef<HTMLDivElement>(null);

	const handleStateSelect = (state: States | null) => {
		setSelectedJurisdiction(state);
		// Only scroll if a state is selected (not for nationwide view on initial load)
		if (state && resultsRef.current) {
			setTimeout(() => {
				// Timeout ensures the section is rendered before we scroll
				resultsRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);
		}
	};

	return (
		<>
			<Hero
				selectedJurisdiction={selectedJurisdiction}
				setSelectedJurisdiction={handleStateSelect}
				selectedTopic={selectedTopic}
				setSelectedTopic={setSelectedTopic}
			/>
			<main
				ref={resultsRef}
				className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
				{selectedJurisdiction ? (
					<BillGrid
						selectedJurisdiction={selectedJurisdiction}
						selectedTopic={selectedTopic}
					/>
				) : (
					<TrendingBillsPage />
				)}
			</main>
			{/* <WhyItMatters /> */}
		</>
	);
};

const App = () => {
	const [selectedJurisdiction, setSelectedJurisdiction] =
		useState<States | null>(null);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

	return (
		<Router>
			<div className='min-h-screen'>
				<Header />
				<Routes>
					<Route
						path='/'
						element={
							<HomePage
								selectedJurisdiction={selectedJurisdiction}
								setSelectedJurisdiction={setSelectedJurisdiction}
								selectedTopic={selectedTopic}
								setSelectedTopic={setSelectedTopic}
							/>
						}
					/>
					<Route path='/saved' element={<SavedBillsPage />} />
					<Route path='/trending' element={<TrendingBillsPage />} />
					<Route path='/why-this-matters' element={<WhyThisMattersPage />} />
				</Routes>
			</div>
		</Router>
	);
};

export default App;
