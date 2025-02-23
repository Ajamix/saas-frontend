"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomContent {
  html: string;
  css: string;
  javascript: string;
}

interface CustomEditorProps {
  content: CustomContent;
  onChange: (content: CustomContent) => void;
}

export function CustomEditor({ content, onChange }: CustomEditorProps) {
  const handleChange = (key: keyof CustomContent, value: string) => {
    onChange({
      ...content,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Be careful when editing code directly. Invalid code may break the page layout.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="html" className="w-full">
        <TabsList>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
        </TabsList>

        <TabsContent value="html">
          <div className="space-y-2">
            <Label>HTML</Label>
            <Textarea
              value={content.html}
              onChange={(e) => handleChange("html", e.target.value)}
              placeholder="<div class='custom-section'>Your HTML here</div>"
              className="min-h-[200px] font-mono"
            />
          </div>
        </TabsContent>

        <TabsContent value="css">
          <div className="space-y-2">
            <Label>CSS</Label>
            <Textarea
              value={content.css}
              onChange={(e) => handleChange("css", e.target.value)}
              placeholder=".custom-section { /* Your styles here */ }"
              className="min-h-[200px] font-mono"
            />
          </div>
        </TabsContent>

        <TabsContent value="js">
          <div className="space-y-2">
            <Label>JavaScript</Label>
            <Textarea
              value={content.javascript}
              onChange={(e) => handleChange("javascript", e.target.value)}
              placeholder="// Your JavaScript code here"
              className="min-h-[200px] font-mono"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
