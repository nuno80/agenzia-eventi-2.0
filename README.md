This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project includes a fully configured database using Drizzle ORM with [Turso](https://turso.tech) as the backend storage.

### Initial Setup

1. Install dependencies: `pnpm install`
2. Set up your Turso database credentials in `.env.local`
3. Run database migrations: `pnpm db:migrate`

### Database Scripts

- `pnpm db:generate` - Generate migrations based on schema changes
- `pnpm db:migrate` - Apply migrations to the database
- `pnpm db:studio` - Open Drizzle Studio to inspect the database
- `pnpm db:seed` - Seed the database with sample data

### Usage

```typescript
// Using Turso database (libsql implementation)
import { db, users } from '@/db';
```

For more details, see [Database Setup Guide](./guide/database-setup.md).

## Vercel Blob File Upload

This project includes a complete implementation of file upload functionality using Vercel Blob storage, following security and performance best practices.

### Setup

1. Create a `.env.local` file with your Vercel Blob token:
   ```env
   BLOB_READ_WRITE_TOKEN=your_actual_vercel_blob_token_here
   ```
   
   **Important**: Replace `your_actual_vercel_blob_token_here` with your actual token from the Vercel Dashboard.
   
   To obtain your token:
   - Visit the [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to the "Storage" tab
   - Create a new Blob store or use an existing one
   - Copy the `BLOB_READ_WRITE_TOKEN` value

2. Run database migrations to create the files table:
   ```bash
   pnpm db:migrate
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Visit [http://localhost:3000/files](http://localhost:3000/files) to test the file upload functionality

### Common Issues and Solutions

**"Access denied" Error**: 
If you see "Upload failed: Vercel Blob: Access denied, please provide a valid token for this resource", it means your `BLOB_READ_WRITE_TOKEN` is either:
- Missing (still has the placeholder value)
- Invalid (incorrect token)
- Not properly formatted

To fix this:
1. Verify you've replaced the placeholder in `.env.local` with your actual token
2. Ensure there are no extra spaces or quotes around the token
3. Restart the development server after making changes

### Features

- **Secure Uploads**: All files are uploaded with random suffixes to prevent naming conflicts
- **File Validation**: Supports images (JPG, PNG, WebP, GIF) and documents (PDF, DOC, DOCX, XLS, XLSX)
- **Size Limits**: Maximum file size of 15MB for optimal performance
- **Database Integration**: File metadata is stored in the database for easy retrieval
- **File Management**: Complete CRUD operations for uploaded files
- **Responsive UI**: Mobile-friendly interface with tabbed navigation

### API Endpoints

- `POST /api/files` - Upload a file with validation
- `GET /api/files/list` - Retrieve all uploaded files
- `DELETE /api/files/[id]` - Delete a file by ID from both storage and database

### UI Components

- `FileUploader` - Handles file selection, validation, and upload with progress feedback
- `FileList` - Displays uploaded files in a responsive table with view and delete options
- `FileManager` - Tabbed interface combining both upload and list functionality

For implementation details, see [Vercel Blob Implementation Guide](./README-VERCEL-BLOB.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.