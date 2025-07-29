import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import usStates from "@/data/usStates";

const StateSelector = () => {
	const [selectedValue, setSelectedValue] = useState<string>("Alabama");

	const options = usStates;

	return (
		<div className='w-64 p-4'>
			<Select value={selectedValue} onValueChange={setSelectedValue}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder='Select an option' />
				</SelectTrigger>

				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.abbreviation} value={option.abbreviation}>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className='mt-4 text-sm text-gray-600'>
				Selected:{" "}
				<span className='font-semibold'>
					{options.find((opt) => opt.abbreviation === selectedValue)?.name ||
						"None"}
				</span>
			</p>
		</div>
	);
};

export default StateSelector;
