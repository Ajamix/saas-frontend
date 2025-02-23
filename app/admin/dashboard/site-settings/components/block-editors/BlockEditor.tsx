"use client";

import { HeroEditor } from "./hero-editor";
import { FeaturesEditor } from "./features-editor";
import { PricingEditor } from "./pricing-editor";
import { CTAEditor } from "./cta-editor";
import { CustomEditor } from "./custom-editor";
import type { Block } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BlockEditorProps {
  block: Block;
  onChange: (content: any) => void;
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {
  const handleColorChange = (color: string) => {
    onChange({ ...block.content, color });
  };

  return (
    <div>
      <Label htmlFor="blockColor">Block Color</Label>
      <Input
        id="blockColor"
        type="color"
        value={block.content.color}
        onChange={(e) => handleColorChange(e.target.value)}
      />
      {(() => {
        switch (block.type) {
          case 'hero':
            return <HeroEditor content={block.content} onChange={onChange} />;
          case 'features':
            return <FeaturesEditor content={block.content} onChange={onChange} />;
          case 'pricing':
            return <PricingEditor content={block.content} onChange={onChange} />;
          case 'cta':
            return <CTAEditor content={block.content} onChange={onChange} />;
          case 'custom':
            return <CustomEditor content={block.content} onChange={onChange} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}

export function BlockEditorWithColor({ block, onChange }: BlockEditorProps) {
    const handleColorChange = (color: string) => {
      onChange({ ...block.content, color });
    };  return (
    <div>
      <Label htmlFor="blockColor">Block Color</Label>
      <Input
        id="blockColor"
        type="color"
        value={block.content.color}
        onChange={(e) => handleColorChange(e.target.value)}
      />
      <BlockEditor block={block} onChange={onChange} />
    </div>
  );
} 