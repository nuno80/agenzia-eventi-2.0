# Vercel Blob Implementation

This document provides a comprehensive guide to the Vercel Blob file upload functionality implemented in this Next.js project.

## Architecture Overview

The implementation follows a secure, scalable architecture that integrates Vercel Blob storage with a local database for metadata management:

1. Files are uploaded directly to Vercel Blob storage via server-side API routes
2. File metadata (URL, size, type, etc.) is stored in the local database
3. Users can list, view, and delete files through a React-based UI
4. All operations are validated for security and performance

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already included in package.json:

```bash
pnpm add @vercel/blob
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project with your Vercel Blob token:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important**: Replace the placeholder with your actual token. Using the placeholder value will result in "Access denied" errors.

To obtain your token:
1. Visit the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to the "Storage" tab
4. Create a new Blob store or use an existing one
5. Copy the `BLOB_READ_WRITE_TOKEN` value

**Common Issues**:
- Make sure you're copying the entire token value
- Ensure there are no extra spaces before or after the token
- Verify that you've saved the `.env.local` file after making changes
- Restart the development server after updating environment variables

### 3. Database Migration

Run the database migration to create the files table:

```bash
pnpm run db:migrate
```

This creates a `files` table with the following schema:
- `id`: Primary key (auto-incrementing integer)
- `user_id`: Foreign key to users table (nullable)
- `filename`: Original filename (text, not null)
- `blob_url`: Public URL of the file in Vercel Blob storage (text, not null)
- `content_type`: MIME type of the file (text, not null)
- `size`: File size in bytes (integer, not null)
- `uploaded_at`: Timestamp of upload (integer, not null, defaults to current time)

### 4. Start the Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000/files](http://localhost:3000/files) to test the file upload functionality.

## File Upload API Routes

### POST /api/files

Uploads a file to Vercel Blob storage and saves metadata to the database.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with a `file` field containing the file

**Validation:**
- File size limit: 15MB
- Allowed file types: JPG, PNG, WebP, GIF, PDF, DOC, DOCX, XLS, XLSX
- Server-side validation for security

**Response:**
```json
{
  "success": true,
  "file": {
    "id": 1,
    "filename": "example.jpg",
    "blobUrl": "https://your-blob-url.vercel-storage.com/example.jpg",
    "contentType": "image/jpeg",
    "size": 123456,
    "uploadedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET /api/files/list

Retrieves all uploaded files, sorted by upload date (newest first).

**Request:**
- Method: GET

**Response:**
```json
[
  {
    "id": 1,
    "filename": "example.jpg",
    "blobUrl": "https://your-blob-url.vercel-storage.com/example.jpg",
    "contentType": "image/jpeg",
    "size": 123456,
    "uploadedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### DELETE /api/files/[id]

Deletes a file by ID from both Vercel Blob storage and the database.

**Request:**
- Method: DELETE
- Path: `/api/files/{id}` where `{id}` is the database ID of the file

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

## UI Components

### FileUploader

A client-side component for uploading files with validation and feedback:

- File type and size validation
- Progress feedback during upload
- Error handling and user notifications
- Responsive design using Tailwind CSS

### FileList

A component for displaying uploaded files in a responsive table:

- Sortable by upload date (newest first)
- File size display in MB
- Direct links to view/download files
- Delete functionality with confirmation

### FileManager

A tabbed interface combining both upload and list functionality:

- Clean tab navigation between upload and file list views
- Consistent styling with the rest of the application
- Mobile-responsive design

## Testing the Implementation

1. Visit [http://localhost:3000/files](http://localhost:3000/files)
2. Use the "Upload File" tab to upload a file
3. Switch to the "File List" tab to see your uploaded files
4. Click on a filename to view/download the file
5. Use the "Delete" button to remove files

## Supported File Types

The implementation supports common file types with appropriate validation:

- **Images**: JPG, PNG, WebP, GIF
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Maximum file size**: 15MB

## Implementation Details

The implementation follows security and performance best practices:

### Security Features

1. **Server-side Validation**: All file uploads are validated on the server
2. **File Type Restrictions**: Only allowed file types can be uploaded
3. **Size Limits**: Maximum file size prevents abuse
4. **Random Suffixes**: Files are uploaded with random suffixes to prevent naming conflicts
5. **Public Access Control**: Files are stored with appropriate access controls

### Performance Features

1. **Database Metadata**: Fast file listing through local database queries
2. **CDN Delivery**: Files served through Vercel's global CDN
3. **Efficient Storage**: Vercel Blob provides cost-effective storage
4. **Scalable Architecture**: Can handle large numbers of files

### Error Handling

1. **User Feedback**: Clear error messages for common issues
2. **Server Logging**: Detailed error logging for debugging
3. **Graceful Degradation**: Components handle errors without crashing
4. **JSON Response Assurance**: All API endpoints return JSON responses even during errors

## Troubleshooting

### Common Issues

1. **"No file provided" error**: Ensure you've selected a file before uploading
2. **"File too large" error**: Check that your file is under 15MB
3. **"File type not allowed" error**: Verify your file type is supported
4. **Database connection errors**: Ensure your Turso database credentials are correct in `.env.local`
5. **"Unexpected token '<'" error**: This indicates the server is returning an HTML error page instead of JSON. Check that your `BLOB_READ_WRITE_TOKEN` is correctly set in `.env.local`
6. **"Access denied" error**: This indicates your `BLOB_READ_WRITE_TOKEN` is invalid or missing. Follow the steps below to fix it.

### Fixing "Access denied" Errors

1. **Verify Token Format**:
   - Your token should start with `vercel_blob_rw_`
   - It should be a long string of characters (typically 88 characters total)
   - There should be no extra spaces or quotes around the token

2. **Check Environment Variable File**:
   - Open your `.env.local` file
   - Ensure the line looks like this:
     ```
     BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     ```
   - Make sure you've replaced the placeholder with your actual token

3. **Restart Development Server**:
   - Stop the current development server (Ctrl+C)
   - Start it again with `pnpm dev`

4. **Verify Token in Vercel Dashboard**:
   - Go to your Vercel project dashboard
   - Navigate to "Storage" → Your Blob store
   - Confirm the token value matches what's in your `.env.local` file

### Environment Variables

Make sure your `.env.local` file contains:

```env
# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Turso Database (if using Turso instead of local SQLite)
# TURSO_DATABASE_URL=libsql://your-database.turso.io
# TURSO_AUTH_TOKEN=your-auth-token
```

## Extending the Implementation

To add new features:

1. **Additional File Types**: Update the `ALLOWED_TYPES` array in `src/app/api/files/route.ts`
2. **User Association**: Modify the database schema and API routes to associate files with users
3. **Folder Organization**: Use Vercel Blob's folder features to organize files by user or type
4. **Advanced Validation**: Add file content validation or antivirus scanning
5. **Batch Operations**: Implement bulk upload or delete functionality

## Deployment Considerations

When deploying to production:

1. Ensure environment variables are set in your Vercel project settings
2. Verify that your Vercel Blob store is properly configured
3. Test file uploads in the production environment
4. Monitor usage to ensure you're within Vercel Blob's free tier limits (1GB storage, 100GB bandwidth)