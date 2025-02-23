import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const templatesDir = path.join(process.cwd(), 'public/templates');

// DELETE: Delete a template
export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const filePath = path.join(templatesDir, `${params.name}.json`);
    await fs.unlink(filePath);
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 