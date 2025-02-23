import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const templatesDir = path.join(process.cwd(), 'public/templates');

async function ensureTemplatesDir() {
  try {
    await fs.mkdir(templatesDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create templates directory', error);
  }
}

// GET: Fetch all saved templates
export async function GET() {
  try {
    await ensureTemplatesDir();
    const files = await fs.readdir(templatesDir);
    const templates = await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith('.json')) return null;
        const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
        return { name: file.replace('.json', ''), data: JSON.parse(content) };
      })
    );
    return NextResponse.json(templates.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST: Save a new template
export async function POST(req: Request) {
  try {
    await ensureTemplatesDir();
    const body = await req.json();
    const { name, data } = body;
    
    if (!name || !data) {
      return NextResponse.json({ error: 'Invalid template data' }, { status: 400 });
    }

    const filePath = path.join(templatesDir, `${name}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ message: 'Template saved successfully' });
  } catch (error) {
    console.error('Failed to save template:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}

// PUT: Set default template
export async function PUT(req: Request) {
  try {
    await ensureTemplatesDir();
    const body = await req.json();
    const { templateName } = body;

    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const files = await fs.readdir(templatesDir);
    
    // Update all templates, setting isDefault to false except for the selected one
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(templatesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const templateData = JSON.parse(content);
      
      // Set isDefault based on whether this is the selected template
      templateData.isDefault = file === `${templateName}.json`;
      
      await fs.writeFile(filePath, JSON.stringify(templateData, null, 2));
    }

    return NextResponse.json({ message: 'Default template set successfully' });
  } catch (error) {
    console.error('Failed to set default template:', error);
    return NextResponse.json({ error: 'Failed to set default template' }, { status: 500 });
  }
}

// DELETE: Remove a template
export async function DELETE(req: Request) {
  try {
    await ensureTemplatesDir();
    const body = await req.json();
    const { templateName } = body;

    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const filePath = path.join(templatesDir, `${templateName}.json`);
    await fs.unlink(filePath); // Delete the file

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
} 