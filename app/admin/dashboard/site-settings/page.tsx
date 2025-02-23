"use client";

import { PageBuilder } from "./components/page-builder";

export default function SiteSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
        <p className="text-muted-foreground">
          Customize your landing page and other public pages
        </p>
      </div>

      <PageBuilder />
    </div>
  );
} 