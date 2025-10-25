'use client'

import { useState } from 'react'
import FileList from '@/components/FileList'
import FileUploader from '@/components/FileUploader'

export default function FileManager() {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload')

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-6">File Manager</h1>

        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('list')}
          >
            File List
          </button>
        </div>
      </div>

      <div className="mt-6">{activeTab === 'upload' ? <FileUploader /> : <FileList />}</div>
    </div>
  )
}
