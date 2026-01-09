
import { Skeleton } from "@/components/ui/skeleton";

export function TransactionListSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2].map((groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((itemIndex) => (
                            <div
                                key={itemIndex}
                                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                            >
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
