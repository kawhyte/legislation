import useBills from "../hooks/useBills";

const BillGrid = () => {
	const { bills, error } = useBills();

	return (
		<>
			{error && <div>{error}</div>}

			<div>
				<ul>
					{bills.map((bill) => (
						<li key={bill.id}>{bill.title}</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default BillGrid;
