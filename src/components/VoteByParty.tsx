import { Badge } from "@/components/ui/badge";

interface VoteByPartyProps {
    democratVotes: number;
    republicanVotes: number;
    otherVotes: number;
}

const VoteByParty = ({ democratVotes, republicanVotes, otherVotes }: VoteByPartyProps) => {
    return (
        <div className='w-full px-5'>
            <label className='text-sm font-mono text-foreground/80 block mb-2'>
                Votes by Party
            </label>
            <div className='flex flex-wrap items-center gap-2'>
                {/* UPDATED: Democrat Pill now uses the theme's "info" color */}
                <Badge className='flex items-center gap-1.5 text-xs px-2.5 rounded-lg bg-info/10 text-info border border-info/20'>
                    <span className='font-medium text-xs'>DEM</span>
                    <span className='font-medium text-xs'>{democratVotes}</span>
                </Badge>
                
                {/* UPDATED: Republican Pill now uses the theme's "destructive" color */}
                <Badge className='flex items-center gap-1.5 text-xs px-2.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20'>
                    <span className='font-medium text-xs'>REP</span>
                    <span className='font-medium text-xs'>{republicanVotes}</span>
                </Badge>

                {/* UPDATED: Other Pill now uses the theme's "muted" colors */}
                <Badge className='flex items-center gap-1.5 text-xs px-2.5 rounded-lg bg-muted text-muted-foreground border border-border'>
                    <span className='font-medium text-xs'>OTHER</span>
                    <span className='font-medium text-xs'>{otherVotes}</span>
                </Badge>
            </div>
        </div>
    );
};

export default VoteByParty;