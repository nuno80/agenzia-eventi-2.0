'use client'

import { useMemo, useState } from 'react'

type FileItem = {
  id: number
  userId: number | null
  filename: string
  blobUrl: string
  contentType: string
  size: number
  uploadedAt: number // Unix timestamp
}

export default function ServerFileListClient({ files }: { files: FileItem[] }) {
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'type' | 'uploaded'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const items = useMemo(() => {
    const sorted = [...files].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.filename.localeCompare(b.filename)
          break
        case 'size':
          cmp = a.size - b.size
          break
        case 'type':
          cmp = a.contentType.localeCompare(b.contentType)
          break
        case 'uploaded':
          cmp = a.uploadedAt - b.uploadedAt
          break
        default:
          cmp = 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [files, sortBy, sortDir])

  const headerButton = (label: string, key: 'name' | 'size' | 'type' | 'uploaded') => (
    <button
      type="button"
      className="inline-flex items-center gap-1 cursor-pointer"
      title={`Ordina per ${label}`}
      onClick={() => {
        setSortBy(key)
        setSortDir((d) => (sortBy === key ? (d === 'asc' ? 'desc' : 'asc') : d))
      }}
    >
      {label}
      <span aria-hidden className={`${sortBy === key ? 'text-gray-700' : 'text-gray-300'}`}>
        {sortBy === key ? (sortDir === 'asc' ? '▲' : '▼') : '•'}
      </span>
    </button>
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 px-4">{headerButton('Filename', 'name')}</th>
            <th className="py-2 px-4">{headerButton('Size', 'size')}</th>
            <th className="py-2 px-4">{headerButton('Type', 'type')}</th>
            <th className="py-2 px-4">{headerButton('Uploaded', 'uploaded')}</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((file) => (
            <tr key={file.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
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
              <td className="py-2 px-4">{new Date(file.uploadedAt * 1000).toLocaleDateString()}</td>
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
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-600">
                No files.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
