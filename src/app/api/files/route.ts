// app/api/upload/route.ts
import { del, put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db, files } from '@/db/libsql'

// POST /api/upload - Upload a file
export async function POST(request: Request) {
  let blobUrl: string | null = null

  try {
    console.log('📤 Received file upload request')

    // Check BLOB_READ_WRITE_TOKEN
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ Missing BLOB_READ_WRITE_TOKEN')
      return NextResponse.json(
        { error: 'Server configuration error: Missing BLOB_READ_WRITE_TOKEN' },
        { status: 401 }
      )
    }
    console.log('✅ BLOB_READ_WRITE_TOKEN is set')

    // 🔐 STEP CLERK: Add authentication here
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Parse form data
    let fileData: Blob | null = null
    let filename = 'file.txt'
    let contentType = 'text/plain'

    const contentTypeHeader = request.headers.get('content-type') || ''
    console.log('📋 Content-Type:', contentTypeHeader)

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        console.error('❌ No file in form data')
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      fileData = file
      filename = file.name
      contentType = file.type || 'application/octet-stream'
      console.log('📄 File:', { filename, contentType, size: file.size })
    } else {
      fileData = await request.blob()
      filename = request.headers.get('x-vercel-filename') || 'file.txt'
      contentType = contentTypeHeader || 'application/octet-stream'
      console.log('📄 Direct upload:', { filename, contentType, size: fileData.size })
    }

    if (!fileData) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (15MB max)
    const MAX_FILE_SIZE = 15 * 1024 * 1024
    if (fileData.size > MAX_FILE_SIZE) {
      console.error('❌ File too large:', fileData.size)
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]

    if (!ALLOWED_TYPES.includes(contentType)) {
      console.error('❌ File type not allowed:', contentType)
      return NextResponse.json({ error: `File type not allowed: ${contentType}` }, { status: 400 })
    }

    // Normalize filename with correct extension
    const fileExtension = contentType.split('/')[1] || 'bin'
    const validExtensions: Record<string, string> = {
      jpeg: '.jpg',
      png: '.png',
      webp: '.webp',
      gif: '.gif',
      pdf: '.pdf',
      msword: '.doc',
      'vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'vnd.ms-excel': '.xls',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      plain: '.txt',
    }

    const extension = validExtensions[fileExtension] || `.${fileExtension}`
    const finalName = filename.endsWith(extension)
      ? filename
      : filename.match(/\.[0-9a-z]+$/i)
        ? filename
        : `${filename}${extension}`

    console.log('📝 Final filename:', finalName)

    // Upload to Vercel Blob
    console.log('☁️ Uploading to Vercel Blob...')
    const arrayBuffer = await fileData.arrayBuffer()
    const blob = await put(finalName, arrayBuffer, {
      contentType,
      access: 'public',
      addRandomSuffix: true,
    })

    blobUrl = blob.url
    console.log('✅ Vercel Blob upload successful:', blob.url)

    // Save metadata to database
    console.log('💾 Saving metadata to database...')
    try {
      // 🔧 FIX CRITICO: Non includere uploadedAt - usa il default del DB
      const [savedFile] = await db
        .insert(files)
        .values({
          userId: null, // 🔐 Sarà il userId di Clerk quando implementato
          filename: finalName,
          blobUrl: blob.url,
          contentType: blob.contentType || contentType,
          size: fileData.size,
          // ❌ NON includere uploadedAt - ha default sql`(unixepoch())`
        })
        .returning()

      console.log('✅ Database save successful:', savedFile)

      return NextResponse.json({
        success: true,
        file: savedFile,
      })
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError)

      // 🧹 CLEANUP: Delete blob if database fails
      console.log('🧹 Cleaning up blob after database error...')
      try {
        await del(blob.url)
        console.log('✅ Blob cleaned up successfully')
      } catch (cleanupError) {
        console.error('⚠️ Failed to clean up blob:', cleanupError)
      }

      return NextResponse.json(
        { error: `Database error: ${dbError.message || 'Failed to save metadata'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Upload error:', error)

    // 🧹 CLEANUP: Delete blob if any error occurs
    if (blobUrl) {
      console.log('🧹 Cleaning up blob after error...')
      try {
        await del(blobUrl)
        console.log('✅ Blob cleaned up successfully')
      } catch (cleanupError) {
        console.error('⚠️ Failed to clean up blob:', cleanupError)
      }
    }

    // Specific error for BLOB token issues
    if (
      error.message?.includes('BLOB_READ_WRITE_TOKEN') ||
      error.message?.includes('Access denied')
    ) {
      return NextResponse.json(
        { error: 'Server configuration error: Invalid BLOB_READ_WRITE_TOKEN' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: `Upload failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// GET /api/upload - Get all files
export async function GET() {
  try {
    console.log('📋 Fetching all files...')

    // 🔐 STEP CLERK: Filter by userId
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userFiles = await db.select().from(files).where(eq(files.userId, userId));

    const allFiles = await db.select().from(files).orderBy(files.uploadedAt)

    console.log(`✅ Found ${allFiles.length} files`)

    return NextResponse.json({
      success: true,
      files: allFiles,
    })
  } catch (error: any) {
    console.error('❌ Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}

// DELETE /api/upload?id=123 - Delete a file
export async function DELETE(request: Request) {
  try {
    // 🔐 STEP CLERK: Verify user owns the file
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    console.log('🗑️ Deleting file ID:', fileId)

    // Get file from database
    const [fileToDelete] = await db
      .select()
      .from(files)
      .where(eq(files.id, parseInt(fileId, 10)))
      .limit(1)

    if (!fileToDelete) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // 🔐 STEP CLERK: Verify ownership
    // if (fileToDelete.userId !== userId) {
    //   return NextResponse.json(
    //     { error: 'Forbidden - You can only delete your own files' },
    //     { status: 403 }
    //   );
    // }

    console.log('📄 Deleting:', fileToDelete.filename)

    // Delete from Vercel Blob
    try {
      await del(fileToDelete.blobUrl)
      console.log('✅ Deleted from Vercel Blob')
    } catch (blobError: any) {
      console.warn('⚠️ Blob deletion failed (might be already deleted):', blobError.message)
      // Continue to delete from database anyway
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, parseInt(fileId, 10)))
    console.log('✅ Deleted from database')

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      deletedFile: {
        id: fileToDelete.id,
        filename: fileToDelete.filename,
      },
    })
  } catch (error: any) {
    console.error('❌ Delete error:', error)
    return NextResponse.json({ error: `Failed to delete file: ${error.message}` }, { status: 500 })
  }
}
