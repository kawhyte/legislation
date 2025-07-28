import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usStates from '@/data/usStates';

const StateSelector = () => {
  const [selectedValue, setSelectedValue] = useState<string>("Alabama");

  // Options for the dropdown.
  // Each option has a 'value' (internal identifier) and a 'label' (what the user sees).
  // const options = [
  //   { value: "outline", label: "Outline" },
  //   { value: "past-performance", label: "Past Performance" },
  //   { value: "key-personnel", label: "Key Personnel" },
  //   { value: "focus-documents", label: "Focus Documents" },
  // ];

  const options = usStates

  return (
    <div className="w-64 p-4"> {/* Wrapper div for demonstration purposes */}
      <Select value={selectedValue} onValueChange={setSelectedValue}>
        {/* SelectTrigger is the visible part of the dropdown before it's opened. */}
        {/* It displays the currently selected value. */}
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>

        {/* SelectContent is the dropdown menu that appears when the trigger is clicked. */}
        <SelectContent>
          {/* Map over the options to create individual SelectItem components. */}
          {options.map((option) => (
            <SelectItem key={option.abbreviation} value={option.abbreviation}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Optional: Display the selected value for demonstration */}
      <p className="mt-4 text-sm text-gray-600">
        Selected: <span className="font-semibold">{options.find(opt => opt.abbreviation === selectedValue)?.name || "None"}</span>
      </p>
    </div>
  );
}

export default StateSelector