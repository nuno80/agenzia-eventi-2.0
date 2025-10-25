# Guida Completa: Vercel Blob Storage per Next.js

> **Per chi è questa guida**: Sviluppatori che vogliono aggiungere upload/download file al loro progetto Next.js in modo semplice e veloce.

## 📋 Indice

1. [Cos'è Vercel Blob](#1-cosè-vercel-blob)
2. [Prerequisiti](#2-prerequisiti)
3. [Setup Vercel Blob](#3-setup-vercel-blob)
4. [Installazione Dipendenze](#4-installazione-dipendenze)
5. [Configurazione Environment Variables](#5-configurazione-environment-variables)
6. [Upload File - Base](#6-upload-file---base)
7. [Upload File - Con Validazione](#7-upload-file---con-validazione)
8. [Download e Visualizzazione File](#8-download-e-visualizzazione-file)
9. [Eliminazione File](#9-eliminazione-file)
10. [Lista File](#10-lista-file)
11. [Integrazione con Database](#11-integrazione-con-database)
12. [Esempi Completi](#12-esempi-completi)
13. [Best Practices](#13-best-practices)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Cos'è Vercel Blob

### **Vercel Blob Storage**
- Servizio storage file di Vercel
- Edge CDN integrato (velocissimo ovunque)
- Upload/download via API semplici
- Integrazione nativa con Next.js

### **Free Tier:**
- **1GB storage totale**
- **100GB bandwidth/mese**
- Nessuna carta di credito richiesta

### **Limiti:**
- Max 500MB per singolo file
- Nessun limit sul numero di file

### **Casi d'uso perfetti:**
- Immagini profilo utenti
- Cover immagini blog posts
- Documenti PDF (5-15MB)
- File Excel/CSV
- Immagini eventi

---

## 2. Prerequisiti

### **Software necessario:**
```bash
✅ Node.js 18+ installato
✅ Progetto Next.js esistente
✅ Account Vercel (gratuito)
```

### **Verifica:**
```bash
node --version    # >= 18
npm --version
```

---

## 3. Setup Vercel Blob

### **Opzione A: Crea Blob Store da Dashboard**

1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Storage** tab
4. Clicca **Create Database**
5. Seleziona **Blob**
6. Clicca **Create**

✅ Vercel crea automaticamente le environment variables!

### **Opzione B: Crea Blob Store da CLI**

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Link progetto (se non già fatto)
vercel link

# Crea blob store
vercel blob create my-blob-store
```

### **Verifica creazione:**

Vai su dashboard Vercel → Storage → dovresti vedere il tuo Blob store.

---

## 4. Installazione Dipendenze

```bash
npm install @vercel/blob
```

**Cosa include:**
- `put()` - Upload file
- `del()` - Elimina file
- `list()` - Lista file
- `head()` - Ottieni metadata

---

## 5. Configurazione Environment Variables

### **Passo 1: Ottieni token**

Se hai creato Blob da dashboard, le variabili sono già configurate in Vercel.

Per **sviluppo locale**, vai su:
1. Vercel Dashboard → Tuo Progetto → Settings → Environment Variables
2. Cerca `BLOB_READ_WRITE_TOKEN`
3. Copia il valore

### **Passo 2: Configura `.env.local`**

```bash
# .env.local
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123..."
```

⚠️ **IMPORTANTE**: Aggiungi `.env.local` al `.gitignore`!

```bash
# .gitignore
.env.local
.env*.local
```

### **Passo 3: Pull automatico da Vercel (alternativa)**

```bash
# Scarica automaticamente env variables da Vercel
vercel env pull .env.local
```

Questo crea `.env.local` con tutte le variabili del progetto.

---

## 6. Upload File - Base

### **API Route per Upload**

Crea `app/api/upload/route.ts`:

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Upload a Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public', // o 'public' per accesso pubblico
      addRandomSuffix: true // aggiunge hash per evitare conflitti
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: blob.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

### **Client Component per Upload**

Crea `components/FileUploader.tsx`:

```typescript
// components/FileUploader.tsx
'use client'

import { useState } from 'react'

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedUrl(data.url)
        alert('File caricato con successo!')
      } else {
        alert(`Errore: ${data.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Errore durante upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">
            Seleziona file
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm border rounded p-2"
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-300"
        >
          {uploading ? 'Caricamento...' : 'Carica File'}
        </button>
      </form>

      {uploadedUrl && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="font-medium mb-2">File caricato!</p>
          <a 
            href={uploadedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 text-sm break-all hover:underline"
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  )
}
```

---

## 7. Upload File - Con Validazione

### **API Route con Validazione Completa**

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

// Configurazione limiti
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Validazione: file presente
    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      )
    }

    // Validazione: dimensione
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File troppo grande. Massimo ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validazione: tipo file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo file non supportato' },
        { status: 400 }
      )
    }

    // Validazione: nome file
    if (file.name.length > 200) {
      return NextResponse.json(
        { error: 'Nome file troppo lungo' },
        { status: 400 }
      )
    }

    // Upload con metadata
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: blob.size,
      uploadedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Errore durante upload' },
      { status: 500 }
    )
  }
}
```

### **Client con Preview Immagini**

```typescript
// components/ImageUploader.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    setFile(selectedFile)

    // Crea preview per immagini
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedUrl(data.url)
        // Reset form
        setFile(null)
        setPreview(null)
      } else {
        alert(`Errore: ${data.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Errore durante upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">
            Seleziona immagine o documento
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm border rounded p-2"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Max 15MB. Formati: JPG, PNG, WebP, GIF, PDF, DOC, XLS
          </p>
        </div>

        {preview && (
          <div className="relative w-full h-48 bg-gray-100 rounded">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        {file && !preview && (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm">
              <strong>File:</strong> {file.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Dimensione:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-300"
        >
          {uploading ? 'Caricamento...' : 'Carica File'}
        </button>
      </form>

      {uploadedUrl && (
        <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
          <p className="font-medium mb-2 text-green-800">✓ File caricato!</p>
          <a 
            href={uploadedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 text-sm break-all hover:underline"
          >
            Visualizza file →
          </a>
        </div>
      )}
    </div>
  )
}
```

---

## 8. Download e Visualizzazione File

### **I file sono automaticamente accessibili**

Quando carichi un file con `access: 'public'`, ottieni un URL tipo:

```
https://abc123xyz.public.blob.vercel-storage.com/image-xyz789.jpg
```

Questo URL è:
- ✅ Pubblicamente accessibile
- ✅ Servito via CDN edge
- ✅ Ottimizzato per velocità

### **Visualizzare immagini**

```typescript
// Nel tuo componente
<Image 
  src={blobUrl} 
  alt="Uploaded image"
  width={500}
  height={300}
/>

// Oppure normale img
<img src={blobUrl} alt="Uploaded image" />
```

### **Download PDF o documenti**

```typescript
// Link download
<a 
  href={blobUrl} 
  download
  className="text-blue-600 hover:underline"
>
  Scarica documento
</a>
```

### **Serve privato? Usa signed URLs**

```typescript
// API route per file privati
import { put } from '@vercel/blob'

// Upload privato
const blob = await put(file.name, file, {
  access: 'public', // cambia in 'public' se serve accesso diretto
  addRandomSuffix: true
})

// Per accesso controllato, verifica auth prima di servire URL
```

---

## 9. Eliminazione File

### **API Route per Delete**

```typescript
// app/api/upload/[filename]/route.ts
import { del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL required' },
        { status: 400 }
      )
    }

    // Elimina file
    await del(url)

    return NextResponse.json({ 
      success: true,
      message: 'File eliminato'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Errore durante eliminazione' },
      { status: 500 }
    )
  }
}
```

### **Client per eliminare**

```typescript
// Funzione delete
const deleteFile = async (fileUrl: string) => {
  const confirmed = confirm('Eliminare questo file?')
  if (!confirmed) return

  try {
    const response = await fetch(
      `/api/upload/delete?url=${encodeURIComponent(fileUrl)}`,
      { method: 'DELETE' }
    )

    if (response.ok) {
      alert('File eliminato!')
      // Aggiorna UI
    } else {
      alert('Errore durante eliminazione')
    }
  } catch (error) {
    console.error('Delete error:', error)
    alert('Errore durante eliminazione')
  }
}

// Button
<button 
  onClick={() => deleteFile(fileUrl)}
  className="text-red-600 hover:underline"
>
  Elimina
</button>
```

---

## 10. Lista File

### **API Route per listare file**

```typescript
// app/api/files/route.ts
import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    const { blobs } = await list({
      prefix, // filtra per prefisso (es: "user_123/")
      limit
    })

    return NextResponse.json({
      files: blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        contentType: blob.contentType
      }))
    })
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json(
      { error: 'Errore durante recupero file' },
      { status: 500 }
    )
  }
}
```

### **Client per mostrare lista**

```typescript
// components/FilesList.tsx
'use client'

import { useState, useEffect } from 'react'

interface FileItem {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

export default function FilesList() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      setFiles(data.files)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Caricamento...</p>

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold mb-4">I tuoi file</h2>
      
      {files.length === 0 ? (
        <p className="text-gray-500">Nessun file caricato</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.url} className="p-4 border rounded">
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {file.pathname}
              </a>
              <p className="text-sm text-gray-600 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-gray-400">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## 11. Integrazione con Database

### **Salvare metadata nel database Turso**

Aggiungi tabella al tuo schema Drizzle:

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  blobUrl: text('blob_url').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
```

### **API Route che salva in DB**

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, files, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    // Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trova user nel DB
    const user = await db.select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    // Upload a Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true
    })

    // Salva metadata nel database
    const savedFile = await db.insert(files).values({
      userId: user[0].id,
      filename: file.name,
      blobUrl: blob.url,
      contentType: blob.contentType || file.type,
      size: blob.size
    }).returning()

    return NextResponse.json({
      success: true,
      file: savedFile[0]
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

### **Query file per utente**

```typescript
// app/api/my-files/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, files, users } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Query file dell'utente
    const userFiles = await db.select()
      .from(files)
      .where(eq(files.userId, user[0].id))
      .orderBy(desc(files.uploadedAt))

    return NextResponse.json({ files: userFiles })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
```

---

## 12. Esempi Completi

### **Esempio 1: Cover Image per Blog Post**

```typescript
// components/PostEditor.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function PostEditor() {
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setCoverImage(data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-2">Cover Image</label>
        
        {coverImage ? (
          <div className="relative">
            <Image
              src={coverImage}
              alt="Cover"
              width={800}
              height={400}
              className="rounded"
            />
            <button
              onClick={() => setCoverImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              Rimuovi
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={uploading}
            className="block w-full border rounded p-2"
          />
        )}
      </div>

      {/* Altri campi del post... */}
      <input 
        type="text" 
        placeholder="Titolo post"
        className="w-full border rounded p-2"
      />
      <textarea 
        placeholder="Contenuto..."
        className="w-full border rounded p-2 h-64"
      />
    </div>
  )
}
```

### **Esempio 2: Upload Documenti Eventi**

```typescript
// components/EventDocuments.tsx
'use client'

import { useState } from 'react'

interface Document {
  id: number
  filename: string
  blobUrl: string
  size: number
}

export default function EventDocuments({ eventId }: { eventId: number }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('eventId', eventId.toString())

      const response = await fetch('/api/event-documents', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setDocuments([...documents, data.document])
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Documenti Evento</h3>
      
      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full border rounded p-2"
      />

      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">{doc.filename}</p>
              <p className="text-sm text-gray-500">
                {(doc.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <a
              href={doc.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 13. Best Practices

### **1. Organizza file con prefissi**

```typescript
// Upload con struttura cartelle
const blob = await put(`users/${userId}/${file.name}`, file, {
  access: 'public',
  addRandomSuffix: true
})

// Oppure per eventi
const blob = await put(`events/${eventId}/documents/${file.name}`, file, {
  access: 'public',
  addRandomSuffix: true
})
```

**Vantaggi:**
- File organizzati logicamente
- Facile filtrare con `list({ prefix: 'users/123/' })`
- Facile eliminare tutti i file di un utente/evento

### **2. Valida sempre lato server**

```typescript
// ❌ MAI fidarsi solo della validazione client
<input accept="image/*" /> // Facilmente bypassabile

// ✅ SEMPRE validare lato server
export async function POST(request: Request) {
  const file = formData.get('file') as File
  
  // Valida tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 })
  }
  
  // Valida dimensione
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File troppo grande' }, { status: 400 })
  }
}
```

### **3. Salva metadata nel database**

```typescript
// Sempre salvare info importanti nel DB
await db.insert(files).values({
  userId: user.id,
  filename: file.name,
  blobUrl: blob.url,
  contentType: blob.contentType,
  size: blob.size,
  uploadedAt: new Date()
})
```

**Perché:**
- Query veloci (senza chiamare Blob API)
- Relazioni con altri dati (post, eventi, etc)
- Tracking e analytics
- Backup metadata

### **4. Gestisci eliminazione in cascata**

```typescript
// Quando elimini un record, elimina anche il file
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Ottieni file info dal DB
  const file = await db.select()
    .from(files)
    .where(eq(files.id, parseInt(params.id)))
    .limit(1)

  if (!file[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // 2. Elimina da Blob
  await del(file[0].blobUrl)

  // 3. Elimina dal DB
  await db.delete(files).where(eq(files.id, file[0].id))

  return NextResponse.json({ success: true })
}
```

### **5. Usa nomi file sicuri**

```typescript
// Sanitizza nome file
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Rimuovi caratteri speciali
    .replace(/_{2,}/g, '_') // Rimuovi underscore multipli
    .substring(0, 200) // Limita lunghezza
}

// Upload con nome sanitizzato
const safeName = sanitizeFilename(file.name)
const blob = await put(`${userId}/${safeName}`, file, {
  access: 'public',
  addRandomSuffix: true // Aggiunge hash comunque
})
```

### **6. Implementa rate limiting**

```typescript
// Limita upload per utente
import { ratelimit } from '@/lib/ratelimit'

export async function POST(request: Request) {
  const { userId } = await auth()
  
  // Max 10 upload per minuto
  const { success } = await ratelimit.limit(`upload_${userId}`)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Troppi upload. Riprova tra poco.' },
      { status: 429 }
    )
  }
  
  // Procedi con upload...
}
```

### **7. Ottimizza immagini prima dell'upload**

```typescript
// Client-side con canvas
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Ridimensiona se troppo grande
        let width = img.width
        let height = img.height
        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1080
        
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width
          width = MAX_WIDTH
        }
        
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height
          height = MAX_HEIGHT
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        }, 'image/jpeg', 0.85)
      }
    }
  })
}

// Usa prima dell'upload
const handleUpload = async (file: File) => {
  let fileToUpload = file
  
  // Comprimi se è immagine
  if (file.type.startsWith('image/')) {
    fileToUpload = await compressImage(file)
  }
  
  // Upload...
}
```

### **8. Monitora usage**

```typescript
// Crea dashboard per monitorare storage
export async function GET() {
  const { blobs } = await list()
  
  const totalSize = blobs.reduce((acc, blob) => acc + blob.size, 0)
  const totalSizeGB = totalSize / 1024 / 1024 / 1024
  
  return NextResponse.json({
    totalFiles: blobs.length,
    totalSize: totalSizeGB,
    limit: 1, // GB free tier
    percentageUsed: (totalSizeGB / 1) * 100
  })
}
```

---

## 14. Troubleshooting

### **Errore: "Missing required environment variable"**

**Soluzione:**
```bash
# Verifica che .env.local esista e contenga:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Riavvia dev server
npm run dev
```

### **Errore: "Request body too large"**

Next.js limita body size a 4MB di default.

**Soluzione - Configura `next.config.js`:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '20mb' // Aumenta limite
    }
  }
}

module.exports = nextConfig
```

### **Errore 401: Unauthorized**

**Cause possibili:**
1. Token non valido
2. Token non configurato in Vercel
3. Token scaduto

**Soluzione:**
```bash
# Rigenera token da Vercel Dashboard
# Settings → Environment Variables → BLOB_READ_WRITE_TOKEN
# Copia nuovo valore in .env.local

# Oppure via CLI
vercel env pull .env.local
```

### **Upload lento o timeout**

**Soluzioni:**
1. Verifica dimensione file (max 15MB consigliato)
2. Comprimi immagini prima dell'upload
3. Usa progress indicator per feedback utente
4. Controlla connessione internet

```typescript
// Progress indicator
const [uploadProgress, setUploadProgress] = useState(0)

// Con XMLHttpRequest per progress
const xhr = new XMLHttpRequest()
xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    const percentComplete = (e.loaded / e.total) * 100
    setUploadProgress(percentComplete)
  }
})
```

### **File non si visualizza**

**Controlli:**
1. Verifica che `access: 'public'` sia impostato
2. Controlla URL nel browser (deve essere accessibile)
3. Verifica CORS se serve da altro dominio

```typescript
// Se serve CORS custom
const blob = await put(file.name, file, {
  access: 'public',
  addRandomSuffix: true,
  cacheControlMaxAge: 31536000 // 1 anno
})
```

### **Errore: "Storage limit exceeded"**

Hai superato 1GB di storage.

**Soluzioni:**
1. Elimina file vecchi/inutilizzati
2. Comprimi immagini meglio
3. Passa a piano pagato ($0.15/GB)

```typescript
// Script per pulire file vecchi
import { list, del } from '@vercel/blob'

const cleanupOldFiles = async () => {
  const { blobs } = await list()
  
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  for (const blob of blobs) {
    if (new Date(blob.uploadedAt) < oneMonthAgo) {
      await del(blob.url)
      console.log(`Deleted: ${blob.pathname}`)
    }
  }
}
```

### **Blob URL cambia dopo ogni deploy**

**Non è un problema!** Gli URL rimangono validi. Se li salvi nel database, funzionano sempre.

### **Come fare backup dei file?**

```bash
# Usa Vercel CLI per listare
vercel blob list

# Non c'è comando diretto per scaricare tutti i file
# Devi scriverti uno script Node.js

# backup-blobs.js
import { list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

async function backup() {
  const { blobs } = await list()
  
  for (const blob of blobs) {
    const response = await fetch(blob.url)
    const buffer = await response.arrayBuffer()
    
    const filePath = path.join('./backup', blob.pathname)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, Buffer.from(buffer))
    
    console.log(`Backed up: ${blob.pathname}`)
  }
}

backup()
```

---

## 🎉 Complimenti!

Ora sai usare Vercel Blob per:
- ✅ Upload file con validazione
- ✅ Preview immagini
- ✅ Download e visualizzazione
- ✅ Eliminazione file
- ✅ Integrazione con database
- ✅ Best practices di sicurezza

## 📚 Risorse Utili

- [Documentazione Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Esempi ufficiali](https://github.com/vercel/examples/tree/main/storage/blob-starter)
- [Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)

## 🚀 Prossimi Passi

1. Implementa image optimization con Next.js Image
2. Aggiungi drag & drop per upload
3. Crea gallery con thumbnails
4. Implementa multi-file upload
5. Aggiungi watermark alle immagini

Buon coding! 🎯