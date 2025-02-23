// app/api/templates/route.ts
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
        const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
        return { name: file.replace('.json', ''), data: JSON.parse(content) };
      })
    );
    return NextResponse.json(templates);
  } catch (error) {
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
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}

// PUT: Set default template
export async function PUT(req: Request) {
  try {
    await ensureTemplatesDir();
    const body = await req.json();
    await fs.writeFile(path.join(templatesDir, 'default.json'), JSON.stringify(body, null, 2));
    return NextResponse.json({ message: 'Default template set successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set default template' }, { status: 500 });
  }
}
