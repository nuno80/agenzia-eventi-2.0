// src/components/landing/ClientFileList.tsx
// Client Component that consumes a promise using React.use()

'use client'

import { use } from 'react'

interface FileItem {
  id: number
  userId: number | null
  filename: string
  blobUrl: string
  contentType: string
  size: number
  uploadedAt: number // Unix timestamp
}

export default function ClientFileList({
  filesPromise,
}: {
  filesPromise: Promise<{ success: boolean; data?: FileItem[]; error?: string }>
}) {
  // Use the promise passed from the Server Component
  const result = use(filesPromise)

  if (!result.success) {
    return <p className="text-red-500">Error: {result.error || 'Failed to fetch files'}</p>
  }

  const files = result.data || []

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const handleDelete = async (_id: number, filename: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${filename}"?`)
    if (!confirmed) return

    try {
      // In a real implementation, we would call a Server Action here
      // For now, we'll just show an alert
      alert('In a real implementation, this would call a Server Action to delete the file.')
    } catch (err: any) {
      console.error('Delete error:', err)
      alert(`An error occurred while deleting the file: ${err.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>

      {files.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
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
                    <button
                      onClick={() => handleDelete(file.id, file.filename)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
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
