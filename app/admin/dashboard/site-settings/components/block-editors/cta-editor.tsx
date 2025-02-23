"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CTAContent {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface CTAEditorProps {
  content: CTAContent;
  onChange: (content: CTAContent) => void;
}

export function CTAEditor({ content, onChange }: CTAEditorProps) {
  const handleChange = (key: keyof CTAContent, value: string) => {
    onChange({
      ...content,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={content.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter CTA title"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={content.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter CTA description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={content.buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            placeholder="Enter button text"
          />
        </div>

        <div className="space-y-2">
          <Label>Button Link</Label>
          <Input
            value={content.buttonLink}
            onChange={(e) => handleChange('buttonLink', e.target.value)}
            placeholder="/auth/register"
          />
        </div>
      </div>
    </div>
  );
} 