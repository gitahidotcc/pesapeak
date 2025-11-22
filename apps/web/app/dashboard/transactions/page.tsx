import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { FloatingActionButtonWrapper } from "./components/floating-action-button-wrapper";

const dummyTransactions = [
    {
        id: "1",
        date: "2025-11-21",
        description: "Salary Deposit",
        category: "Income",
        amount: 4200,
        status: "completed",
        account: "Main Checking",
    },
    {
        id: "2",
        date: "2025-11-20",
        description: "Grocery Store",
        category: "Food & Dining",
        amount: -87.45,
        status: "completed",
        account: "Credit Card",
    },
    {
        id: "3",
        date: "2025-11-19",
        description: "Netflix Subscription",
        category: "Entertainment",
        amount: -15.99,
        status: "completed",
        account: "Main Checking",
    },
    {
        id: "4",
        date: "2025-11-18",
        description: "Gas Station",
        category: "Transportation",
        amount: -52.30,
        status: "completed",
        account: "Credit Card",
    },
    {
        id: "5",
        date: "2025-11-17",
        description: "Coffee Shop",
        category: "Food & Dining",
        amount: -6.75,
        status: "completed",
        account: "Main Checking",
    },
    {
        id: "6",
        date: "2025-11-25",
        description: "Rent Payment",
        category: "Housing",
        amount: -1200,
        status: "pending",
        account: "Main Checking",
    },
    {
        id: "7",
        date: "2025-11-16",
        description: "Online Shopping",
        category: "Shopping",
        amount: -124.99,
        status: "completed",
        account: "Credit Card",
    },
];

export default async function TransactionsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    return (
        <>
            <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
                <p className="mt-2 text-muted-foreground">
                    Monitor all your financial activity in one place
                </p>
            </header>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                        All Transactions
                    </button>
                    <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                        Income
                    </button>
                    <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                        Expenses
                    </button>
                </div>
                <button className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
                    Add Transaction
                </button>
            </div>

            <div className="rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Account
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {dummyTransactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="transition-colors hover:bg-muted/50"
                                >
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {new Date(transaction.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                                        {transaction.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {transaction.category}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {transaction.account}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${transaction.status === "completed"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}
                                        >
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td
                                        className={`px-6 py-4 text-right text-sm font-semibold ${transaction.amount > 0
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-foreground"
                                            }`}
                                    >
                                        {transaction.amount > 0 ? "+" : ""}$
                                        {Math.abs(transaction.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
            <FloatingActionButtonWrapper />
        </>
    );
}
