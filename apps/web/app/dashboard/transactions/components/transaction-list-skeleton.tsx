
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TransactionListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {[1, 2].map((groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-border/60 pb-3">
                        <Skeleton className="h-5 w-40" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((itemIndex) => (
                            <div
                                key={itemIndex}
                                className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/60 p-3.5"
                            >
                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3.5 w-32" />
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

interface LoadingMoreIndicatorProps {
    className?: string;
}

export function LoadingMoreIndicator({ className }: LoadingMoreIndicatorProps) {
    return (
        <div className={cn("flex items-center justify-center py-6", className)}>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                </div>
                <span>Loading more transactions...</span>
            </div>
        </div>
    );
}
