# Environment Setup Guide

This guide explains how to obtain all the credentials needed to run the starter kit.

---

## 📋 Required Environment Variables

Copy `.env.local.exemple` to `.env.local` and fill in the values:

```bash
cp .env.local.exemple .env.local
```

---

## 🗄️ 1. Turso Database

[Turso](https://turso.tech/) is an edge-ready SQLite database.

### Steps

1. **Create account** at [turso.tech](https://turso.tech)
2. **Install CLI**:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```
3. **Create database**:
   ```bash
   turso db create my-app-db
   ```
4. **Get credentials**:
   ```bash
   # Connection URL
   turso db show my-app-db --url

   # Auth Token
   turso db tokens create my-app-db
   ```

### Environment Variables

```env
TURSO_CONNECTION_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

---

## 📤 2. Vercel Blob Storage

[Vercel Blob](https://vercel.com/docs/storage/vercel-blob) provides file storage.

### Steps

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one)
3. Go to **Storage** → **Create** → **Blob**
4. Copy the `BLOB_READ_WRITE_TOKEN`

### Environment Variable

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

---

## 📧 3. Resend (Email)

[Resend](https://resend.com/) is used for sending emails.

### Steps

1. Create account at [resend.com](https://resend.com)
2. Go to **API Keys** → **Create API Key**
3. Copy the key

### Environment Variable

```env
RESEND_API_KEY=re_xxxxx
```

---

## 🔐 4. Google OAuth (Optional)

For Google sign-in support.

### Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project (or select existing)
3. Enable **Google+ API**:
   - Menu → **APIs & Services** → **Library**
   - Search "Google+ API" → Enable
4. Configure OAuth consent screen:
   - **APIs & Services** → **OAuth consent screen**
   - Choose **External** → **Create**
   - Fill in app name, email
5. Create credentials:
   - **APIs & Services** → **Credentials**
   - **+ Create Credentials** → **OAuth client ID**
   - Type: **Web application**
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Copy **Client ID** and **Client Secret**

### Environment Variables

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

---

## 🔑 5. Better Auth Secret

Generate a random secret for session encryption:

```bash
openssl rand -base64 32
```

### Environment Variables

```env
BETTER_AUTH_SECRET=your-generated-secret
BETTER_AUTH_URL=http://localhost:3000
```

> **Note**: Change `BETTER_AUTH_URL` to your production URL when deploying.

---

## ✅ Complete `.env.local` Example

```env
# Database
TURSO_CONNECTION_URL=libsql://my-db.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# File Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Email
RESEND_API_KEY=re_xxxxx

# Google OAuth (optional)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Better Auth
BETTER_AUTH_SECRET=xxxxx
BETTER_AUTH_URL=http://localhost:3000
```

---

## 🚀 Next Steps

After configuring your environment:

```bash
# Push database schema
pnpm db:push

# Start development
pnpm dev
```
