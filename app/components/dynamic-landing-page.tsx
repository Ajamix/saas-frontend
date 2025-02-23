"use client";

import { useEffect, useState } from 'react';
import { PagePreview } from '../admin/dashboard/site-settings/components/page-preview';
import { PageData } from '../admin/dashboard/site-settings/components/types';

export function DynamicLandingPage() {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDefaultTemplate = async () => {
      try {
        const response = await fetch('/api/site-templates');
        const templates = await response.json();
        const defaultTemplate = templates.find((t: any) => t.data.isDefault);
        console.log(templates);
        if (defaultTemplate) {
          setPageData(defaultTemplate.data);
        } else {
          // Load first template as fallback
          setPageData(templates[0]?.data || null);
        }
      } catch (error) {
        console.error('Failed to load default template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultTemplate();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
        <p className="text-lg text-gray-600">
          No template has been set up yet. Please visit the admin dashboard to configure your landing page.
        </p>
      </div>
    );
  }

  return <PagePreview data={pageData} />;
} 