import { and, desc, eq, gte, or } from "drizzle-orm";
import { z } from "zod";
import { financialAccounts, transactions } from "@pesapeak/db/schema";
import { authedProcedure, router } from "../index";

const historyInputSchema = z.object({
    accountId: z.string().optional(),
    startDate: z.string(), // YYYY-MM-DD
    endDate: z.string(), // YYYY-MM-DD
    timezone: z.string().default("UTC"),
});

export const dashboardRouter = router({
    history: authedProcedure
        .input(historyInputSchema)
        .output(
            z.object({
                daily: z.array(
                    z.object({
                        date: z.string(),
                        balance: z.number(),
                        income: z.number(),
                        expenses: z.number(),
                    })
                ),
                totalIncome: z.number(),
                totalExpenses: z.number(),
            })
        )
        .query(async ({ ctx, input }) => {
            // 1. Get current balance for the selected scope
            const accountConditions = [eq(financialAccounts.userId, ctx.user.id)];
            if (input.accountId) {
                accountConditions.push(eq(financialAccounts.id, input.accountId));
            }

            const accounts = await ctx.db
                .select({
                    id: financialAccounts.id,
                    balance: financialAccounts.totalBalance,
                })
                .from(financialAccounts)
                .where(and(...accountConditions));

            let currentTotalBalance = accounts.reduce(
                (acc, curr) => acc + (curr.balance || 0),
                0
            );

            // 2. Fetch transactions from (EndDate + 1 day) back to StartDate
            // We need transactions up to "now" to trace back correctly if endDate is today.
            // Actually, if we just fetch ALL transactions since StartDate, we can reconstruct forward?
            // No, "Current Balance" is the snapshot at THIS MOMENT.
            // To get balance at EndDate (if EndDate < Today), we need to reverse transactions from Now to EndDate.
            // To get balance at StartDate, we need to reverse further.

            // Let's assume the user wants to see the trend between StartDate and EndDate.
            // We need to find the balance at the END of EndDate.
            // Balance(Now) is known.
            // Transactions between EndDate(end) and Now needed to be reversed.

            // Parse dates in user's timezone if possible, but for now allow simple string comparison or UTC
            // We will treat the input dates as the "End" of that day in UTC roughly for filtering

            const startDateTime = new Date(input.startDate);
            startDateTime.setUTCHours(0, 0, 0, 0);

            const endDateTime = new Date(input.endDate);
            endDateTime.setUTCHours(23, 59, 59, 999);

            // We need all transactions from StartDate up to NOW to calculate properly? 
            // Or we can fetch StartDate -> Now.
            // Then we can walk backwards from Now.

            const transactionConditions = [eq(transactions.userId, ctx.user.id)];

            if (input.accountId) {
                // For specific account, we look at transactions involving it
                // Note: Transfers OUT reduce balance, Transfers IN increase it.
                // Expenses reduce, Income increases.
                // We need to filter properly.
                const accountCondition = or(
                    eq(transactions.accountId, input.accountId),
                    eq(transactions.fromAccountId, input.accountId),
                    eq(transactions.toAccountId, input.accountId)
                );
                if (accountCondition) {
                    transactionConditions.push(accountCondition);
                }
            } else {
                // All accounts: Transfers between own accounts cancel out in TOTAL balance?
                // Yes, if I transfer 100 from A to B, total balance change is 0.
                // expense: decreases total. income: increases total.
                // So for "All Accounts" view, transfers are irrelevant for the *total balance line*, 
                // BUT they are relevant for *individual account balance reconstruction* if we were doing that.
                // Here we just want the aggregate line.
            }

            // We'll fetch all transactions from StartDate to NOW.
            const allTxns = await ctx.db
                .select({
                    id: transactions.id,
                    type: transactions.type,
                    amount: transactions.amount,
                    date: transactions.date,
                    accountId: transactions.accountId,
                    fromAccountId: transactions.fromAccountId,
                    toAccountId: transactions.toAccountId,
                })
                .from(transactions)
                .where(
                    and(
                        ...transactionConditions,
                        gte(transactions.date, startDateTime)
                        // We don't cap at endDateTime because we need to trace back from NOW if endDate is in the past?
                        // Wait, if I have current balance, and I want balance at EndDate.
                        // Balance(EndDate) = Balance(Now) - (Income(EndDate+1...Now) - Expense(EndDate+1...Now)).
                        // So yes, we need transactions > EndDate too specifically to "undo" them.
                    )
                )
                .orderBy(desc(transactions.date));

            // 3. Process day by day
            // Create a map of days.
            const dayMap = new Map<string, { balance: number; income: number; expense: number }>();

            // Generate all days in range
            const dayList: string[] = [];
            let iter = new Date(startDateTime);
            // Ensure we don't go into infinite loop
            while (iter <= endDateTime) {
                dayList.push(iter.toISOString().split("T")[0]);
                iter.setDate(iter.getDate() + 1);
            }

            // Initialize map
            dayList.forEach(d => dayMap.set(d, { balance: 0, income: 0, expense: 0 }));

            // We start with `currentRunningBalance` = `currentTotalBalance` (Now).
            // We iterate through transactions from NOW backwards.
            // If transaction.date > EndDate, we just use it to adjust balance, but don't record income/expense for the chart.
            // If transaction.date <= EndDate and >= StartDate, we adjust balance AND record income/expense.

            let currentRunningBalance = currentTotalBalance;

            // Group transactions by day YYYY-MM-DD
            // Since `allTxns` is ordered DESC (updates most recent first), we are going back in time.
            // For a transaction T on day D:
            // BEFORE T happened (time T-1), Balance was `Current - Delta`.
            // AFTER T happened (time T), Balance was `Current`.
            // So effectively, as we go BACKWARDS:
            // adjustedBalance = currentRunningBalance - delta.

            // Delta rules:
            // Income: +amount.  (Reverse: -amount)
            // Expense: -amount. (Reverse: +amount)
            // Transfer: 
            //   If simple Mode (All Accounts): Net change is 0.
            //   If specific Account A:
            //      Transfer FROM A: -amount. (Reverse: +amount)
            //      Transfer TO A: +amount.   (Reverse: -amount)

            // We need to group by day to set the "End of Day" balance.
            // But multiple transactions happen in a day.
            // The Balance at the END of day D is the balance BEFORE any transactions of day D+1 happened.

            // We can iterate transactions. 
            // If we encounter a transaction on Day X. 
            // That means strictly speaking, the balance changed at that moment.
            // But we represent "Daily Balance" usually as end-of-day balance.

            // Strategy:
            // 1. Buckets for each day in [StartDate, EndDate].
            // 2. Iterate transactions from Now -> Past.
            // 3. Keep tracking `currentRunningBalance`.
            // 4. If we are in the "Future" (Date > EndDate), simply reverse the effect to get to EndDate balance.
            // 5. If we are in the "Window" (Date inside range), we record stats.
            //    Wait, we need the balance at the END of the day.
            //    So for Day D, we want the balance AFTER all Day D transactions occurred.
            //    As we traverse backwards, we encounter Day D transactions (latest first).
            //    The FIRST time we see a Day D transaction (most recent), `currentRunningBalance` is the value AFTER that transaction?
            //    No, `currentRunningBalance` is the state *after* the transaction we haven't processed yet?
            //    Let's trace:
            //    State: Balance = 100.
            //    Txn1 (Day D, 15:00): -10.  (Real effect: 110 -> 100).
            //    Processing Txn1: It WAS an expense. So before it, balance was 110.
            //    So `currentRunningBalance` becomes 110.
            //    The balance at the END of Day D was 100. 
            //    So we should capture the balance for Day D *before* we start processing Day D's transactions?
            //    Yes. If we are walking backwards from D+1 to D.
            //    The moment we cross the boundary from D+1 to D, the `currentRunningBalance` IS the End-Of-Day balance for D.

            let totalIncome = 0;
            let totalExpenses = 0;

            // Pointer to current processing date (initially Now)
            // We will iterate through the requested days from End to Start?
            // Or just iterate transactions.

            // Let's use a pointer in the `dayList` (which is ASC).
            // trace backwards.

            const dayListDesc = [...dayList].reverse(); // EndDate -> StartDate

            // Transaction Index
            let txnIdx = 0;

            // Helper to check if txn is after the current target day
            // But txns are sorted DESC. 

            const results = [];

            // We need to handle the gap between NOW and EndDate first.
            // Consume all transactions where date > EndDate (end of day).
            while (txnIdx < allTxns.length) {
                const txn = allTxns[txnIdx];
                const txnDate = txn.date.toISOString().split("T")[0];

                if (txnDate > input.endDate) {
                    // Revert this transaction
                    currentRunningBalance = revertTransaction(currentRunningBalance, txn, input.accountId);
                    txnIdx++;
                } else {
                    break;
                }
            }

            // Now `currentRunningBalance` is the balance at the end of `input.endDate`.
            // Now iterate through our requested days (Desc).

            for (const day of dayListDesc) {
                // Record the balance for this day (End of Day)
                const endOfDayBalance = currentRunningBalance;

                let dayIncome = 0;
                let dayExpense = 0;

                // Process all transactions that happened ON this day
                while (txnIdx < allTxns.length) {
                    const txn = allTxns[txnIdx];
                    const txnDate = txn.date.toISOString().split("T")[0];

                    if (txnDate === day) {
                        // This txn is part of this day
                        // Add to totals
                        if (txn.type === 'income') {
                            // Check if account filter applies for the stats (it should)
                            // If global view: income is income.
                            // If specific account: income to THIS account is income. 
                            // (Already filtered by SQL query)
                            if (!input.accountId || txn.accountId === input.accountId) {
                                dayIncome += txn.amount;
                            }
                        } else if (txn.type === 'expense') {
                            if (!input.accountId || txn.accountId === input.accountId) {
                                dayExpense += txn.amount;
                            }
                        }
                        // Transfers? 
                        // If specific account view:
                        // Transfer IN = effectively income logic for balance, but maybe not "Income" category?
                        // Usually dashboard Income/Expense refers to meaningful flow, not transfers.
                        // But for balance chart accuracy, we must revert.

                        // Revert the balance effect
                        currentRunningBalance = revertTransaction(currentRunningBalance, txn, input.accountId);
                        txnIdx++;
                    } else {
                        // txnDate < day (older), so we are done with this day
                        break;
                    }
                }

                results.push({
                    date: day,
                    balance: endOfDayBalance,
                    income: dayIncome,
                    expenses: dayExpense
                });

                totalIncome += dayIncome;
                totalExpenses += dayExpense;
            }

            return {
                daily: results.reverse(), // Return chronological
                totalIncome,
                totalExpenses
            };
        }),
});

function revertTransaction(currentBalance: number, txn: any, targetAccountId?: string): number {
    // Returns the balance BEFORE this transaction happened.
    // Logic: 
    // If it INCREASED balance (Income), we SUBTRACT.
    // If it DECREASED balance (Expense), we ADD.

    // Global View (targetAccountId undefined):
    // Income: +Amount -> Revert: -Amount
    // Expense: -Amount -> Revert: +Amount
    // Transfer: 0 change -> Revert: 0 change

    // Single Account View:
    // Income (to acc): +Amount -> Revert: -Amount
    // Expense (from acc): -Amount -> Revert: +Amount
    // Transfer In (to acc): +Amount -> Revert: -Amount
    // Transfer Out (from acc): -Amount -> Revert: +Amount

    const amount = txn.amount ?? 0;

    if (!targetAccountId) {
        if (txn.type === 'income') return currentBalance - amount;
        if (txn.type === 'expense') return currentBalance + amount;
        return currentBalance;
    } else {
        // Specific Account
        if (txn.type === 'income') {
            return currentBalance - amount;
        } else if (txn.type === 'expense') {
            return currentBalance + amount;
        } else if (txn.type === 'transfer') {
            if (txn.toAccountId === targetAccountId) {
                // Incoming transfer increased balance
                return currentBalance - amount;
            } else if (txn.fromAccountId === targetAccountId) {
                // Outgoing transfer decreased balance
                return currentBalance + amount;
            }
        }
        return currentBalance;
    }
}

// Note: we use the `or` helper from `drizzle-orm` for composable SQL conditions.
