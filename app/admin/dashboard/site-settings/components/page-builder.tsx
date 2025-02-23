"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutGrid, 
  Plus, 
  GripVertical, 
  Trash2, 
  Eye,
  Settings,
  Save
} from "lucide-react";
import { HeroEditor } from "./block-editors/hero-editor";
import { FeaturesEditor } from "./block-editors/features-editor";
import { PricingEditor } from "./block-editors/pricing-editor";
import { CTAEditor } from "./block-editors/cta-editor";
import { CustomEditor } from "./block-editors/custom-editor";
import { PagePreview } from "./page-preview";

interface Block {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'custom';
  content: any;
}

interface PageData {
  title: string;
  description: string;
  blocks: Block[];
}

const BlockEditor = ({ block, onChange }: { block: Block, onChange: (content: any) => void }) => {
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
};

const defaultBlocks: Block[] = [
  {
    id: '1',
    type: 'hero',
    content: {
      title: 'Welcome to Our Service',
      subtitle: 'Your one-stop solution for all your needs.',
      ctaText: 'Get Started',
      ctaLink: '/auth/register',
      backgroundImage: '',
      color: '#4F46E5', // Default color
    },
  },
  {
    id: '2',
    type: 'features',
    content: {
      title: 'Key Features',
      features: [
        { title: 'Unlimited Users', description: 'Add as many users as you want.', icon: 'users' },
        { title: '24/7 Support', description: 'We are here to help you anytime.', icon: 'support' },
      ],
      color: '#3B82F6', // Default color
    },
  },
  {
    id: '3',
    type: 'pricing',
    content: {
      title: 'Choose Your Plan',
      subtitle: 'Affordable pricing for everyone.',
      showPlans: true,
      color: '#10B981', // Default color
    },
  },
  {
    id: '4',
    type: 'cta',
    content: {
      title: 'Ready to Get Started?',
      description: 'Join us today and take your business to the next level.',
      buttonText: 'Sign Up Now',
      buttonLink: '/auth/register',
      color: '#FBBF24', // Default color
    },
  },
];

export function PageBuilder() {
  const [pageData, setPageData] = useState<PageData>({
    title: "Landing Page",
    description: "Main landing page for your application",
    blocks: defaultBlocks
  });
  const [previewMode, setPreviewMode] = useState(false);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContentForType(type)
    };

    setPageData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const getDefaultContentForType = (type: Block['type']) => {
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
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const blocks = Array.from(pageData.blocks);
    const [reorderedBlock] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, reorderedBlock);

    setPageData(prev => ({ ...prev, blocks }));
  };

  const removeBlock = (blockId: string) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  };

  const updateBlockContent = (blockId: string, content: any) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, content } : block
      )
    }));
  };

  const updateBlockColor = (blockId: string, color: string) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, content: { ...block.content, color } } : block
      )
    }));
  };

  const handleSave = () => {
    // Here we would typically save to localStorage or export the configuration
    console.log('Saving page data:', pageData);
    // For now, just show a success message
    alert('Page configuration saved!');
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Page Preview</h2>
            <p className="text-muted-foreground">
              Preview how your page will look
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(false)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Edit Mode
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <PagePreview data={pageData} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Builder</h2>
          <p className="text-muted-foreground">
            Drag and drop blocks to build your page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar with available blocks */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Available Blocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('hero')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Hero Section
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('features')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Features
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('pricing')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Pricing
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('cta')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Call to Action
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock('custom')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Custom HTML
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-9">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {pageData.blocks.map((block, index) => (
                    <Draggable
                      key={block.id}
                      draggableId={block.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative"
                        >
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center"
                              >
                                <GripVertical className="mr-2 h-4 w-4" />
                                <CardTitle>{block.type}</CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {/* Open block settings */}}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBlock(block.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Input
                                type="color"
                                value={block.content.color}
                                onChange={(e) => updateBlockColor(block.id, e.target.value)}
                              />
                              <BlockEditor 
                                block={block} 
                                onChange={(content) => updateBlockContent(block.id, content)} 
                              />
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
} 