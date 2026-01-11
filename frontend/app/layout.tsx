import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PollutionProvider } from "@/context/PollutionContext";
import AIChatbot from "@/components/citizen/AIChatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ward-Wise Urban Air Pollution Action Dashboard",
  description: "Hyper-local air quality monitoring and action platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={cn(inter.className, "min-h-screen bg-slate-50 text-slate-900 antialiased")}>
          <PollutionProvider>
            {children}
            <AIChatbot />
          </PollutionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
