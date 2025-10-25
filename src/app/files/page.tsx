'use client'

import { useEffect, useState } from 'react'
import FileManager from '@/components/FileManager'
import CustomNavbar from '@/components/landing/Navbar'

export default function FilesPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomNavbar />
      <div className="py-12">
        <FileManager />
      </div>
    </div>
  )
}
