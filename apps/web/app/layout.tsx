import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import Providers from "@/lib/providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getUserLocalSettings } from "@/lib/user-local-settings/user-local-settings";
import { clientConfig } from "@pesapeak/shared/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "PesaPeak",
  applicationName: "PesaPeak",
  description:
    "PesaPeak helps you understand your spending habits with smart categorization and insights. Track expenses manually, organize your accounts, and get a complete picture of your financial health—all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "PesaPeak",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSettings = await getUserLocalSettings();
  const isRTL = userSettings.lang === "ar";


  return (
    <html
    lang={userSettings.lang}
    dir={isRTL ? "rtl" : "ltr"}
    suppressHydrationWarning
    >
      <head>
        {/* Google Fonts - Geist Sans and Geist Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">
        <NuqsAdapter>
        <Providers
            clientConfig={clientConfig}
            userLocalSettings={await getUserLocalSettings()}
          >
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </Providers>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}
