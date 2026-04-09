import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { LoadingScreen } from "@/components/shared/loading-screen";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PROGRAM | Upgrade Your Skills",
  description: "PROGRAM learning platform frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <LoadingScreen />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

