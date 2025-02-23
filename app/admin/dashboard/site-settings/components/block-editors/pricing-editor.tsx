"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PricingContent {
  title: string;
  subtitle: string;
  showPlans: boolean;
}

interface PricingEditorProps {
  content: PricingContent;
  onChange: (content: PricingContent) => void;
}

export function PricingEditor({ content, onChange }: PricingEditorProps) {
  const handleChange = (key: keyof PricingContent, value: string | boolean) => {
    onChange({
      ...content,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={content.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter section title"
        />
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input
          value={content.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Enter section subtitle"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-plans"
          checked={content.showPlans}
          onCheckedChange={(checked) => handleChange('showPlans', checked)}
        />
        <Label htmlFor="show-plans">Show subscription plans</Label>
      </div>

      {content.showPlans && (
        <p className="text-sm text-muted-foreground">
          Subscription plans will be automatically fetched and displayed in this section
        </p>
      )}
    </div>
  );
} 