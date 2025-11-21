import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { FloatingActionButtonWrapper } from "./transactions/components/floating-action-button-wrapper";
import { DashboardClient } from "./components/dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <DashboardClient />
      <FloatingActionButtonWrapper />
    </>
  );
}
