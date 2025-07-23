import type { Bill } from "../hooks/useBills";
import usStates from '../data/usStates'; 

interface BillCardProps  {
	bill: Bill;
};

const BillCard = ({ bill }: BillCardProps) => {
    
    // Find the state object that matches the bill's jurisdiction name
    const stateInfo = usStates.find(
        (state) => state.name.toLowerCase() === bill.jurisdiction.name.toLowerCase()
    );

    // Get the flag URL, or a placeholder if not found
    const flagUrl = stateInfo
        ? stateInfo.flagUrl
        : 'https://placehold.co/32x24/cccccc/333333?text=N/A'; // Placeholder for missing flag

    return (
        <div className='border rounded-xl p-4 shadow-sm bg-white space-y-3'>
            <div className='flex items-center gap-3'>
              
                <img
                    src={flagUrl}
                    alt={`${bill.jurisdiction.name} flag`}
                    className="w-8 h-8 object-contain rounded-full border border-gray-200"
                />
                <h3 className='text-blue-700 font-semibold text-sm'>
                    {bill.jurisdiction.name
                        ? bill.jurisdiction.name + " - " + bill.identifier
                        : "N/A"}
                </h3>
            </div>
            <div className='flex justify-between text-xs text-gray-500'>
                <span>Introduced: {bill.introduced}</span>
                {/* Ensure 'status' is defined, assuming it comes from bill object */}
                <span>Status: {bill.status}</span>
            </div>
            <p className='text-xs text-gray-700'>{bill.title ? bill.title : "N/A"}</p>
            <p className='text-xs text-gray-700'>
                Last activity posted on{" "}
                {bill.latest_action_date ? bill.latest_action_date : "N/A"}
            </p>

            <div className='text-xs text-gray-500 flex gap-2 items-center'>
                Bill Source(s):
                {bill.sources && bill.sources.length > 0 ? (
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
};

export default BillCard;
