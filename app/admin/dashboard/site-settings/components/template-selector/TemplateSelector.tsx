"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Star, Download } from "lucide-react";
import { PagePreview } from "../page-preview";
import type { PageData } from "../types";

interface TemplateSelectorProps {
  templates: Array<{ name: string; data: PageData; isDefault?: boolean }>;
  onEditTemplate: (template: { name: string; data: PageData }) => void;
  onPreviewTemplate: (template: { name: string; data: PageData }) => void;
  onApplyTemplate: (template: { name: string; data: PageData }) => void;
}

export function TemplateSelector({ templates, onEditTemplate, onPreviewTemplate, onApplyTemplate }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates.find(t => t.isDefault)?.name || templates[0]?.name || ""
  );

  const currentTemplate = templates.find(t => t.name === selectedTemplate);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.name} value={template.name} className="flex items-center justify-between">
                <span>{template.name}</span>
                {template.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentTemplate && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onPreviewTemplate(currentTemplate)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="default"
              onClick={() => onEditTemplate(currentTemplate)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onApplyTemplate(currentTemplate)}
            >
              <Download className="h-4 w-4" />
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