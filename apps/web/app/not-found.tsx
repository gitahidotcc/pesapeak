"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[color:var(--sidebar)] via-[color:var(--background)] to-[color:var(--card)] opacity-60" />
      <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--secondary)/45%,transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--primary)/50%,transparent_70%)] blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-7xl font-black uppercase tracking-[0.4em] text-foreground sm:text-9xl">
          404
        </p>
        <p className="text-sm uppercase tracking-[0.4em] text-foreground/70 sm:text-base">
          Page not found
        </p>
        <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
          We climbed every ledger and still can’t find this page.
        </h1>
        <p className="max-w-2xl text-lg text-foreground/70 sm:text-xl">
          PesaPeak keeps your spending insights within reach, so let’s get you back to analyzing
          the trends that matter. This route might be obsolete, but your financial clarity
          is waiting a click away.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row"> 

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-border bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Return to dashboard
          </Link>
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            Go back
        </Button> 
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.8))]" />
    </div>
  );
}

