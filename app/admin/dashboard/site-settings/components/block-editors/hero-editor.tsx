"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

export function HeroEditor({ content, onChange }: HeroEditorProps) {
  const handleChange = (key: keyof HeroContent, value: string) => {
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
          placeholder="Enter hero title"
        />
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Textarea
          value={content.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Enter hero subtitle"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CTA Text</Label>
          <Input
            value={content.ctaText}
            onChange={(e) => handleChange('ctaText', e.target.value)}
            placeholder="Enter button text"
          />
        </div>

        <div className="space-y-2">
          <Label>CTA Link</Label>
          <Input
            value={content.ctaLink}
            onChange={(e) => handleChange('ctaLink', e.target.value)}
            placeholder="/auth/register"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Background Image URL</Label>
        <Input
          value={content.backgroundImage}
          onChange={(e) => handleChange('backgroundImage', e.target.value)}
          placeholder="Enter image URL"
        />
      </div>
    </div>
  );
} 