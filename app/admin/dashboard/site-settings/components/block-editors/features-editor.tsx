"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesContent {
  title: string;
  features: Feature[];
}

interface FeaturesEditorProps {
  content: FeaturesContent;
  onChange: (content: FeaturesContent) => void;
}

export function FeaturesEditor({ content, onChange }: FeaturesEditorProps) {
  const handleTitleChange = (value: string) => {
    onChange({
      ...content,
      title: value
    });
  };

  const handleFeatureChange = (index: number, key: keyof Feature, value: string) => {
    const updatedFeatures = content.features.map((feature, i) =>
      i === index ? { ...feature, [key]: value } : feature
    );

    onChange({
      ...content,
      features: updatedFeatures
    });
  };

  const addFeature = () => {
    onChange({
      ...content,
      features: [
        ...content.features,
        { title: "", description: "", icon: "" }
      ]
    });
  };

  const removeFeature = (index: number) => {
    onChange({
      ...content,
      features: content.features.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={content.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter section title"
        />
      </div>

      <div className="space-y-4">
        <Label>Features</Label>
        {content.features.map((feature, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                      placeholder="Feature title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input
                      value={feature.icon}
                      onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                      placeholder="Icon name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                    placeholder="Feature description"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          variant="outline"
          className="w-full"
          onClick={addFeature}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </div>
    </div>
  );
} 