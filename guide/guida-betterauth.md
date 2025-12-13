# Guida Better Auth - Integrazione Next.js 16+

Una guida completa per implementare Better Auth con Next.js, Drizzle ORM e autenticazione Google OAuth.

> ✅ **Stato:** Implementato e Funzionante
> 📅 **Ultimo Aggiornamento:** 2025-12-13
> 🚀 **Tecnologie:** Better Auth, Next.js 16, Drizzle ORM (LibSQL/Turso), Google OAuth

---

## 1. Prerequisiti e Installazione

### Installa dipendenze

```bash
npm install better-auth @better-auth/react drizzle-orm @libsql/client
npm install -D drizzle-kit @types/node dotenv
```

### Variabili `.env.local`

```bash
BETTER_AUTH_SECRET=# Genera con: openssl rand -base64 32
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
TURSO_CONNECTION_URL=libsql://...
TURSO_AUTH_TOKEN=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### OAuth Callback URL (Google Cloud Console)
Configura in Google Cloud Console:
- **Authorized Redirect URI:** `http://localhost:3000/api/auth/callback/google`

---

## 2. Configurazione Backend

### Schema Database (`src/db/libsql-schemas/auth.ts`)
Definisce le tabelle `user`, `session`, `account`, `verification`. Importante: il campo `role` in `user`.

### Configurazione Auth (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user" },
    },
  },
})
```

### API Route (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export const { GET, POST } = toNextJsHandler(auth)
```

---

## 3. Configurazione Frontend

### Client (`src/lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})

export const { signIn, signUp, useSession, signOut } = authClient
```

### Middleware/Proxy (`src/proxy.ts`)
Next.js 16 usa `proxy.ts` invece di middleware per protezione base via cookie.

---

## 4. Gestione Ruoli Admin

### Impostare un Admin (Script)
Usa lo script creato per promuovere un utente ad admin:

```bash
npx tsx scripts/set-admin.ts email@esempio.com
```

Questo aggiorna il campo `role` nel database Turso.

### Protezione Admin (AdminGuard)
Componente `src/components/auth/AdminGuard.tsx` per proteggere pagine client-side:

```tsx
<AdminGuard>
  <DashboardContent />
</AdminGuard>
```

### Layout Dashboard Protetto
Il file `src/app/(dashboard)/layout.tsx` è wrappato con `<AdminGuard>`, rendendo l'intera dashboard accessibile **solo agli admin**.

### Navbar Condizionale
In `src/components/landing/Navbar.tsx`:
- Il link "Dashboard" appare **solo se sei admin**.
- Login/Logout buttons gestiti dinamicamente.

---

## 5. Next.js 16 Compatibility Fixes
⚠️ **Importante:** Next.js 16 ha regole severe sul prerendering e accesso ai dati dinamici.

**Errore:** `new Date()` cannot be used before accessing uncached data.

**Soluzione:** Nei file DAL (`events.ts`, `deadlines.ts`), chiamare `db.query...` **PRIMA** di inizializzare `new Date()`.

```typescript
// ❌ Errato
export const getStats = cache(async () => {
    const now = new Date() // Errore Next.js 16
    const data = await db.query...
})

// ✅ Corretto
export const getStats = cache(async () => {
    const data = await db.query... // Accesso dati primo
    const now = new Date()         // Ora OK
    // ...logica filtro...
})
```

---

## 6. Pagine Login/Signup

### Redirect
Dopo login o registrazione, il redirect è impostato alla **Home Page (`/`)**, non alla dashboard.

- `src/app/(auth)/login/page.tsx`: Email & Google login
- `src/app/(auth)/signup/page.tsx`: Registrazione email

### Fix Hydration/Render
Usare `useEffect` per i redirect automatici (come "se già loggato vai a home") per evitare errori di `setState` durante il render.

---

## 7. Workflow Futuro

1. **Creare nuova pagina protetta:**
   - Server Component: Verifica ruolo dopo fetch sessione.
   - Client Component: Wrappa con `<AdminGuard>`.

2. **Aggiungere campi utente:**
   - Modifica schema Drizzle.
   - Modifica `additionalFields` in `auth.ts`.
   - Esegui migrazione (`drizzle-kit push`).

3. **Deploy:**
   - Assicurarsi che le env vars siano settate su Vercel/Netlify.
   - Google OAuth Authorized URI deve includere dominio produzione.
