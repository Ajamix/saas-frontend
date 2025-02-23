"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Star, Trash } from "lucide-react";
import { PagePreview } from "../page-preview";
import { toast } from "sonner";
import type { PageData } from "../types";

interface TemplateSelectorProps {
  templates: Array<{ name: string; data: PageData; isDefault?: boolean }>;
  onEditTemplate: (template: { name: string; data: PageData }) => void;
  onPreviewTemplate: (template: { name: string; data: PageData }) => void;
  onApplyTemplate: (template: { name: string; data: PageData }) => void;
  onTemplatesChange?: () => void;
}

export function TemplateSelector({ 
  templates, 
  onEditTemplate, 
  onPreviewTemplate, 
  onApplyTemplate,
  onTemplatesChange 
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Update selected template when templates change
  useEffect(() => {
    const defaultTemplate = templates.find(t => t.data.isDefault);
    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate.name);
    } else {
      setSelectedTemplate(templates[0]?.name || ""); // Fallback to the first template if no default
    }
  }, [templates]);

  const currentTemplate = templates.find(t => t.name === selectedTemplate);

  const handleSetDefault = async (template: { name: string; data: PageData }) => {
    try {
      const response = await fetch('/api/site-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateName: template.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default template');
      }

      toast.success('Default template updated successfully');
      
      // Refresh templates list to get updated default status
      if (onTemplatesChange) {
        onTemplatesChange();
      }
    } catch (error) {
      console.error('Error setting default template:', error);
      toast.error('Failed to set default template');
    }
  };

  const handleDeleteTemplate = async (template: { name: string; data: PageData }) => {
    if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      try {
        const response = await fetch('/api/site-templates', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateName: template.name }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete template');
        }

        toast.success('Template deleted successfully');
        // Refresh templates list to reflect the deletion
        if (onTemplatesChange) {
          onTemplatesChange();
        }
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedTemplate}</span>
                {currentTemplate?.isDefault && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem 
                key={template.name} 
                value={template.name} 
                className="flex items-center justify-between gap-2"
              >
                <span>{template.name}</span>
                {template.isDefault && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">(Default)</span>
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentTemplate && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPreviewTemplate(currentTemplate)}
              title="Preview Template"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => onEditTemplate(currentTemplate)}
              title="Edit Template"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTemplate.data.isDefault ? "default" : "ghost"}
              size="icon"
              onClick={() => handleSetDefault(currentTemplate)}
              title={currentTemplate.data.isDefault ? "Current Default Template" : "Set as Default Template"}
              className={currentTemplate.data.isDefault ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              <Star className={`h-4 w-4 ${currentTemplate.data.isDefault ? "text-white" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTemplate(currentTemplate)}
              title="Delete Template"
              disabled={currentTemplate.isDefault}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>
      {currentTemplate && (
        <div className="border rounded-lg overflow-hidden">
          <PagePreview data={currentTemplate.data} />
        </div>
      )}
    </div>
  );
}