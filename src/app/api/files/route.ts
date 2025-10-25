import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { db, files } from '@/db/libsql';

// POST /api/files - Upload a file
export async function POST(request: Request) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is set
    if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN === 'your_actual_vercel_blob_token_here') {
      return NextResponse.json(
        { error: 'Server configuration error: Please set a valid BLOB_READ_WRITE_TOKEN in your .env.local file' },
        { status: 500 }
      );
    }

    // For now, we'll implement a basic upload without user authentication
    // In a production app, you'd want to authenticate the user first
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Validate file input
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Basic validation - in a real app, you'd want more robust validation
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true
    });

    // Save file metadata to database
    // Note: In a real app, you'd associate this with a specific user
    const savedFile = await db.insert(files).values({
      filename: file.name,
      blobUrl: blob.url,
      contentType: blob.contentType || file.type,
      size: file.size
    }).returning();

    return NextResponse.json({
      success: true,
      file: savedFile[0]
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Check if it's a Vercel Blob specific error
    if (error.message && (error.message.includes('BLOB_READ_WRITE_TOKEN') || error.message.includes('Access denied'))) {
      return NextResponse.json(
        { error: 'Server configuration error: Invalid or missing BLOB_READ_WRITE_TOKEN. Please check your .env.local file.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Upload failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}