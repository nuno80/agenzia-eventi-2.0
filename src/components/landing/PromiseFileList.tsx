// src/components/landing/PromiseFileList.tsx
// Server Component that implements the "Pass the Promise" pattern

import { Suspense } from 'react'
import { fetchAllFiles } from '@/data/files/actions'
import ClientFileList from './ClientFileList'

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

// Server Component that starts the fetch but doesn't await it
export default function PromiseFileList() {
  // Start the fetch but don't await it - pass the promise to the Client Component
  const filesPromise = fetchAllFiles()

  return (
    <Suspense fallback={<FileListSkeleton />}>
      <ClientFileList filesPromise={filesPromise} />
    </Suspense>
  )
}
