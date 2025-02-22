"use client";

import { Navbar } from "@/app/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <Navbar />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
} 