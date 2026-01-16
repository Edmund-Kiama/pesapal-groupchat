import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AppProviders from "@/components/providers";
import { Navbar } from "@/components/navbar";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Group Lenders",
  description: "Group Lenders Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} flex h-screen flex-col justify-center antialiased`}
      >
        <AppProviders>
          <Navbar />
          <main className="flex-1 overflow-auto">{children}</main>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
