import {
    Banknote,
    Wallet,
    CreditCard,
    PiggyBank,
    Coins,
    Landmark,
    Building,
    Building2,
    Home,
    Briefcase,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Euro,
    Bitcoin,
    Smartphone,
    Car,
    Plane,
    Gift,
    Heart,
    Plus,
    Minus,
    ArrowRightLeft,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
    banknote: Banknote,
    wallet: Wallet,
    "credit-card": CreditCard,
    "piggy-bank": PiggyBank,
    coins: Coins,
    landmark: Landmark,
    building: Building,
    "building-2": Building2,
    home: Home,
    briefcase: Briefcase,
    "shopping-cart": ShoppingCart,
    "trending-up": TrendingUp,
    "dollar-sign": DollarSign,
    euro: Euro,
    bitcoin: Bitcoin,
    smartphone: Smartphone,
    car: Car,
    plane: Plane,
    gift: Gift,
    heart: Heart,
};

export interface TransactionItemProps {
    transaction: any; // Using any for now to avoid circular dependency issues, ideally should be a shared type
    onClick: () => void;
    getAccountName: (id: string | null) => string;
    getCategoryName: (id: string | null) => string;
    formatCurrency: (amount: number, currency?: string) => string;
    formatTime: (time: string | null) => string;
    currency: string;
    fees?: any[];
}

export function TransactionItem({
    transaction,
    onClick,
    getAccountName,
    getCategoryName,
    formatCurrency,
    formatTime,
    currency,
    fees = [],
}: TransactionItemProps) {
    const isIncome = transaction.type === "income";
    const isExpense = transaction.type === "expense";
    const isTransfer = transaction.type === "transfer";

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "income":
                return Plus;
            case "expense":
                return Minus;
            case "transfer":
                return ArrowRightLeft;
            default:
                return Minus;
        }
    };

    const CategoryIcon =
        transaction.categoryIcon && ICON_MAP[transaction.categoryIcon]
            ? ICON_MAP[transaction.categoryIcon]
            : getTransactionIcon(transaction.type);

    const categoryColor = transaction.categoryColor || undefined;

    // Helper function to get icon container className
    const getIconClassName = (): string => {
        if (categoryColor) {
            return "h-10 w-10 sm:h-12 sm:w-12";
        }

        if (isIncome) {
            return "h-10 w-10 sm:h-12 sm:w-12 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
        }

        if (isExpense) {
            return "h-10 w-10 sm:h-12 sm:w-12 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400";
        }

        if (isTransfer) {
            return "h-10 w-10 sm:h-12 sm:w-12 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
        }

        return "h-10 w-10 sm:h-12 sm:w-12";
    };

    // Render main transaction
    return (
        <div className="group relative rounded-xl border border-border/40 bg-card/60 transition-all hover:border-border hover:bg-muted/60 hover:shadow-md">
            <div
                onClick={onClick}
                className="flex cursor-pointer items-center gap-3 sm:gap-4 p-3 sm:p-3.5 touch-manipulation"
            >
                {/* Icon */}
                <div
                    className={cn(
                        "flex shrink-0 items-center justify-center rounded-2xl border border-border/50 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md",
                        getIconClassName()
                    )}
                    style={
                        categoryColor
                            ? {
                                backgroundColor: `${categoryColor}15`,
                                color: categoryColor,
                                borderColor: `${categoryColor}40`,
                            }
                            : undefined
                    }
                >
                    <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <div className="flex items-center justify-between gap-4">
                        <span className="truncate font-medium text-foreground">
                            {isTransfer
                                ? `Transfer to ${getAccountName(transaction.toAccountId)}`
                                : transaction.notes || getCategoryName(transaction.categoryId)}
                        </span>
                        <span
                            className={cn(
                                "whitespace-nowrap tabular-nums text-lg sm:text-xl font-bold",
                                isIncome && "text-emerald-600 dark:text-emerald-400",
                                isExpense && "text-foreground",
                                isTransfer && "text-foreground"
                            )}
                        >
                            {isIncome && "+"}
                            {isExpense && "-"}
                            {formatCurrency(transaction.amount, currency)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                        <div className="flex items-center gap-2 truncate">
                            {!isTransfer && (
                                <>
                                    <span className="font-medium text-muted-foreground">{getCategoryName(transaction.categoryId)}</span>
                                    <span className="text-muted-foreground/40">•</span>
                                </>
                            )}
                            <span>{getAccountName(transaction.accountId || transaction.fromAccountId)}</span>
                        </div>
                        {transaction.time && (
                            <span className="font-medium tabular-nums opacity-70 group-hover:opacity-100">
                                {formatTime(transaction.time)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Fees Section */}
            {fees.length > 0 && (
                <div className="border-t border-border/30 bg-muted/20 rounded-b-xl px-3 py-2 sm:px-3.5 sm:py-2.5 space-y-2">
                    {fees.map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/10">
                                    <Minus className="h-3 w-3" />
                                </div>
                                <span className="truncate max-w-[150px] sm:max-w-xs">{fee.notes || "Transaction Fee"}</span>
                            </div>
                            <span className="tabular-nums font-medium text-muted-foreground">
                                -{formatCurrency(fee.amount, currency)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
