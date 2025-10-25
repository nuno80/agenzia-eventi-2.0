import { del } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db, files } from '@/db/libsql'

// Use Edge Runtime for better performance
export const runtime = 'edge'

// DELETE /api/files/[id] - Delete a file
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            'Server configuration error: Please set BLOB_READ_WRITE_TOKEN in your .env.local file',
        },
        { status: 500 }
      )
    }

    // Unwrap the params promise
    const { id } = await params
    const fileId = parseInt(id)

    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }

    // First, get the file to retrieve the blob URL
    const fileToDelete = await db.select().from(files).where(eq(files.id, fileId)).limit(1)

    if (fileToDelete.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from Vercel Blob storage
    await del(fileToDelete[0].blobUrl)

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId))

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting file:', error)

    // Check if it's a Vercel Blob specific error
    if (
      error.message &&
      (error.message.includes('BLOB_READ_WRITE_TOKEN') || error.message.includes('Access denied'))
    ) {
      return NextResponse.json(
        {
          error:
            'Server configuration error: Invalid or missing BLOB_READ_WRITE_TOKEN. Please check your .env.local file.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete file: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
