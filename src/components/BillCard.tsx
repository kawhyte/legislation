import type { Bill } from "../hooks/useBills";

type BillCardProps = {
	// id: string;
	// introduced: string;
	// status: string;
	// summary: string;
	// sources: string[];
	bill: Bill;
};

const BillCard = ({ bill }: BillCardProps) => (
	<div className='border rounded-xl p-4 shadow-sm bg-white space-y-3'>
		<h3 className='text-blue-700 font-semibold text-sm'>
			{bill.jurisdiction.name
				? bill.jurisdiction.name + " - " + bill.identifier
				: "N/A"}
		</h3>
		<div className='flex justify-between text-xs text-gray-500'>
			<span>Introduced: {bill.introduced}</span>
			<span>Status: {status}</span>
		</div>
		<p className='text-xs text-gray-700'>{bill.title ? bill.title : "N/A"}</p>
		<p className='text-xs text-gray-700'>
			Last activity posted on{" "}
			{bill.latest_action_date ? bill.latest_action_date : "N/A"}
		</p>
		
		<div className='text-xs text-gray-500 flex gap-2 items-center'>
		Bill Source(s):
			{bill.sources ? (
				bill.sources.map((src, idx) => (
					<span
						key={idx}
						className='bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium'>
						{src}
					</span>
				))
			) : (
				<span>N/A</span>
			)}
		</div>
	</div>
);

export default BillCard;
