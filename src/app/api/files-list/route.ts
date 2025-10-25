import { NextResponse } from 'next/server';
import { db, files } from '@/db/libsql';
import { desc } from 'drizzle-orm';

// Use Edge Runtime for better performance
export const runtime = 'edge';

// GET /api/files-list - Get all files
export async function GET() {
  try {
    const allFiles = await db.select().from(files).orderBy(desc(files.uploadedAt));
    
    return NextResponse.json(allFiles);
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}