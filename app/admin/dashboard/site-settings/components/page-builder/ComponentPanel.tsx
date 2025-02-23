"use client";

import { Button } from "@/components/ui/button";
import type { Block } from "../types";

interface ComponentPanelProps {
  onAddBlock: (type: Block["type"]) => void;
}

export function ComponentPanel({ onAddBlock }: ComponentPanelProps) {
  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg bg-white shadow-md">
      <h3 className="text-lg font-bold">Add Components</h3>
      <Button variant="outline" onClick={() => onAddBlock('hero')}>Add Hero</Button>
      <Button variant="outline" onClick={() => onAddBlock('features')}>Add Features</Button>
      <Button variant="outline" onClick={() => onAddBlock('pricing')}>Add Pricing</Button>
      <Button variant="outline" onClick={() => onAddBlock('cta')}>Add Call to Action</Button>
      <Button variant="outline" onClick={() => onAddBlock('custom')}>Add Custom Block</Button>
    </div>
  );
} 