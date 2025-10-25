'use client'

import { useState } from 'react'

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)
    setUploadedFile(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        throw new Error(
          textResponse ||
            'Server returned an invalid response. Please check that your BLOB_READ_WRITE_TOKEN is correctly set in .env.local'
        )
      }

      const data = await response.json()

      if (response.ok) {
        setUploadedFile(data.file)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || data.message || 'Upload failed')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(
        'An error occurred during upload: ' +
          (err.message ||
            'Unknown error. Please check that your BLOB_READ_WRITE_TOKEN is correctly set in .env.local')
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">File Uploader</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Select File</label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm border rounded p-2"
            disabled={uploading}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max 15MB. Supported formats: JPG, PNG, WebP, GIF, PDF, DOC, XLS
          </p>
        </div>

        {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {uploadedFile && (
        <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
          <p className="font-medium mb-2 text-green-800">✓ File uploaded successfully!</p>
          <p className="text-sm">
            <strong>Filename:</strong> {uploadedFile.filename}
          </p>
          <p className="text-sm">
            <strong>Size:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <a
            href={uploadedFile.blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:underline text-sm"
          >
            View file →
          </a>
        </div>
      )}
    </div>
  )
}
