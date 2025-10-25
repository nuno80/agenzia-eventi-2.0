# Event Management Landing Page

This is a modern Next.js 16 application for an event management company, implementing best practices from the Next.js 15+ architecture guide. The application features a landing page for event services along with a complete file management system using Vercel Blob storage.

## 🚀 Key Features

### Modern Next.js Architecture
- **Server-First Architecture**: Components default to Server Components with Client Components only when necessary
- **Cache Components**: Next.js 16's implementation of Partial Pre-rendering for faster initial page loads
- **Server Actions**: Replaced traditional API routes for mutations with Server Actions
- **Data Access Layer (DAL)**: Centralized data access with proper server-only imports and security
- **Route Protection**: Proxy-based route protection for secure access control

### File Management System
- **Vercel Blob Integration**: Secure file uploads with Vercel Blob storage
- **Database Metadata**: File metadata stored in SQLite database via Drizzle ORM
- **File Operations**: Complete CRUD functionality (Create, Read, Update, Delete)
- **Validation**: File type and size validation (15MB limit)
- **Responsive UI**: Mobile-friendly file management interface

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with Drizzle ORM
- **File Storage**: Vercel Blob
- **Authentication**: Placeholder system ready for Clerk integration
- **Deployment**: Vercel-ready configuration

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (legacy, being replaced by Server Actions)
│   ├── files/          # File management pages
│   └── server-demo/    # Demonstration of modern architecture
├── components/         # React components
│   ├── landing/        # Landing page components
│   └── ui/             # Reusable UI components
├── data/               # Data Access Layer (DAL)
│   ├── files/          # File-related data operations
│   ├── users/          # User-related data operations
│   └── server-only.ts  # Authorization utilities
└── db/                 # Database configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18 or later
- pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Environment Variables
Create a `.env.local` file with:
```env
# Vercel Blob (required for file uploads)
BLOB_READ_WRITE_TOKEN=your_actual_vercel_blob_token_here

# Turso Database (optional, for production)
# TURSO_DATABASE_URL=libsql://your-database.turso.io
# TURSO_AUTH_TOKEN=your-auth-token
```

### Database Setup
```bash
# Create database tables
pnpm db:create

# Or generate and apply migrations
pnpm db:generate
pnpm db:migrate

# View database in Drizzle Studio
pnpm db:studio
```

### Development
```bash
# Start development server
pnpm dev

# Visit http://localhost:3000
```

## 📤 File Upload Features

### Supported File Types
- Images: JPG, PNG, WebP, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Maximum size: 15MB

### API Endpoints
- `POST /api/files` - Upload a file
- `GET /api/files/list` - List all files
- `DELETE /api/files/[id]` - Delete a file

### UI Components
- `FileUploader` - Drag-and-drop file upload with validation
- `FileList` - Responsive table of uploaded files
- `FileManager` - Tabbed interface combining upload and list views

## 🏗️ Modern Architecture Implementation

### Data Access Layer (DAL)
Centralized data operations in `src/data/`:
- Server-only imports prevent client-side leakage
- React.cache() deduplication for authorization functions
- Consistent error handling and return formats
- Type-safe database operations with Drizzle ORM

### Component Architecture
- Server Components by default for better performance
- Client Components only where interactivity is needed
- "Pass the Promise" pattern for optimized data fetching
- Suspense boundaries with loading skeletons

### Server Actions
- Replace API routes for mutations
- Built-in validation and error handling
- Cache invalidation with revalidatePath()
- Serializable return values for client consumption

## 🛡️ Security Features

- Server-only data access prevents credential leakage
- File type and size validation
- Authorization checks at the data access layer
- Route protection via proxy middleware
- Secure Vercel Blob storage with random suffixes

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive file management interface
- Accessible UI components
- Optimized performance for all devices

## 🚀 Deployment

The application is configured for easy deployment to Vercel:

1. Push to a GitHub repository
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## 📚 Additional Documentation

- [Vercel Blob Implementation Guide](./README-VERCEL-BLOB.md) - Detailed file upload system documentation
- [Database Setup Guide](./guide/database-setup.md) - Database configuration and management
- [Next.js 15 Alignment Summary](./NEXTJS15_ALIGNMENT_SUMMARY.md) - Modernization implementation details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary software developed for a specific client.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Database management with [Drizzle ORM](https://orm.drizzle.team)
- File storage with [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)