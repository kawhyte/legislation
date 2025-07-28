import type { Bill } from "../hooks/useBills";
import usStates from '../data/usStates';

// Import shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BillCardProps {
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
        <Card className='w-full'> {/* Use Card component for the main container */}
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <Avatar className="w-8 h-8"> {/* Use Avatar for the flag */}
                    <AvatarImage src={flagUrl} alt={`${bill.jurisdiction.name} flag`} />
                    <AvatarFallback>N/A</AvatarFallback> {/* Fallback for missing image */}
                </Avatar>
                <CardTitle className='text-blue-700 font-semibold text-sm'>
                    {bill.jurisdiction.name
                        ? `${bill.jurisdiction.name} - ${bill.identifier}`
                        : "N/A"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4"> {/* CardContent for the main bill details */}
                <div className='flex justify-between text-xs text-gray-500'>
                    <span>Introduced: {bill.introduced || "N/A"}</span>
                    <span>Status: {bill.status || "N/A"}</span>
                </div>
                <CardDescription className='text-xs text-gray-700'>
                    {bill.title ? bill.title : "N/A"}
                </CardDescription>
                <p className='text-xs text-gray-700'>
                    Last activity posted on{" "}
                    {bill.latest_action_date ? bill.latest_action_date : "N/A"}
                </p>

                <div className='text-xs text-gray-500 flex flex-wrap gap-2 items-center'>
                    Bill Source(s):
                    {bill.sources && bill.sources.length > 0 ? (
                        bill.sources.map((src, idx) => (
                            <Badge key={idx} variant="secondary" className='bg-blue-100 text-blue-800 font-medium'>
                                {src}
                            </Badge>
                        ))
                    ) : (
                        <span>N/A</span>
                    )}
                </div>
            </CardContent>
            {/* You could add a CardFooter here if there were actions or a call to action */}
            {/* <CardFooter>
                <Button>View Details</Button>
            </CardFooter> */}
        </Card>
    );
};

export default BillCard;