// src/components/landing/ServerFileList.tsx
// Server Component version of FileList

import { Suspense } from 'react'
import { fetchAllFiles } from '@/data/files/actions'
import ServerFileListClient from './ServerFileListClient'

// Define the FileItem type to match the database structure
interface FileItem {
  id: number
  userId: number | null
  filename: string
  blobUrl: string
  contentType: string
  size: number
  uploadedAt: number // This is a number in the database (Unix timestamp)
}

// Loading skeleton component
function FileListSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Filename</th>
              <th className="py-2 px-4 text-left">Size</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Uploaded</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b hover:bg-gray-50 animate-pulse">
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Server component to display files
async function ServerFileListContent() {
  const result = await fetchAllFiles()

  if (!result.success) {
    return <p className="text-red-500">Error: {result.error}</p>
  }

  const files: FileItem[] = result.data || []

  const _formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">File Manager</h1>
      </div>

      <ServerFileListClient files={files} />
    </div>
  )
}

// Main ServerFileList component with Suspense boundary
export default function ServerFileList() {
  return (
    <Suspense fallback={<FileListSkeleton />}>
      <ServerFileListContent />
    </Suspense>
  )
}
