// src/data/files/actions.ts
// Server Actions for file operations
"use server";

import { getAllFiles, deleteFile } from './index';
import { requireUser } from '../server-only';
import { del } from '@vercel/blob';

// Server Action to fetch all files
export async function fetchAllFiles() {
  try {
    // In a real implementation, we would verify user authentication here
    // const user = await requireUser();
    
    const result = await getAllFiles();
    return result;
  } catch (error) {
    console.error('Error in fetchAllFiles action:', error);
    return { success: false, error: 'Failed to fetch files' };
  }
}

// Server Action to delete a file
export async function deleteFileAction(id: number) {
  try {
    // In a real implementation, we would verify user authentication here
    // const user = await requireUser();
    
    // Check if BLOB_READ_WRITE_TOKEN is set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return { success: false, error: 'Server configuration error: Please set BLOB_READ_WRITE_TOKEN in your .env.local file' };
    }

    if (isNaN(id)) {
      return { success: false, error: 'Invalid file ID' };
    }

    // Delete the file using the DAL function
    const result = await deleteFile(id);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Delete from Vercel Blob storage
    if (result.data) {
      await del(result.data.blobUrl);
    }

    return { success: true, message: 'File deleted successfully' };
  } catch (error: any) {
    console.error('Error in deleteFileAction:', error);
    
    // Check if it's a Vercel Blob specific error
    if (error.message && (error.message.includes('BLOB_READ_WRITE_TOKEN') || error.message.includes('Access denied'))) {
      return { success: false, error: 'Server configuration error: Invalid or missing BLOB_READ_WRITE_TOKEN. Please check your .env.local file.' };
    }
    
    return { success: false, error: 'Failed to delete file: ' + (error.message || 'Unknown error') };
  }
}