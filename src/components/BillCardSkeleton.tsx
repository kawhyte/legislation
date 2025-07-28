import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

const BillCardSkeleton = () => {
	return (
		<Card className='w-full'>
			<CardHeader className='flex flex-row items-center gap-3 space-y-0 pb-2'>
				{/* Avatar Skeleton */}
				<Skeleton className='h-8 w-8 rounded-full' />

				{/* CardTitle Skeleton */}
				<div className='flex-1 space-y-1'>
					<Skeleton className='h-4 w-3/4' />
				</div>
			</CardHeader>
			<CardContent className='space-y-3 pt-4'>
				{/* Status and Introduced Dates Skeleton (if you uncommented them in actual card) */}
				<div className='flex justify-between text-xs text-gray-500'>
					<Skeleton className='h-3 w-1/3' />
					<Skeleton className='h-3 w-1/4' />
				</div>

				{/* Progress Section Skeleton */}
				<div className='mt-4 space-y-2'>
					<div className='relative flex justify-between text-[10px] font-medium text-gray-600'>
						<Skeleton className='h-3 w-1/5' />{" "}
						{/* "Introduced" label skeleton */}
						<Skeleton className='h-3 w-1/6' /> {/* "House" label skeleton */}
						<Skeleton className='h-3 w-1/6' /> {/* "Senate" label skeleton */}
						<Skeleton className='h-3 w-1/5' />{" "}
						{/* "Became Law" label skeleton */}
					</div>
					<Skeleton className='h-2 w-full rounded-full' />{" "}
					{/* Progress bar skeleton */}
					<div className='relative flex justify-between text-xs text-gray-500 mt-1'>
						<Skeleton className='h-3 w-1/5' /> {/* Introduced date skeleton */}
						<Skeleton className='h-3 w-1/6' /> {/* House date skeleton */}
						<Skeleton className='h-3 w-1/6' /> {/* Senate date skeleton */}
						<Skeleton className='h-3 w-1/5' /> {/* Enacted date skeleton */}
					</div>
				</div>

				{/* Bill Title Skeleton */}
				<Skeleton className='h-4 w-full' />
				{/* Last Activity Skeleton */}
				<Skeleton className='h-3 w-5/6' />

				{/* Bill Source(s) Skeleton */}
				<div className='text-xs text-gray-500 flex flex-wrap gap-2 items-center'>
					<Skeleton className='h-3 w-1/4' />{" "}
					{/* "Bill Source(s):" text skeleton */}
					<Skeleton className='h-5 w-16 rounded' /> {/* Badge skeleton 1 */}
					<Skeleton className='h-5 w-16 rounded' /> {/* Badge skeleton 2 */}
				</div>
			</CardContent>
		</Card>
	);
};

export default BillCardSkeleton;
