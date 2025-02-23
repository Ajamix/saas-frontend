"use client";

import { Button } from "@/components/ui/button";
import {
  LayoutTemplate,
  Grid,
  CreditCard,
  PhoneCall,
  Code
} from "lucide-react";
import type { Block } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ComponentPanelProps {
  onAddBlock: (type: Block["type"]) => void;
}

export function ComponentPanel({ onAddBlock }: ComponentPanelProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-4 border rounded-lg bg-white shadow-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAddBlock('hero')}>
              <LayoutTemplate className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Hero Section</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAddBlock('features')}>
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Features Section</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAddBlock('pricing')}>
              <CreditCard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Pricing Section</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAddBlock('cta')}>
              <PhoneCall className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Call to Action</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onAddBlock('custom')}>
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Custom Block</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
} 