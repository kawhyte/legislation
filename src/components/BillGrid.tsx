// import type { Jurisdiction } from "@/hooks/useGetJurisdictions";
import { Wind } from "lucide-react";
import useBills from "../hooks/useBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import type { States } from "./JurisdictionSelector";
import SectionHeader from "./SectionHeader";



interface Props {
	selectedJurisdiction: States | null;
}

const BillGrid = ({ selectedJurisdiction }:Props) => {

	
	const { data, error, isLoading } = useBills(selectedJurisdiction);
	if (!selectedJurisdiction) return null;

	const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


	 
	const hasData = !isLoading && data && data.length > 0;
	const noData = !isLoading && data && data.length === 0;
	 
	return (
		<>
			{error && <div>{error}</div>}

			{noData && (
				<div className="flex flex-col items-center justify-center text-center py-24 bg-slate-800/50 border border-slate-700/50 rounded-2xl mt-6">
					<Wind className="w-16 h-16 text-slate-500 mb-4" />
					<h3 className="text-3xl font-bold text-slate-100 mb-2">Tumbleweeds...</h3>
					<p className="text-lg text-slate-400 max-w-md">
						{`Looks like it's quiet in this corner of the legislation. No bills match your criteria right now.`}
					</p>
				</div>
			)}

			<div>
				{ hasData && <SectionHeader jurisdiction={selectedJurisdiction}/>}
				<div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6 mt-6'>
					{isLoading &&
						skeletons.map((skeleton) => <BillCardSkeleton key={skeleton} />)}
					{hasData && data.map((bill) => (
						<BillCard key={bill.id} bill={bill} />
					))}
				</div>
			</div>
		</>)};

export default BillGrid;
