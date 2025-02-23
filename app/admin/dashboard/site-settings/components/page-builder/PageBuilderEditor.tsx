"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { BlockEditor } from "../block-editors/BlockEditor";
import { ComponentPanel } from "./ComponentPanel";
import type { Block, PageData } from "../types";

interface PageBuilderEditorProps {
  pageData: PageData;
  onPageDataChange: (pageData: PageData) => void;
  templateName?: string;
  onTemplateNameChange?: (name: string) => void;
}

export function PageBuilderEditor({
  pageData,
  onPageDataChange,
  templateName,
  onTemplateNameChange
}: PageBuilderEditorProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const blocks = Array.from(pageData.blocks);
    const [reorderedBlock] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, reorderedBlock);

    onPageDataChange({ ...pageData, blocks });
  };

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContentForType(type)
    };

    onPageDataChange({
      ...pageData,
      blocks: [...pageData.blocks, newBlock]
    });
  };

  const removeBlock = (blockId: string) => {
    onPageDataChange({
      ...pageData,
      blocks: pageData.blocks.filter(block => block.id !== blockId)
    });
  };

  const updateBlockContent = (blockId: string, content: any) => {
    onPageDataChange({
      ...pageData,
      blocks: pageData.blocks.map(block =>
        block.id === blockId ? { ...block, content } : block
      )
    });
  };

  return (
    <div className="space-y-6">
      {onTemplateNameChange && (
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>Configure your template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <ComponentPanel onAddBlock={addBlock} />

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>Drag and drop blocks to rearrange them</CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {pageData.blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="bg-muted p-4">
                            <div className="flex items-center justify-between">
                              <div {...provided.dragHandleProps} className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4" />
                                <span className="font-medium capitalize">{block.type}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBlock(block.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <BlockEditor
                              block={block}
                              onChange={(content) => updateBlockContent(block.id, content)}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}

function getDefaultContentForType(type: Block['type']) {
  switch (type) {
    case 'hero':
      return {
        title: "Welcome to Our Platform",
        subtitle: "The best solution for your needs",
        ctaText: "Get Started",
        ctaLink: "/auth/register",
        backgroundImage: "",
        color: '#4F46E5'
      };
    case 'features':
      return {
        title: "Features",
        features: [
          { title: "Feature 1", description: "Description 1", icon: "Star" },
          { title: "Feature 2", description: "Description 2", icon: "Shield" },
          { title: "Feature 3", description: "Description 3", icon: "Zap" }
        ],
        color: '#3B82F6'
      };
    case 'pricing':
      return {
        title: "Pricing Plans",
        subtitle: "Choose the perfect plan for you",
        showPlans: true,
        color: '#10B981'
      };
    case 'cta':
      return {
        title: "Ready to Get Started?",
        description: "Join thousands of satisfied customers",
        buttonText: "Sign Up Now",
        buttonLink: "/auth/register",
        color: '#FBBF24'
      };
    case 'custom':
      return {
        html: "<div>Custom content goes here</div>",
        color: '#4F46E5'
      };
    default:
      return {};
  }
} 