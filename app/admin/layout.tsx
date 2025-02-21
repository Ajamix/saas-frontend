"use client";

import { AdminSidebar } from "@/app/components/admin/sidebar";
import { AdminNavbar } from "@/app/components/admin/navbar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-full relative">
      <div className={cn(
        "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-72"
      )}>
        <AdminSidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
      </div>
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "md:pl-16" : "md:pl-72"
      )}>
        <AdminNavbar />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 