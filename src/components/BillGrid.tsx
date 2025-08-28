import React from "react";
import useBills from "../hooks/useBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import type { States } from "./JurisdictionSelector";
import SectionHeader from "./SectionHeader";
import animationData from "../assets/Tumbleweed Rolling.json";

const Lottie = React.lazy(() => import("lottie-react"));

interface Props {
	selectedJurisdiction: States | null;
	selectedTopic: string | null;
}

const BillGrid = ({ selectedJurisdiction, selectedTopic }: Props) => {
	const { data, error, isLoading } = useBills(
		selectedJurisdiction,
		selectedTopic
	);

	const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	const hasData = !isLoading && data && data.length > 0;
	const noData = !isLoading && data && data.length === 0;

	return (
		<>
			{error && <div>{error}</div>}

			{noData && (
				<div className='flex flex-col items-center justify-center text-center py-24 bg-slate-800 border border-slate-700/50 rounded-2xl mt-6'>
					<React.Suspense fallback={<div>Loading...</div>}>
						<Lottie
							animationData={animationData}
							loop={true}
							className='w-48 h-48'
						/>
					</React.Suspense>
					<h3 className='text-3xl font-bold text-slate-100 mb-2'>
						Tumbleweeds...
					</h3>
					<p className='text-lg text-slate-400 max-w-md'>
						{
							"Looks like it's quiet in this corner of the legislation. No bills match your criteria right now."
						}
					</p>
				</div>
			)}

			<div>
				{hasData && <SectionHeader jurisdiction={selectedJurisdiction} />}
				<div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6 mt-6'>
					{isLoading &&
						skeletons.map((skeleton) => <BillCardSkeleton key={skeleton} />)}
					{hasData &&
						data.map((bill) => (
							<BillCard
								key={bill.id}
								bill={bill}
								showSource={true}
								showVotes={false}
							/>
						))}
				</div>
			</div>
		</>
	);
};

export default BillGrid;