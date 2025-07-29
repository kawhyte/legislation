import useBills from "../hooks/useBills";
import BillCard from "./BillCard";
import BillCardSkeleton from "./BillCardSkeleton";

const BillGrid = () => {
	const { data, error, isLoading } = useBills();
console.log("bills", data);

const skeletons = [1,2,3,4,5,6,7,8,9,10]

	return (
		<>
			{error && <div>{error}</div>}

			<div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>

				{isLoading && skeletons.map(skeleton => <BillCardSkeleton key={skeleton}/>)}
					{data?.map((bill) => (
						<BillCard key={bill.id} bill={bill} />

						// <li key={bill.id}>{bill.title}</li>
					))}
				</div>
			</div>
		</>
	);
};

export default BillGrid;
