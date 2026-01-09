
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
}

export function TransactionItem({
    transaction,
    onClick,
    getAccountName,
    getCategoryName,
    formatCurrency,
    formatTime,
    currency,
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

    // Render main transaction
    return (
        <div className="group relative">
            <div
                onClick={onClick}
                className="flex cursor-pointer items-center gap-4 rounded-xl border border-transparent bg-card/50 p-3 transition-all hover:border-border/50 hover:bg-muted/50 hover:shadow-sm"
            >
                {/* Icon */}
                <div
                    className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/40 shadow-sm transition-transform group-hover:scale-105",
                        categoryColor ? undefined : isIncome && "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                        categoryColor ? undefined : isExpense && "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
                        categoryColor ? undefined : isTransfer && "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                    )}
                    style={
                        categoryColor
                            ? {
                                backgroundColor: `${categoryColor}15`,
                                color: categoryColor,
                                borderColor: `${categoryColor}30`,
                            }
                            : undefined
                    }
                >
                    <CategoryIcon className="h-5 w-5" />
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
                                "whitespace-nowrap text-base font-semibold",
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
        </div>
    );
}
