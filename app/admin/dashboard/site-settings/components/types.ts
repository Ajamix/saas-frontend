export interface Block {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'custom';
  content: any;
}

export interface PageData {
  title: string;
  description: string;
  blocks: Block[];
  isDefault?: boolean;
}

export interface Template {
  name: string;
  data: PageData;
  isDefault?: boolean;
} 