# Logica Applicazione - Starter Kit

> Documentazione della logica dell'app. Aggiorna con i moduli del PRD specifico.

---

## 🏗️ Architettura

```
Browser → Next.js App Router → Server Components/Actions → DAL → Drizzle → Turso DB
```

---

## Moduli Starter Kit

### 🔐 Autenticazione (Better Auth)

| Aspetto | Dettaglio |
|---------|-----------|
| **Stato** | Disabilitata di default (`src/lib/config.ts`) |
| **File chiave** | `src/lib/auth.ts`, `src/lib/auth-client.ts` |
| **Pages** | `src/app/(auth)/login/`, `src/app/(auth)/signup/` |
| **Middleware** | `src/middleware.ts` |
| **DB Schema** | `src/db/libsql-schemas/auth.ts` |

**Flusso Login:**
1. User submits form → Server Action
2. Better Auth verifica credenziali
3. Crea session + cookie
4. Middleware verifica session su route protette

**Debug:**
- Session non valida? → Controlla `src/middleware.ts`
- Credenziali errate? → Controlla `src/lib/auth.ts`

---

### 📊 Dashboard

| Aspetto | Dettaglio |
|---------|-----------|
| **Route Group** | `src/app/(dashboard)/` |
| **Layout** | `src/app/(dashboard)/layout.tsx` |
| **Home** | `src/app/(dashboard)/dashboard/page.tsx` |
| **Componenti** | `src/components/dashboard/` |

**Flusso:**
1. Middleware verifica auth
2. Layout carica sidebar/navbar
3. Page renderizza contenuto

---

### 📁 File Upload (Vercel Blob)

| Aspetto | Dettaglio |
|---------|-----------|
| **Page** | `src/app/(dashboard)/files/page.tsx` |
| **API Upload** | `src/app/api/upload/route.ts` |
| **API Delete** | `src/app/api/files/[id]/route.ts` |
| **DAL** | `src/lib/dal/files.ts` |
| **DB Schema** | `src/db/libsql-schemas/files.ts` |

**Flusso Upload:**
1. User drag & drop file
2. Client chiama `PUT /api/upload`
3. Server valida tipo/size
4. Upload a Vercel Blob
5. Salva metadata in DB

**Debug:**
- Upload fallisce? → Controlla `BLOB_READ_WRITE_TOKEN` in `.env.local`
- File non visibile? → Controlla DAL `getAllFiles()`

---

### ⚙️ Settings

| Aspetto | Dettaglio |
|---------|-----------|
| **Page** | `src/app/(dashboard)/impostazioni/page.tsx` |
| **DAL** | `src/lib/dal/settings.ts` |
| **Actions** | `src/app/(dashboard)/impostazioni/actions.ts` |

---

### 🗄️ Data Access Layer (DAL)

| File | Responsabilità |
|------|----------------|
| `src/lib/dal/auth.ts` | Verifica sessione, get user |
| `src/lib/dal/files.ts` | CRUD files |
| `src/lib/dal/settings.ts` | CRUD settings |

**Pattern:**
```typescript
// Ogni funzione DAL:
// 1. Verifica auth (se necessario)
// 2. Valida input
// 3. Query DB con Drizzle
// 4. Ritorna DTO (mai oggetti DB raw)
```

---

## 🔧 Debug Common Issues

| Problema | File da Controllare |
|----------|---------------------|
| Auth non funziona | `src/lib/config.ts` → `auth.enabled: true` |
| Route protetta accessibile | `src/middleware.ts` |
| DB connection error | `.env.local` → `TURSO_*` vars |
| Upload fallisce | `.env.local` → `BLOB_READ_WRITE_TOKEN` |
| Build error | `pnpm check` per vedere errori |

---

## 🌱 Database Seed

| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `src/lib/db/seed.ts` |
| **Comando** | `pnpm db:seed` |
| **Stato attuale** | Specifico per app gestione eventi |

> ⚠️ **IMPORTANTE**: Il seed attuale contiene dati di esempio per un'app eventi (events, participants, speakers, sponsors, deadlines, budget, staff).
>
> **Dopo aver ricevuto il PRD** del nuovo progetto, questo file va **ricreato** con dati pertinenti alle nuove entità DB.

---

## 📦 Da Aggiungere con PRD

Quando ricevi un PRD, aggiungi qui:

- Nuovi moduli con file chiave
- Flussi business logic
- Relazioni tra entità DB
- Debug tips specifici
