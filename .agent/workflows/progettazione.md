---
description: Progettazione con divisione tra Front end e Back end netta
---

Quando ricevi un PRD o una richiesta di nuova feature, crea un piano strutturato seguendo questo schema:

## Stack di Riferimento

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui
- **Backend**: Server Actions, API Routes, DAL Pattern
- **Database**: Turso (LibSQL) + Drizzle ORM
- **Auth**: Better Auth (opt-in)
- **Validazione**: Zod

---

## Struttura Task List

Dividi lo sviluppo in task Backend (B) e Frontend (F):

### Backend Tasks (B1, B2, B3...)
- Schema DB (Drizzle)
- DAL functions (`src/lib/dal/`)
- Server Actions (`src/app/.../actions.ts`)
- API Routes se necessarie (`src/app/api/`)
- Validazioni Zod (`src/lib/validations/`)

### Frontend Tasks (F1, F2, F3...)
- Componenti UI (`src/components/`)
- Pages (`src/app/`)
- Form handling (react-hook-form + Zod)
- Integrazione con Server Actions

---

## Per ogni Task specificare:

1. **Descrizione** - Cosa va costruito
2. **Dipendenze** - Quali task devono essere completati prima (es: F1 dipende da B1)
3. **Complessità** - Semplice / Media / Complessa
4. **File coinvolti** - Path esatti dei file da creare/modificare

---

## Priorità di Implementazione

1. **Prima Backend** - Schema DB → DAL → Actions
2. **Poi Frontend** - UI → Integrazione

---

## Output

Genera la task list in formato compatibile con `.gemini/project-state/BACKLOG.md`
