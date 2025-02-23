"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast, Toaster } from 'sonner';
import { 
  LayoutGrid, 
  Plus, 
  GripVertical, 
  Trash2, 
  Eye,
  Settings,
  Save,
  Download,
  Upload,
  Star,
  Palette,
  Edit,
  Copy,
  MoreVertical
} from "lucide-react";
import { HeroEditor } from "./block-editors/hero-editor";
import { FeaturesEditor } from "./block-editors/features-editor";
import { PricingEditor } from "./block-editors/pricing-editor";
import { CTAEditor } from "./block-editors/cta-editor";
import { CustomEditor } from "./block-editors/custom-editor";
import { PagePreview } from "./page-preview";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Block {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'custom';
  content: any;
}

export interface PageData {
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
  const [templates, setTemplates] = useState<Array<{ name: string, data: PageData }>>([]);
  const [templateName, setTemplateName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ name: string, data: PageData } | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [showPageContent, setShowPageContent] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/site-templates');
      const data = await response.json();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]); // Set the first template as selected
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName) {
      toast.error('Please enter a template name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/site-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          data: pageData
        })
      });
      const result = await response.json();
      console.log('Save Template Response:', result);
      await loadTemplates();
      setTemplateName("");
      toast.success('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const setAsDefault = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/site-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      });
      const result = await response.json();
      console.log('Set Default Template Response:', result);
      toast.success('Set as default template successfully!');
    } catch (error) {
      console.error('Failed to set default template:', error);
      toast.error('Failed to set default template');
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: { name: string; data: PageData }) => {
    setPageData(template.data);
    setSelectedTemplate(template);
  };

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
    toast.success('Page configuration saved!');
  };

  const deleteTemplate = async (name: string) => {
    try {
      await fetch(`/api/site-templates/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      await loadTemplates();
      toast.success('Template deleted successfully!');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const duplicateTemplate = async (template: { name: string, data: PageData }) => {
    const newName = `${template.name} (Copy)`;
    try {
      await fetch('/api/site-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          data: template.data
        })
      });
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleCreateTemplateClick = () => {
    setShowPageContent(true);
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Page Preview</h2>
            <p className="text-muted-foreground">Preview how your page will look</p>
          </div>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Mode
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <PagePreview data={pageData} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Page Builder</h2>
            <p className="text-muted-foreground">Design and manage your landing page</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCreateTemplateClick}>Create Template</Button>
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        {showPageContent && (
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
                <CardDescription>Drag and drop blocks to rearrange them</CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="blocks">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="border border-dashed border-gray-300 p-4 rounded-md">
                        {pageData.blocks.length === 0 ? (
                          <p className="text-center text-muted-foreground">No blocks added yet. Click "Add Blocks" to get started.</p>
                        ) : pageData.blocks.map((block, index) => (
                          <Draggable key={block.id} draggableId={block.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="relative mb-2">
                                <Card>
                                  <CardHeader className="flex flex-row items-center justify-between">
                                    <div {...provided.dragHandleProps} className="flex items-center">
                                      <GripVertical className="mr-2 h-4 w-4" />
                                      <CardTitle className="capitalize">{block.type}</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </CardHeader>
                                  <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Save and manage your templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={saveAsTemplate}
                disabled={isLoading || !templateName}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            {templates.map((template) => (
              <div key={template.name} className="flex items-center justify-between p-2 border rounded hover:bg-accent">
                <span className="truncate">{template.name}</span>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => applyTemplate(template)}>
                        <Download className="mr-2 h-4 w-4" />
                        Apply
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAsDefault()}>
                        <Star className="mr-2 h-4 w-4" />
                        Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteTemplate(template.name)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No templates saved yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Blocks</CardTitle>
            <CardDescription>Choose blocks to add to your page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {['hero', 'features', 'pricing', 'cta', 'custom'].map((type) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock(type as Block['type'])}
              >
                <Plus className="mr-2 h-4 w-4" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 