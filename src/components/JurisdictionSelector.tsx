import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import usStates from "@/data/usStates";

export interface States {
	name: string;
	abbreviation: string;
	flagUrl: string;
}
interface Props {
	onSelectJurisdiction: (jurisdiction: States) => void;
}

const JurisdictionSelector = ({ onSelectJurisdiction }: Props) => {
	const data = usStates;
	const [selectedValue, setSelectedValue] = useState<string>(data[0].name);

	return (
		<div className='w-64 p-4'>
			<Select
				value={selectedValue}
				onValueChange={(value) => {
					setSelectedValue(value);
					// Find the full state object to pass to the parent component
					const selectedState = data.find((option) => option.name === value);
					if (selectedState) {
						onSelectJurisdiction(selectedState);
					}
				}}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder='Select an option'>
						{selectedValue ? (
							<div className='flex items-center gap-2'>
								<img
									src={data.find((opt) => opt.name === selectedValue)?.flagUrl}
									alt={`${selectedValue} flag`}
									className='w-5 h-auto rounded-sm' // Smaller flag for trigger
								/>
								<span>{selectedValue}</span>
							</div>
						) : (
							"Select an option" // Placeholder when nothing is selected
						)}
					</SelectValue>
				</SelectTrigger>

				<SelectContent>
					{data.map((option) => (
						<SelectItem key={option.abbreviation} value={option.name}>
							<img
								src={option.flagUrl}
								alt={`${option.name} flag`}
								className='w-5 h-auto rounded-sm'
							/>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className='mt-4 text-sm text-gray-600'>
				Selected:{" "}
				<span className='font-semibold'>
					{data.find((opt) => opt.name === selectedValue)?.name || "None"}
				</span>
			</p>
		</div>
	);
};

export default JurisdictionSelector;
