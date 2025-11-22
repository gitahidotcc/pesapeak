import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { FloatingActionButtonWrapper } from "./transactions/components/floating-action-button-wrapper";

const quickMetrics = [
  { label: "Available balance", value: "$12,460", delta: "+3.1%" },
  { label: "Monthly savings", value: "$2,740", delta: "Goal 92%" },
  { label: "Upcoming bills", value: "$1,320", delta: "Due in 6 days" },
];

const activityRows = [
  { label: "Salary deposit", amount: "+$4,200", meta: "Cleared Nov 20" },
  { label: "Rent payment", amount: "-$1,200", meta: "Scheduled Nov 25" },
  { label: "Groceries", amount: "-$180", meta: "Pending merchant review" },
];

const focusActions = [
  "Track inflows vs. expenses",
  "Ensure savings targets stay on track",
  "Review upcoming pay cycles",
];

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overview</p>
            <h1 className="text-2xl font-semibold text-foreground">Stay ahead of the month</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your accounts are healthy and ready for the next cycle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-2xl border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              Quick action
            </button>
            <button className="rounded-2xl border border-primary bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:border-primary/80 hover:bg-primary/20">
              Explore
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {quickMetrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
            <p className="text-sm font-medium text-muted-foreground">{metric.delta}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Focus</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">Stay ahead of the month</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your accounts are healthy and ready for the next cycle.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {focusActions.map((action) => (
              <li key={action} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Snapshot</p>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {activityRows.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{item.amount}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
      <FloatingActionButtonWrapper />
    </>
  );
}
