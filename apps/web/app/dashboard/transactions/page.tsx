import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { FloatingActionButtonWrapper } from "./components/floating-action-button-wrapper";
import { TransactionsPageClient } from "./components/transactions-page-client";

interface TransactionsPageProps {
  searchParams?: {
    accountId?: string;
    categoryId?: string;
  };
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <TransactionsPageClient 
        initialAccountId={searchParams?.accountId ?? null}
        initialCategoryId={searchParams?.categoryId ?? null}
      />
      <FloatingActionButtonWrapper />
    </>
  );
}
