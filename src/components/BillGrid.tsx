import useBills from "../hooks/useBills";
import BillCard from "./BillCard";

const BillGrid = () => {
	const { bills, error } = useBills();
console.log("bills", bills);

	return (
		<>
			{error && <div>{error}</div>}

			<div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>

				
					{bills?.map((bill) => (
						<BillCard key={bill.id} bill={bill} />

						// <li key={bill.id}>{bill.title}</li>
					))}
				</div>
			</div>
		</>
	);
};

export default BillGrid;
