import { count, sum } from "drizzle-orm";
import { Counter, Gauge, Histogram, register } from "prom-client";
import { db } from "@pesapeak/db";
import { users } from "@pesapeak/db/schema";


// User metrics
const totalUsersGauge = new Gauge({
  name: "pesapeak_total_users",
  help: "Total number of users in the system",
  async collect() {
    try {
      const result = await db.select({ count: count() }).from(users);
      this.set(result[0]?.count ?? 0);
    } catch (error) {
      console.error("Failed to get user count:", error);
      this.set(0);
    }
  },
});


// Api metrics
const apiRequestsTotalCounter = new Counter({
  name: "pesapeak_trpc_requests_total",
  help: "Total number of API requests",
  labelNames: ["type", "path", "is_error"],
});

const apiErrorsTotalCounter = new Counter({
  name: "pesapeak_trpc_errors_total",
  help: "Total number of API requests",
  labelNames: ["type", "path", "code"],
});

const apiRequestDurationSummary = new Histogram({
  name: "pesapeak_trpc_request_duration_seconds",
  help: "Duration of tRPC requests in seconds",
  labelNames: ["type", "path"],
  buckets: [
    5e-3, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10,
  ],
});

// Register all metrics
register.registerMetric(totalUsersGauge);
register.registerMetric(apiRequestsTotalCounter);
register.registerMetric(apiErrorsTotalCounter);
register.registerMetric(apiRequestDurationSummary);

export {
  totalUsersGauge,
  apiRequestsTotalCounter,
  apiErrorsTotalCounter,
  apiRequestDurationSummary,
};
