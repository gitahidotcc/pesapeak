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
    isFee?: boolean;
}

export function TransactionItem({
    transaction,
    onClick,
    getAccountName,
    getCategoryName,
    formatCurrency,
    formatTime,
    currency,
    isFee = false,
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
        if (isFee) {
            return "h-8 w-8 sm:h-9 sm:w-9 bg-muted-foreground/10 text-muted-foreground";
        }
        
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
        <div className="group relative">
            {isFee && (
                <div className="absolute -left-4 sm:-left-6 top-0 bottom-1/2 w-px bg-border/30" />
            )}
            <div
                onClick={onClick}
                className={cn(
                    "flex cursor-pointer items-center gap-3 sm:gap-4 rounded-xl border border-border/40 bg-card/60 p-3 sm:p-3.5 transition-all hover:border-border hover:bg-muted/60 hover:shadow-md active:scale-[0.99] touch-manipulation",
                    isFee && "border-l-2 border-l-muted-foreground/30 bg-muted/10"
                )}
            >
                {/* Icon */}
                <div
                    className={cn(
                        "flex shrink-0 items-center justify-center rounded-2xl border border-border/50 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md",
                        getIconClassName()
                    )}
                    style={
                        !isFee && categoryColor
                            ? {
                                backgroundColor: `${categoryColor}15`,
                                color: categoryColor,
                                borderColor: `${categoryColor}40`,
                            }
                            : undefined
                    }
                >
                    {isFee ? (
                        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-60" />
                    ) : (
                        <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <div className="flex items-center justify-between gap-4">
                        <span className={cn(
                            "truncate font-medium",
                            isFee ? "text-sm text-muted-foreground" : "text-foreground"
                        )}>
                            {isFee 
                                ? transaction.notes || getCategoryName(transaction.categoryId)
                                : isTransfer
                                    ? `Transfer to ${getAccountName(transaction.toAccountId)}`
                                    : transaction.notes || getCategoryName(transaction.categoryId)}
                        </span>
                        <span
                            className={cn(
                                "whitespace-nowrap tabular-nums",
                                isFee 
                                    ? "text-sm sm:text-base font-semibold text-muted-foreground"
                                    : "text-lg sm:text-xl font-bold",
                                !isFee && isIncome && "text-emerald-600 dark:text-emerald-400",
                                !isFee && isExpense && "text-foreground",
                                !isFee && isTransfer && "text-foreground"
                            )}
                        >
                            {!isFee && isIncome && "+"}
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
        </div>
    );
}
