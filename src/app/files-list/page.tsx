'use client';

import { useState, useEffect } from 'react';
import CustomNavbar from '@/components/landing/Navbar';

interface FileItem {
  id: number;
  filename: string;
  blobUrl: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export default function FilesListPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/files/list');
      const data = await response.json();
      
      if (response.ok) {
        setFiles(data);
      } else {
        setError(data.error || 'Failed to fetch files');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching files: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove file from state
        setFiles(files.filter(file => file.id !== id));
        alert('File deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete file');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting the file: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return (
    <div>
      <CustomNavbar />
      <div className="max-w-4xl mx-auto p-6">Loading files...</div>
    </div>
  );

  if (error) return (
    <div>
      <CustomNavbar />
      <div className="max-w-4xl mx-auto p-6 text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div>
      <CustomNavbar />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">File Manager</h1>
          <button
            onClick={fetchFiles}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
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
                    <td className="py-2 px-4">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-2 px-4">
                      {file.contentType}
                    </td>
                    <td className="py-2 px-4">
                      {new Date(file.uploadedAt).toLocaleDateString()}
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
                      <button
                        onClick={() => handleDelete(file.id, file.filename)}
                        disabled={deletingId === file.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === file.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}