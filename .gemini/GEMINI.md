# GEMINI.md - Guida per AI Developer

> File snello per guidare l'AI nello sviluppo. Per dettagli, consultare `docs/`.

---

## 🚀 Inizio Sessione

Prima di qualsiasi attività:

1. **Leggere README.md** - Tech stack e overview progetto
2. **Lettura SELETTIVA docs/** - Consulta SOLO i file rilevanti per il task corrente

### Tabella Lettura Selettiva

| Tipo di Task | File da Consultare |
|--------------|-------------------|
| Database query/schema | `docs/database.md` |
| Autenticazione/autorizzazione | `docs/authentication.md` |
| Setup credenziali | `docs/environment-setup.md` |
| Pattern Next.js 16 (quick) | `docs/nextjs16-reference.md` |
| SEO/Metadata/Sitemap/OG | `docs/nextjs16-guide.md` |
| Linting/formatting | `docs/code-style.md` |
| Docker deployment | `docs/guida_ottimizzazione_docker.md` |
| Gemini CLI setup | `docs/guida-GEMINI-CLI.md` |
| File upload/storage | `docs/guida-vercel-blob.md` |
| **Task da fare** | `.gemini/project-state/BACKLOG.md` |
| **Debug / Logica app** | `.gemini/project-state/APP-LOGIC.md` |

> **⚠️ IMPORTANTE**: Leggi solo i file docs necessari per il task. Non leggere l'intera documentazione - satura il contesto inutilmente.

---

## 🏗️ Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind v4, shadcn/ui |
| Database | Turso (LibSQL) + Drizzle ORM |
| Auth | Better Auth (disabilitata di default) |
| File Storage | Vercel Blob |
| Code Quality | Biome + Husky |
| Package Manager | pnpm (obbligatorio) |

---

## 🎯 Principi Fondamentali

```
1. Server-First Architecture
   → Default: Server Components
   → "use client" solo per interattività

2. Type Safety
   → Zero `any` (usare `unknown` + type guards)
   → Zod per validazione input

3. Security by Default
   → Validazione: SEMPRE
   → DTO pattern: mai esporre oggetti DB

4. Separation of Concerns
   Components → Server Actions → DAL (Data Access Layer)
```

---

## 📁 Struttura Progetto

```
src/
├── app/              # Pages e API routes
│   ├── (auth)/       # Login, Signup
│   ├── (dashboard)/  # Dashboard protetta
│   └── api/          # API endpoints
├── components/       # Componenti React
│   ├── ui/           # shadcn/ui
│   └── dashboard/    # Componenti dashboard
├── lib/
│   ├── auth.ts       # Configurazione Better Auth
│   ├── config.ts     # Auth opt-in flag
│   ├── dal/          # Data Access Layer
│   └── validations/  # Schemi Zod
└── db/               # Schemi Drizzle
```

---

## 🔐 Auth Opt-in

L'autenticazione è **disabilitata di default** per facilitare sviluppo e test.

```typescript
// src/lib/config.ts
export const config = {
  auth: {
    enabled: false,  // Cambiare a true per abilitare
  },
}
```

Per abilitare: vedi `docs/authentication.md`

---

## ⌨️ Comandi Essenziali

```bash
# Sviluppo
pnpm dev              # Start server

# Code Quality
pnpm check            # Verifica errori
pnpm check:fix        # Corregge errori
pnpm check:fix:unsafe # Fix unsafe (usa prima questo!)

# Database
pnpm db:push          # Push schema
pnpm db:studio        # Apri Drizzle Studio
```

---

## 📄 Template Documentazione Componenti

```typescript
/**
 * FILE: src/components/[path]/ComponentName.tsx
 * TYPE: Server | Client Component
 *
 * WHY CLIENT: (se applicabile)
 * - Motivo 1
 * - Motivo 2
 *
 * PROPS:
 * - prop1: tipo - descrizione
 *
 * USAGE:
 * <ComponentName prop1={value} />
 */
```

---

## 🎯 Decision Matrix

| Scenario | Soluzione | Docs |
|----------|-----------|------|
| Serve useState? | `"use client"` | nextjs16-reference.md |
| Fetch dati async? | Server Component | nextjs16-reference.md |
| Form submission? | Server Action | nextjs16-reference.md |
| Operazioni DB? | DAL pattern | database.md |
| Upload file? | Vercel Blob | README.md |

---

## ⚠️ Regole Non Negoziabili

1. **Zero `any`** - Usa `unknown` o tipi espliciti
2. **Validazione input** - Sempre con Zod
3. **pnpm** - Mai npm o yarn
4. **shadcn/ui** - Per componenti UI, mai raw HTML
5. **Biome** - Deve passare prima di ogni commit

---

## 📚 Riferimenti Dettagliati

Per approfondimenti, consultare sempre la cartella `docs/`:

- [Environment Setup](docs/environment-setup.md) - Credenziali
- [Database](docs/database.md) - Drizzle + Turso
- [Authentication](docs/authentication.md) - Better Auth
- [Code Style](docs/code-style.md) - Biome
- [Next.js 16](docs/nextjs16-reference.md) - Pattern e best practice

---

## 🤔 Workflow Pre-Coding (OBBLIGATORIO)

**Prima di scrivere qualsiasi codice**, per ogni nuovo task o feature:

1. **Analizza la richiesta** - Leggi attentamente cosa viene chiesto
2. **Fai domande di chiarimento** - Non procedere con assunzioni:
   - Qual è il comportamento atteso?
   - Ci sono edge cases da considerare?
   - Come deve integrarsi con il codice esistente?
   - Quali sono i criteri di accettazione?
3. **Attendi conferma** - Solo dopo aver ricevuto risposte, procedi

> **⚠️ REGOLA**: Mai scrivere codice basandosi su assunzioni. Chiedere sempre per essere sicuri di andare nella direzione giusta.

---

## 📦 Estensioni per Progetti Specifici

Quando ricevi un **PRD dedicato** per un nuovo modulo/app, crea un'estensione separata:

### Struttura

```
.gemini/extensions/[nome-progetto]/
├── gemini-extension.json  # Config obbligatoria
└── GEMINI.md              # Contesto progetto specifico
```

### File gemini-extension.json (template)

```json
{
  "name": "[nome-progetto]",
  "version": "1.0.0",
  "contextFileName": "GEMINI.md"
}
```

### Quando creare un'estensione

- PRD con logica di business specifica
- Moduli con stack tecnologico diverso
- Microservizi separati
- Progetti con entità DB dedicate

L'estensione viene caricata automaticamente insieme al GEMINI.md principale.
