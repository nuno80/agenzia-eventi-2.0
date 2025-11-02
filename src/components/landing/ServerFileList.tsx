// src/components/landing/ServerFileList.tsx
// Server Component version of FileList

import { Suspense } from 'react'
import { deleteFileAction, fetchAllFiles } from '@/data/files/actions'

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

  const formatFileSize = (bytes: number): string => {
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

      {files.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet</p>
      ) : (
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
              {files.map((file) => (
                <tr key={file.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <a
                      href={file.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.filename}
                    </a>
                  </td>
                  <td className="py-2 px-4">{formatFileSize(file.size)}</td>
                  <td className="py-2 px-4">{file.contentType}</td>
                  <td className="py-2 px-4">
                    {new Date(file.uploadedAt * 1000).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">
                    <a
                      href={file.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View
                    </a>
                    <a
                      href={file.blobUrl}
                      download={file.filename}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      Download
                    </a>
                    <form
                      action={async () => {
                        'use server'
                        if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
                          await deleteFileAction(file.id)
                        }
                      }}
                      className="inline"
                    >
                      <button type="submit" className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
