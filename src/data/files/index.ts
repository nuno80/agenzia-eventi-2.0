// src/data/files/index.ts
// Data Access Layer for Files
import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db, files } from '@/db'

// Type definitions
export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert

// Get all files ordered by upload date (newest first)
export async function getAllFiles() {
  try {
    const allFiles = await db.select().from(files).orderBy(desc(files.uploadedAt))

    return { success: true, data: allFiles }
  } catch (error) {
    console.error('Error fetching files:', error)
    return { success: false, error: 'Failed to fetch files' }
  }
}

// Get a file by ID
export async function getFileById(id: number) {
  try {
    const [file] = await db.select().from(files).where(eq(files.id, id)).limit(1)

    if (!file) {
      return { success: false, error: 'File not found' }
    }

    return { success: true, data: file }
  } catch (error) {
    console.error('Error fetching file:', error)
    return { success: false, error: 'Failed to fetch file' }
  }
}

// Create a new file record
export async function createFile(fileData: NewFile) {
  try {
    // In a real implementation, we would verify user authentication here
    // const user = await requireUser();

    const [newFile] = await db.insert(files).values(fileData).returning()

    return { success: true, data: newFile }
  } catch (error) {
    console.error('Error creating file:', error)
    return { success: false, error: 'Failed to create file' }
  }
}

// Delete a file by ID
export async function deleteFile(id: number) {
  try {
    // In a real implementation, we would verify user authentication and ownership here
    // const user = await requireUser();

    const [deletedFile] = await db.delete(files).where(eq(files.id, id)).returning()

    if (!deletedFile) {
      return { success: false, error: 'File not found' }
    }

    return { success: true, data: deletedFile }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}
