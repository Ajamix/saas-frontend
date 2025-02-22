"use client";

import { useState } from "react";
import { TenantSidebar } from "@/app/components/tenant/sidebar";
import { Navbar } from "@/app/components/navbar";

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <TenantSidebar 
          isCollapsed={isCollapsed}
          onCollapse={setIsCollapsed}
        />
      </div>
      <main className={`${isCollapsed ? "md:pl-16" : "md:pl-72"} transition-all duration-300`}>
        <Navbar />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 