// src/components/JurisdictionSelector.tsx
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// import useGetJurisdictions, { type Jurisdiction } from "@/hooks/useGetJurisdictions";
import usStates from "@/data/usStates"; // This import is already present

export interface States{
name:string,
abbreviation:string,
flagUrl:string

}
interface Props {
	// onSelectJurisdiction: (jurisdiction: Jurisdiction) => void;
	onSelectJurisdiction: (jurisdiction:States) => void;
}


const JurisdictionSelector = ({ onSelectJurisdiction }: Props) => {
	// Set the initial selected value to the name of the first state
	const [selectedValue, setSelectedValue] = useState<string>(usStates[0].name); // <--- Change this line

	// const { data } = useGetJurisdictions();
	const data = usStates

	return (
		<div className='w-64 p-4'>
			<Select value={selectedValue} onValueChange={(value) => { // <--- Modify onValueChange
				setSelectedValue(value);
				onSelectJurisdiction(data.find(option => option.name === value) || usStates[0]); // Pass the full state object
			}}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder='Select an option' />
				</SelectTrigger>

				<SelectContent>
					{data.map((option) => (
						<SelectItem key={option.abbreviation} value={option.name}>
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