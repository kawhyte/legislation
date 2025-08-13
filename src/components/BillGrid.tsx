// import type { Jurisdiction } from "@/hooks/useGetJurisdictions";
import useBills from "../hooks/useBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";
import type { States } from "./JurisdictionSelector";



interface Props {
	selectedJurisdiction: States | null;
}

const BillGrid = ({ selectedJurisdiction }:Props) => {

	
	const { data, error, isLoading } = useBills(selectedJurisdiction);
	if (!selectedJurisdiction) return null;

	const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return (
		<>
			{error && <div>{error}</div>}

			<div>
				<div className='grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6 mt-6'>
					{isLoading &&
						skeletons.map((skeleton) => <BillCardSkeleton key={skeleton} />)}
					{data?.map((bill) => (
						<BillCard key={bill.id} bill={bill} />
					))}
				</div>
			</div>
		</>
	);
};

export default BillGrid;
