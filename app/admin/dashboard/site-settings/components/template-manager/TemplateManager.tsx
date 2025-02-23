"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreVertical, Save, Download, Star, Copy, Trash2, Edit } from "lucide-react";
import type { Template, PageData } from "../types";

interface TemplateManagerProps {
  templates: Template[];
  onTemplateCreate: () => void;
  onTemplateEdit: (template: Template) => void;
  onTemplateDelete: (name: string) => void;
  onTemplateApply: (template: Template) => void;
  onTemplateSetDefault: (template: Template) => void;
  onTemplateDuplicate: (template: Template) => void;
}

export function TemplateManager({
  templates,
  onTemplateCreate,
  onTemplateEdit,
  onTemplateDelete,
  onTemplateApply,
  onTemplateSetDefault,
  onTemplateDuplicate
}: TemplateManagerProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateRoute, setTemplateRoute] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTemplate = () => {
    if (!templateName || !templateRoute) {
      toast.error("Please enter a template name and route");
      return;
    }
    onTemplateCreate();
    setTemplateName("");
    setTemplateRoute("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates</CardTitle>
        <CardDescription>Save and manage your templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="New template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <Input
            placeholder="Route (e.g., /faq)"
            value={templateRoute}
            onChange={(e) => setTemplateRoute(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={handleCreateTemplate}
            disabled={isLoading || !templateName || !templateRoute}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.name}
              className="flex items-center justify-between p-2 border rounded hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span className="truncate">{template.name}</span>
                {template.isDefault && (
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">Default</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTemplateEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTemplateSetDefault(template)}
                >
                  <Star className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTemplateApply(template)}>
                      <Download className="mr-2 h-4 w-4" />
                      Apply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTemplateDuplicate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onTemplateDelete(template.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates saved yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}