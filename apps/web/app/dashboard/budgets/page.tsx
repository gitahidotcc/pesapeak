import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";

const dummyBudgets = [
    {
        id: "1",
        category: "Food & Dining",
        allocated: 500,
        spent: 342.15,
        remaining: 157.85,
        color: "bg-orange-500",
    },
    {
        id: "2",
        category: "Transportation",
        allocated: 200,
        spent: 156.80,
        remaining: 43.20,
        color: "bg-blue-500",
    },
    {
        id: "3",
        category: "Entertainment",
        allocated: 150,
        spent: 89.99,
        remaining: 60.01,
        color: "bg-purple-500",
    },
    {
        id: "4",
        category: "Shopping",
        allocated: 300,
        spent: 124.99,
        remaining: 175.01,
        color: "bg-pink-500",
    },
    {
        id: "5",
        category: "Healthcare",
        allocated: 100,
        spent: 45.00,
        remaining: 55.00,
        color: "bg-green-500",
    },
    {
        id: "6",
        category: "Utilities",
        allocated: 250,
        spent: 230.45,
        remaining: 19.55,
        color: "bg-yellow-500",
    },
];

export default async function BudgetsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    const totalAllocated = dummyBudgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = dummyBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
                <p className="mt-2 text-muted-foreground">
                    Track your spending against your budget goals
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Total Allocated
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                        ${totalAllocated.toFixed(2)}
                    </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Total Spent
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                        ${totalSpent.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget
                    </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Remaining
                    </p>
                    <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                        ${totalRemaining.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                    Budget Categories
                </h2>
                <button className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
                    Create Budget
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {dummyBudgets.map((budget) => {
                    const percentSpent = (budget.spent / budget.allocated) * 100;
                    const isOverBudget = percentSpent > 100;
                    const isNearLimit = percentSpent > 80 && percentSpent <= 100;

                    return (
                        <div
                            key={budget.id}
                            className="rounded-2xl border border-border bg-card p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${budget.color}`} />
                                    <h3 className="font-semibold text-foreground">
                                        {budget.category}
                                    </h3>
                                </div>
                                <span
                                    className={`text-sm font-medium ${isOverBudget
                                            ? "text-red-600 dark:text-red-400"
                                            : isNearLimit
                                                ? "text-yellow-600 dark:text-yellow-400"
                                                : "text-muted-foreground"
                                        }`}
                                >
                                    {percentSpent.toFixed(0)}%
                                </span>
                            </div>

                            <div className="mt-4">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={`h-full transition-all ${isOverBudget
                                                ? "bg-red-500"
                                                : isNearLimit
                                                    ? "bg-yellow-500"
                                                    : budget.color
                                            }`}
                                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm">
                                <div>
                                    <p className="text-muted-foreground">Spent</p>
                                    <p className="font-semibold text-foreground">
                                        ${budget.spent.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted-foreground">Budget</p>
                                    <p className="font-semibold text-foreground">
                                        ${budget.allocated.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {isOverBudget && (
                                <div className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                    Over budget by ${(budget.spent - budget.allocated).toFixed(2)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
