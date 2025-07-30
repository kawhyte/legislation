import { useState } from "react";
import BillGrid from "./components/BillGrid";

import Header from "./components/Header";
import StateSelector, { type States } from "./components/JurisdictionSelector";
import StatCard from "./components/StatCard";
import usStates from "./data/usStates";
import SectionHeader from "./components/SectionHeader";

const App = () => {
	const [selectedJurisdiction, setSelectedJurisdiction] =
		useState<States | null>(usStates[0]);

	return (
		<div className='min-h-screen'>
			<Header />

			<main className='max-w-7xl mx-auto px-4 py-6'>
				<h1 className='text-2xl font-bold mb-4'>Paid Family Leave bills</h1>

				{/* Stat Cards */}
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
					<StatCard
						label='Total Bills'
						value={98}
						note='Last 3 months'
						color='blue'
					/>
					<StatCard
						label='Major Update'
						value={11}
						note='Last 3 months'
						color='indigo'
					/>
					<StatCard
						label='New Bills'
						value={0}
						note='Last 40 days'
						color='yellow'
					/>
					<StatCard
						label='Failed Bills'
						value={0}
						note='Last 2 months'
						color='red'
					/>
				</div>
				<div className='text-sm text-center text-gray-500 mb-4'>
					Information updated Monday, November 14th 2022
				</div>

				<SectionHeader jurisdiction={selectedJurisdiction} />

				{/* <FilterBar /> */}
				<div className='flex align-middle items-baseline bg-blue-50 border border-blue-100 rounded-lg px-4 py-3'>
					<p className='mt-4 text-sm text-gray-600'>Filter:</p>
					<StateSelector
						onSelectJurisdiction={(jurisdiction) =>
							setSelectedJurisdiction(jurisdiction)
						}
					/>
				</div>

				{/* Bill Cards Grid */}
				<BillGrid selectedJurisdiction={selectedJurisdiction} />
			</main>
		</div>
	);
};

export default App;
