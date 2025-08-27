import { Badge } from "@/components/ui/badge";

interface VoteByPartyProps {
    democratVotes: number;
    republicanVotes: number;
    otherVotes: number;
}

const VoteByParty = ({ democratVotes, republicanVotes, otherVotes }: VoteByPartyProps) => {
    return (
        <div className='w-full px-5'>
            <label className='text-sm  font-mono  text-foreground/80 block mb-2'>
                Votes by Party
            </label>
            <div className='flex flex-wrap items-center gap-2'>
                {/* Democrat Pill */}
                <Badge className='flex items-center gap-1.5 text-xs px-2.5 rounded-lg bg-blue-50 text-blue-500 border border-blue-100'>
                    <span className='font-medium text-xs'>DEM</span>
                    <span className='font-medium text-xs'>{democratVotes}</span>
                </Badge>
                {/* Republican Pill */}
                <Badge className='flex items-center gap-1.5 text-xs px-2.5 rounded-lg bg-red-50 text-red-500 border border-red-100'>
                    <span className='font-medium text-xs'>REP</span>
                    <span className='font-medium text-xs'>{republicanVotes}</span>
                </Badge>
                {/* Other Pill */}
                <Badge className='flex items-center gap-1.5 text-xs px-2.5 rounded-lg bg-gray-50 text-gray-500 border border-gray-100'>
                    <span className='font-medium text-xs'>OTHER</span>
                    <span className='font-medium text-xs'>{otherVotes}</span>
                </Badge>

            </div>
        </div>
    );
};

export default VoteByParty;
