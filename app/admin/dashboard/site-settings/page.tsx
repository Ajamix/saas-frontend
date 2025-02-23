"use client";

import { useState, useEffect } from "react";
import { TemplateSelector } from "./components/template-selector/TemplateSelector";
import { PageBuilderEditor } from "./components/page-builder/PageBuilderEditor";
import { PagePreview } from "./components/page-preview";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Template, PageData } from "./components/types";

const defaultBlocks = [
  {
    id: '1',
    type: 'hero' as const,
    content: {
      title: 'Welcome to Our Service',
      subtitle: 'Your one-stop solution for all your needs.',
      ctaText: 'Get Started',
      ctaLink: '/auth/register',
      backgroundImage: '',
      color: '#4F46E5',
    },
  },
  {
    id: '2',
    type: 'features' as const,
    content: {
      title: 'Key Features',
      features: [
        { title: 'Unlimited Users', description: 'Add as many users as you want.', icon: 'users' },
        { title: '24/7 Support', description: 'We are here to help you anytime.', icon: 'support' },
      ],
      color: '#3B82F6',
    },
  },
];

export default function SiteSettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [pageData, setPageData] = useState<PageData>({
    title: "Landing Page",
    description: "Main landing page for your application",
    blocks: defaultBlocks
  });
  const [templateName, setTemplateName] = useState("");

  // Load templates when component mounts
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/site-templates');
      if (!response.ok) throw new Error('Failed to load templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setPageData({
      title: "New Template",
      description: "A new template",
      blocks: defaultBlocks
    });
    setTemplateName("");
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      const response = await fetch('/api/site-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          data: pageData
        })
      });
      
      if (!response.ok) throw new Error('Failed to save template');
      
      await loadTemplates(); // Reload templates after saving
      setIsEditing(false);
      toast.success('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleTemplateEdit = (template: Template) => {
    setSelectedTemplate(template);
    setPageData(template.data);
    setTemplateName(template.name);
    setIsEditing(true);
  };

  const handleTemplatePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPageData(template.data);
    setIsPreview(true);
  };

  const handleApplyTemplate = (template: Template) => {
    setPageData(template.data); // Apply the template data to the page
    setSelectedTemplate(template); // Set the selected template
    toast.success('Template applied successfully!'); // Show success message
  };

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Template Preview</h2>
          <Button variant="ghost" onClick={() => setIsPreview(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <PagePreview data={pageData} />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={handleSaveTemplate}>
              Save Template
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
        <PageBuilderEditor
          pageData={pageData}
          onPageDataChange={setPageData}
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
          <p className="text-muted-foreground">
            Customize your landing page and other public pages
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {templates.length > 0 ? (
        <TemplateSelector
          templates={templates}
          onEditTemplate={handleTemplateEdit}
          onPreviewTemplate={handleTemplatePreview}
          onApplyTemplate={handleApplyTemplate}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No templates found. Create your first template to get started.
        </div>
      )}
    </div>
  );
} 