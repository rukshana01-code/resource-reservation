import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resource Reservation",
  description: "Book shared resources without double-booking",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <span className="font-semibold">Resource Reservation</span>
            <Link href="/reservations" className="text-sm text-blue-700 hover:underline">
              Reservations
            </Link>
            <Link href="/resources" className="text-sm text-blue-700 hover:underline">
              Resources
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}