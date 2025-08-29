import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import usStates from "@/data/usStates";

export interface States {
    name: string;
    abbreviation: string;
    flagUrl?: string;
    coords?: { lon: number; lat: number };
    zoom?: number;
    // mapUrl: string;
}
interface Props {
    onSelectJurisdiction: (jurisdiction: States | null) => void;
    selectedJurisdiction: States | null;
}

const JurisdictionSelector = ({ onSelectJurisdiction, selectedJurisdiction }: Props) => {
    const data = usStates;
    const selectedValue = selectedJurisdiction?.name || "";

    return (
        <div className='flex-1'>
            <Select
                value={selectedValue}
                onValueChange={(value) => {
                    const selectedState = data.find((option) => option.name === value);
                    onSelectJurisdiction(selectedState || null);
                }}>
            <SelectTrigger className='w-full text-base py-6 px-4 bg-card border-border'>
        <SelectValue placeholder='Select your state to see relevant bills...'>
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
                "Select your state to see relevant bills..." // Updated placeholder
            )}
        </SelectValue>
    </SelectTrigger>

                <SelectContent className="bg-popover text-popover-foreground border-border">
                    <SelectGroup>
                        <SelectLabel>States</SelectLabel>
                        {data.map((option) => (
                            <SelectItem key={option.abbreviation} value={option.name}
                            
                            className='flex items-center gap-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                            >
                                <img
                                    src={option.flagUrl}
                                    alt={`${option.name} flag`}
                                    className='w-5 h-auto rounded-sm'
                                />
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default JurisdictionSelector;