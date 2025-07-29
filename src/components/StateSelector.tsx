import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import useGetJurisdictions from "@/hooks/useGetJurisdictions";


// interface Props{
// // onSelectState(state: string): void;

// }
 
const StateSelector = () => {
	const [selectedValue, setSelectedValue] = useState<string>("Alabama");

	const {jurisdictions} = useGetJurisdictions();

	return (
		<div className='w-64 p-4'>
			<Select value={selectedValue} onValueChange={setSelectedValue}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder='Select an option' />
				</SelectTrigger>

				<SelectContent>
					{jurisdictions.map((option) => (
						<SelectItem  key={option.id} value={option.name}>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className='mt-4 text-sm text-gray-600'>
				Selected:{" "}
				<span className='font-semibold'>
					{jurisdictions.find((opt) => opt.name === selectedValue)?.name ||
						"None"}
				</span>
			</p>
		</div>
	);
};

export default StateSelector;
