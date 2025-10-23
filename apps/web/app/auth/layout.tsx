import type { Metadata } from "next";
import { AuthLogo } from "./components/auth-logo";

export const metadata: Metadata = {
  title: "PesaPeak - Sign in or create your account",
  description: "Sign in or create your PesaPeak account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md mx-4">
        <AuthLogo />
        {children}
      </div>
    </div>
  );
}
