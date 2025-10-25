# Guida Architettonica e di Stile v3.0 per lo Sviluppo di Questa Applicazione Next.js 15

Sei il mio assistente AI esperto per lo sviluppo di questa applicazione Next.js. Ogni singolo pezzo di codice, componente o logica che generi **DEVE** aderire scrupolosamente e senza eccezioni alle seguenti regole e best practice. Questo documento è la nostra "single source of truth" per la qualità del codice e le performance.

---

### **Principi Guida: Server-First, Performance by Default e Sicurezza by Design**
L'architettura di questa applicazione si basa su tre pilastri non negoziabili:
1.  **Server-First:** Eseguire il massimo del codice sul server per minimizzare il JavaScript client-side.
2.  **Performance by Default:** Sfruttare attivamente il Partial Pre-rendering, lo streaming, il caching e l'ottimizzazione degli asset per garantire un'esperienza utente fulminea.
3.  **Sicurezza by Design:** L'autorizzazione e la validazione non sono un'aggiunta, ma parte integrante e fondamentale dell'architettura dati.

---

### **1. Ambiente e Setup del Progetto**
- **Node.js:** Versione 18.18 o successiva.
- **Next.js:** Versione `canary` per abilitare le funzionalità sperimentali come il PPR.
- **Creazione Progetto:** Utilizzare `npx create-next-app@latest` con le seguenti opzioni obbligatorie:
    - TypeScript: **Yes**
    - ESLint: **Yes**
    - Tailwind CSS: **Yes**
    - `src/` directory: **Yes**
    - App Router: **Yes**
    - Customize import alias: **No** (mantenere `@/*` di default)

---

### **2. Architettura dei Componenti: React Server Components (RSC)**
- **Regola Fondamentale:** Tutti i componenti nella directory `app/` sono **Server Components (RSC) per impostazione predefinita**. Questo è l'approccio da privilegiare sempre.
- **Client Components:** Vanno usati **solo quando strettamente necessario** per l'interattività (hooks, eventi). Richiedono la direttiva `"use client";` all'inizio del file. L'interattività deve essere isolata nel componente foglia più piccolo possibile.

---

### **3. Routing, Layouts e Performance**
- **Regola Critica:** Il data fetching lato server in un file `layout.tsx` forza **tutte le route figlie a diventare dinamiche**, annullando i benefici del Rendering Statico (SSG).
- **Soluzione Obbligatoria:** Per elementi UI condivisi che necessitano di dati dinamici (es. sessione utente nella navbar), i dati devono essere recuperati **lato client** seguendo il pattern della Sezione 8.

---

### **4. Ottimizzazione degli Asset: `next/image`**
- L'uso del tag `<img />` standard è **vietato**. Utilizzare sempre il componente `<Image />` da `next/image`.
- **Implementazione:** Fornire sempre gli attributi `width` e `height` per evitare il Layout Shift. I domini per le immagini esterne devono essere autorizzati in `next.config.mjs`.
- **Ottimizzazione LCP:** Per le immagini critiche visibili "above the fold" (es. hero image), aggiungere la prop `priority={true}` per caricarle in via prioritaria e migliorare il Largest Contentful Paint.

---

### **5. Il Data Access Layer (DAL): Standard per l'Interazione con i Dati**
Tutta la logica di interazione con i dati (lettura e scrittura) **deve** essere centralizzata in un Data Access Layer (DAL) nella directory `src/data/`.

- **Struttura:** Organizzare la logica per dominio (es. `src/data/user/`, `src/data/todos/`).
- **Sicurezza con `server-only`:** Ogni file nel DAL che interagisce con il database o usa segreti **deve** importare `'server-only'` all'inizio per prevenire fughe di codice sul client.
- **Regola Fondamentale (Autorizzazione alla Fonte):** La verifica dell'autorizzazione utente **deve** avvenire all'interno della funzione del DAL, prima di qualsiasi interazione con il database. Utilizzare una funzione di utility centralizzata per questo scopo.
- **Deduplicazione con `React.cache()`:** La funzione di utility per l'autorizzazione (`requireUser`) **deve** essere avvolta in `React.cache()` per deduplicare le chiamate all'interno di un singolo render pass.

---

### **6. Strategie di Rendering e Data Fetching per Server Components**
La scelta della strategia di rendering dipende dalla natura del contenuto della pagina.

#### **6.1. Pagine Statiche e con Revalidazione (SSG/ISR)**
- **Utilizzo:** Per pagine il cui contenuto non cambia a ogni richiesta (es. blog, pagine di marketing). Questo è l'approccio di default se non vengono usate API dinamiche.
- **Implementazione:** Non è richiesta alcuna configurazione speciale. Next.js le renderizzerà staticamente in fase di build.

#### **6.2. Pagine Interamente Dinamiche (SSR) con Streaming**
- **Utilizzo:** Per pagine dove l'intera struttura dipende da dati dinamici (es. una pagina di ricerca).
- **Implementazione:** L'uso di funzioni dinamiche (`headers`, `cookies`) o di `fetch` con `{ cache: 'no-store' }` rende l'intera pagina dinamica. In questo caso, usare `<Suspense>` per lo streaming granulare è fondamentale per non bloccare la UI.

#### **6.3. Pagine Ibride: Partial Pre-rendering (PPR)**
- **Utilizzo:** **Questa è la strategia preferita per la maggior parte delle pagine.** È ideale per route che contengono principalmente contenuto statico ma con alcune "isole" di contenuto dinamico.
- **Concetto Chiave:** La pagina viene servita istantaneamente come una shell statica pre-renderizzata (da CDN), mentre le parti dinamiche vengono caricate in streaming.
- **Regola di Implementazione:**
    1.  **Abilitazione:** Attivare il flag in `next.config.mjs` e aggiungere `export const experimental_ppr = true;` nel file della pagina.
    2.  **Delimitazione:** Avvolgere **esclusivamente** i componenti che fetchano dati dinamici in un tag `<Suspense>`. **Ciò che è fuori da `<Suspense>` diventa la shell statica; ciò che è dentro diventa un "buco" dinamico.**

**Esempio di PPR:**
```tsx
// app/products/[id]/page.tsx
import { Suspense } from 'react';
import ProductDetails from '@/components/ProductDetails'; // Statico
import LiveReviews from '@/components/LiveReviews';         // Dinamico
import { ReviewsSkeleton } from '@/components/Skeletons';

// 1. Abilita il PPR per questa pagina
export const experimental_ppr = true;

export default function ProductPage({ params }) {
  return (
    <div>
      {/* Questo componente viene pre-renderizzato e fa parte della shell statica */}
      <ProductDetails productId={params.id} />
      
      <hr />
      
      {/* Questa sezione è un "buco" che verrà riempito in streaming */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <LiveReviews productId={params.id} />
      </Suspense>
    </div>
  );
}
```

---

### **7. Data Fetching per Client Components: Il Pattern `React.use()`**
Quando i dati sono necessari per l'interattività, l'uso di `useEffect` per il fetching è un **anti-pattern vietato**. Lo standard è il pattern **"Pass the Promise"**.

- **Workflow Obbligatorio:**
    1.  **Inizia il Fetch sul Server (senza `await`):** Nel Server Component genitore, chiama la funzione di fetching del DAL per ottenere una `Promise`.
    2.  **Passa la Promise come Prop:** Passa la `Promise` non risolta al Client Component figlio.
    3.  **Consuma la Promise con `use()`:** Dentro il Client Component, usa l'hook `React.use(promise)` per leggere il risultato. Il componente **deve** essere avvolto in `<Suspense>`.

---

### **8. Mutazioni Dati: Server Actions**
Le Server Actions sono usate **ESCLUSIVAMENTE per le mutazioni** (create, update, delete). L'uso per il data fetching è severamente vietato.

- **Architettura:** La logica delle Server Action **deve** risiedere nel DAL.
- **Workflow Obbligatorio:** Ogni Server Action **deve** seguire questo schema:
    1.  **Definizione:** Il file deve iniziare con `"use server";`.
    2.  **Autorizzazione alla Fonte:** Verificare la sessione utente come primo passo.
    3.  **Validazione Rigorosa dell'Input:** Usare **Zod** per validare i dati in ingresso.
    4.  **Logica di Mutazione Sicura:** Eseguire l'operazione sul DB in un blocco `try...catch`.
    5.  **Revalidazione della Cache:** Usare `revalidatePath()` o `revalidateTag()` dopo una mutazione riuscita.
    6.  **Feedback alla UI:** Restituire uno stato serializzabile per `useFormState`.

---

### **9. Autenticazione e Sicurezza**
- **Protezione delle Route:** Deve essere gestita tramite **Middleware**. Questo è il modo più efficiente perché preserva il rendering statico delle pagine protette.
- **Accesso ai Dati Utente:**
    - **Lato Server:** Usare le funzioni fornite dal provider di autenticazione (es. `auth()` di Clerk).
    - **Lato Client:** Usare gli hook forniti (es. `useUser()` di Clerk) per non rompere il rendering statico dei layout.
````