import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db, files } from '@/db/libsql'

// GET /api/files/list - Get all files
export async function GET() {
  try {
    // For now, we'll return all files without user authentication
    // In a production app, you'd want to filter by user

    const allFiles = await db.select().from(files).orderBy(desc(files.uploadedAt))

    return NextResponse.json(allFiles)
  } catch (error: any) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
