import { Skeleton } from "@/components/ui/skeleton"

export function TimelineSkeleton() {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
            {/* Header Skeleton */}
            <div className="space-y-4 text-center mb-12">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>

            {/* Timeline Items Skeleton */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                        <div className="w-0.5 h-full bg-border flex-1 my-2"></div>
                    </div>
                    <div className="flex-1 space-y-3 pb-8">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
