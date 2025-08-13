import { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillGrid from "./components/BillGrid";
import Header from "./components/Header";
import  { type States } from "./components/JurisdictionSelector";
import Hero from "./components/Hero";
import SavedBillsPage from "./components/SavedBillsPage";
import TrendingBillsPage from "./components/TrendingBillsPage";

const HomePage = ({ selectedJurisdiction, setSelectedJurisdiction }: {
	selectedJurisdiction: States | null;
	setSelectedJurisdiction: (state: States | null) => void;
}) => {
	const resultsRef = useRef<HTMLDivElement>(null);

	const handleStateSelect = (state: States | null) => {
		setSelectedJurisdiction(state);
		// Only scroll if a state is selected (not for nationwide view on initial load)
		if (state && resultsRef.current) {
			setTimeout(() => { // Timeout ensures the section is rendered before we scroll
				resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		}
	};

	return (
	<>
		<Hero
			selectedJurisdiction={selectedJurisdiction}
			setSelectedJurisdiction={handleStateSelect}
		/>
		<main ref={resultsRef} className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
			{/* <SectionHeader jurisdiction={selectedJurisdiction} /> */}
			<BillGrid selectedJurisdiction={selectedJurisdiction} />
		</main>
	</>
)};

const App = () => {
	const [selectedJurisdiction, setSelectedJurisdiction] =
		useState<States | null>(null);

	return (
		<Router>
			<div className='min-h-screen'>
				<Header />
				<Routes>
					<Route 
						path="/" 
						element={
							<HomePage 
								selectedJurisdiction={selectedJurisdiction}
								setSelectedJurisdiction={setSelectedJurisdiction}
							/>
						} 
					/>
					<Route path="/saved" element={<SavedBillsPage />} />
					<Route path="/trending" element={<TrendingBillsPage />} />
				</Routes>
			</div>
		</Router>
	);
};

export default App;