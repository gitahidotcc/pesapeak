import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-actions";
import { FloatingActionButtonWrapper } from "./components/floating-action-button-wrapper";
import { TransactionsPageClient } from "./components/transactions-page-client";

export default async function TransactionsPage() {
    const session = await getServerSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    return (
        <>
            <TransactionsPageClient />
            <FloatingActionButtonWrapper />
        </>
    );
}
