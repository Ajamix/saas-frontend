"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface CustomContent {
  html: string;
}

interface CustomEditorProps {
  content: CustomContent;
  onChange: (content: CustomContent) => void;
}

export function CustomEditor({ content, onChange }: CustomEditorProps) {
  const handleChange = (value: string) => {
    onChange({
      html: value
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Be careful when editing HTML directly. Invalid HTML may break the page layout.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Custom HTML</Label>
        <Textarea
          value={content.html}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="<div class='custom-section'>Your custom HTML here</div>"
          className="min-h-[200px] font-mono"
        />
      </div>
    </div>
  );
} 