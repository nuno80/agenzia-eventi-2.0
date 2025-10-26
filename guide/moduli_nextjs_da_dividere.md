Perfetto. Ho analizzato la guida `nextjs16-guide.md` e la mappa dei moduli `nextjs16_modules_map.txt`.

Dato che i moduli `00-quick-reference.md` e `03-data-fetching-caching.md` sono già completati, procederò a creare i contenuti per i moduli rimanenti, seguendo l'ordine di priorità definito nel piano d'azione.

Ecco i moduli generati in base alla tua richiesta.

---
---

## 📁 04-server-actions.md (Priorità ALTA)

### Contenuto dal Documento Originale:

#### 1. Server Actions
Le Server Actions permettono di eseguire codice *esclusivamente* sul server, in risposta a interazioni dell'utente (es. sottomissione di form).

*   **`"use server";`**: Direttiva *obbligatoria* all'inizio di una funzione (o di un file) per trasformarla in una Server Action.
*   **Chiamata Diretta da Client Components**: Puoi chiamare le Server Actions *direttamente* dai Client Components (senza creare Route Handlers API).
*   **Gestione Form**: Ideali per la gestione dei form (validazione, sottomissione, ecc.).
*   **Progressive Enhancement**: Funzionano anche se Javascript è disabilitato.

#### 2. Esempio Completo
Questo esempio mostra una Server Action per aggiungere un prodotto, con validazione dei dati e invalidazione della cache.

```tsx
// app/add-product/page.tsx
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Server Action definita nello stesso file
async function addProduct(formData: FormData) {
  "use server";

  const schema = z.object({
    name: z.string().min(3),
    price: z.coerce.number().positive(),
  });

  const rawData = Object.fromEntries(formData);
    
  try {
    const validatedData = schema.parse(rawData);

    // ... invia i dati al database o a un'API ...
    console.log("Dati validati:", validatedData);

    // Invalida la cache per la route `/products` per mostrare il nuovo prodotto
    revalidatePath('/products'); 

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Gestione errore di validazione
      throw new Error(`Validation Error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    // Gestione altri errori
    throw error;
  }
}

export default function AddProductPage() {
  return (
    <form action={addProduct}>
      <input type="text" name="name" placeholder="Product Name" required />
      <input type="number" name="price" placeholder="Price" required />
      <button type="submit">Add Product</button>
    </form>
  );
}
```

**Esempio con `updateTag` (Next.js 16):**

Per un aggiornamento più granulare e immediato, `updateTag` è la scelta migliore.

```tsx
// app/actions/products.ts
"use server";

import { updateTag } from 'next/cache';
import { z } from 'zod';
// import { db } from '@/lib/db'; // Esempio di client DB

const productSchema = z.object({
  name: z.string().min(3),
  price: z.coerce.number().positive(),
});

export async function addProductAction(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validatedData = productSchema.parse(rawData);

  // const newProduct = await db.products.create(validatedData);
  
  // 🆕 Usa updateTag per aggiornamento immediato con semantica "read-your-writes"
  updateTag('products');
  
  // return { success: true, product: newProduct };
  return { success: true, product: validatedData };
}
```

### Nuove Sezioni Aggiunte (Espansione):

#### 3. Form Patterns
Le Server Actions introducono potenti pattern per la gestione dei form.

*   **`useFormStatus`**: Hook per ottenere lo stato di pending di un form (utile per disabilitare bottoni o mostrare loader).

    ```tsx
    // components/SubmitButton.tsx
    "use client";
    import { useFormStatus } from 'react-dom';

    export function SubmitButton() {
      const { pending } = useFormStatus();

      return (
        <button type="submit" disabled={pending}>
          {pending ? 'Submitting...' : 'Submit'}
        </button>
      );
    }
    ```

*   **`useFormState`**: Hook per gestire lo stato di un form, inclusi i messaggi di errore restituiti dalla Server Action.

    ```tsx
    // app/actions/userActions.ts
    "use server";
    
    export async function updateUser(prevState: any, formData: FormData) {
      // ... logica di validazione e aggiornamento
      if (formData.get('name') === '') {
        return { message: 'Name cannot be empty.' };
      }
      return { message: 'User updated successfully.' };
    }
    ```

    ```tsx
    // components/UpdateUserForm.tsx
    "use client";
    import { useFormState } from 'react-dom';
    import { updateUser } from '@/app/actions/userActions';
    import { SubmitButton } from './SubmitButton';

    const initialState = { message: null };

    export function UpdateUserForm() {
      const [state, formAction] = useFormState(updateUser, initialState);

      return (
        <form action={formAction}>
          <input type="text" name="name" />
          <SubmitButton />
          {state?.message && <p>{state.message}</p>}
        </form>
      );
    }
    ```

#### 4. Validation
Una validazione robusta è cruciale. Combina la validazione lato client per un feedback immediato con una validazione lato server (obbligatoria) per sicurezza.

*   **Schema Zod Dettagliato**:

    ```ts
    // lib/schemas/postSchema.ts
    import { z } from 'zod';

    export const postSchema = z.object({
      title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri.").max(100),
      content: z.string().min(10, "Il contenuto è troppo corto."),
      published: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
    });
    ```

*   **Gestione Errori di Validazione nella Server Action**:

    ```ts
    // app/actions/postActions.ts
    "use server";
    import { postSchema } from '@/lib/schemas/postSchema';

    export async function createPost(prevState: any, formData: FormData) {
      const validatedFields = postSchema.safeParse(Object.fromEntries(formData));

      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Post.',
        };
      }
      
      // ... logica di creazione post
      return { message: 'Post creato!' };
    }
    ```

#### 5. Server Actions vs API Routes

| Caratteristica | Server Actions | API Routes (Route Handlers) |
| :--- | :--- | :--- |
| **Caso d'uso** | Mutazioni dati da UI (forms), RPC | Endpoint API pubblici, webhooks, comunicazione tra servizi |
| **Invocazione** | Diretta da componenti, `action` dei form | Chiamate HTTP (`fetch`) |
| **Progressive Enhancement** | Sì, i form funzionano senza JS | No, richiede JS per `fetch` |
| **Bundle Size** | Potenziale riduzione (no endpoint API separato) | Aggiunge un endpoint che può essere chiamato da chiunque |
| **Complessità** | Inferiore per interazioni UI-server | Maggiore per la gestione di `fetch`, stati, errori |

**Quando usare cosa:**
*   **Server Actions**: Per tutte le operazioni di mutazione (Creazione, Aggiornamento, Cancellazione) avviate dall'interfaccia utente.
*   **API Routes**: Quando hai bisogno di esporre un endpoint a terze parti, per webhooks, o per il data fetching da Client Components (es. con SWR o React Query).

#### 6. Security
*   **Input Validation**: **Sempre** validare e sanitizzare i dati in arrivo con librerie come Zod.
*   **CSRF Protection**: Next.js 16 include una protezione CSRF automatica per le Server Actions. Non è richiesta configurazione aggiuntiva.
*   **Rate Limiting**: Per azioni sensibili (es. login, invio email), implementa un sistema di rate limiting per prevenire abusi.
*   **Authorization**: **Sempre** verificare i permessi dell'utente all'interno della Server Action prima di eseguire qualsiasi operazione.

    ```ts
    // app/actions/adminActions.ts
    "use server";
    import { requireAdmin } from '@/lib/dal'; // Dal Data Access Layer

    export async function deleteUser(userId: string) {
      const admin = await requireAdmin(); // Lancia un errore se l'utente non è admin
      
      // ... logica di cancellazione
    }
    ```

---
---

## 📁 07-dal-security.md (Priorità ALTA)

### Contenuto dal Documento Originale:

#### 1. Data Access Layer (DAL) - Best Practices
Il **Data Access Layer (DAL)** è un pattern architetturale che centralizza la logica di accesso ai dati, migliorando sicurezza, manutenibilità e testabilità.

*   **Perché usare un DAL?**
    *   **Sicurezza Centralizzata**: Tutti i controlli di autenticazione e autorizzazione sono in un unico posto.
    *   **Codice Riutilizzabile**: Le funzioni di data fetching sono condivise tra Server Components, Route Handlers e Server Actions.
    *   **Testabilità**: È facile mockare le funzioni del DAL nei test.
    *   **Separazione delle Responsabilità**: L'UI (App Router) è separata dalla logica dei dati.

*   **Struttura del Progetto:**

    ```
    src/
    ├── app/              # UI
    └── lib/
        ├── dal/          # 🔐 Data Access Layer
        │   ├── index.ts  # Funzioni core (verifySession, getUser)
        │   ├── posts.ts  # Funzioni per i post
        │   └── users.ts  # Funzioni per gli utenti
        ├── db/           # Configurazione DB (es. Prisma)
        └── dto/          # Data Transfer Objects
    ```

*   **Implementazione del DAL (Funzioni Core):**

    ```ts
    // lib/dal/index.ts
    import { cache } from 'react';
    import { cookies } from 'next/headers';
    import { redirect } from 'next/navigation';

    // Verifica la sessione dell'utente
    export const verifySession = cache(async () => {
      // ... logica per validare il token/cookie di sessione
    });

    // Ottiene i dati dell'utente corrente in modo sicuro (DTO)
    export const getUser = cache(async () => {
      const session = await verifySession();
      if (!session) return null;
      // ... fetch dal DB solo i campi sicuri
    });

    // Protegge una route, reindirizzando se non autenticato
    export async function requireAuth() {
      const session = await verifySession();
      if (!session) redirect('/login');
      return session;
    }
    ```    **Perché `cache()`?** La funzione `cache` di React memoizza il risultato di una funzione per la durata di una singola richiesta server-side, prevenendo chiamate multiple al database per gli stessi dati.

*   **Data Transfer Objects (DTOs)**:
    I DTOs sono interfacce che definiscono quali dati possono essere esposti in modo sicuro. **Mai** restituire l'intero oggetto del database.

    ```ts
    // lib/dto/user.dto.ts
    export interface PublicUserDTO {
      id: string;
      name: string;
    }

    export interface UserProfileDTO extends PublicUserDTO {
      email: string; // Visibile solo al proprietario
    }
    ```

*   **Uso del DAL nei Componenti:**

    ```tsx
    // app/dashboard/page.tsx
    import { requireAuth } from '@/lib/dal';
    import { getUserPosts } from '@/lib/dal/posts';

    export default async function DashboardPage() {
      await requireAuth(); // Protegge la pagina
      const posts = await getUserPosts(); // Ottiene i dati tramite il DAL

      return <div>{/* ... */}</div>;
    }
    ```

#### 2. Pattern Avanzati
*   **Role-Based Access Control (RBAC)**: Controlla l'accesso in base al ruolo dell'utente.

    ```ts
    // lib/dal/index.ts
    export async function requireAdmin() {
      const user = await getUser();
      if (!user || user.role !== 'ADMIN') {
        redirect('/unauthorized');
      }
      return user;
    }
    ```

*   **Owner-Based Access Control**: Verifica che l'utente sia il proprietario di una risorsa.

    ```ts
    // lib/dal/posts.ts
    export async function updatePost(postId, data) {
      const session = await verifySession();
      const post = await db.post.findUnique({ where: { id: postId } });

      if (post.authorId !== session.userId) {
        throw new Error('Forbidden');
      }
      // ... logica di aggiornamento
    }
    ```

#### 3. Vantaggi con Next.js 16
*   **Caching Esplicito nel DAL**: Aggiungi `"use cache"` e `cacheLife` alle funzioni del DAL per un controllo granulare della cache.
*   **Separazione Cached/Dynamic**: Crea funzioni separate nel DAL per dati statici (`"use cache"`) e dati dinamici (senza `"use cache"`).
*   **`updateTag` per UX**: Le Server Actions possono chiamare funzioni del DAL e poi usare `updateTag` per invalidare la cache, fornendo un feedback immediato all'utente.

### Nuove Sezioni Aggiunte (Espansione):

#### 4. Security Deep Dive
*   **OWASP Top 10 per Next.js**:
    *   **A01: Broken Access Control**: Implementato tramite `requireAuth`, RBAC e Owner-based checks nel DAL.
    *   **A03: Injection**: Prevenuto usando un ORM come Prisma o Drizzle che sanitizza le query SQL.
    *   **A05: Security Misconfiguration**: Mantenere le dipendenze aggiornate e configurare correttamente gli header di sicurezza.
    *   **A07: Identification and Authentication Failures**: Gestito tramite provider di autenticazione robusti (es. Clerk) e validazione della sessione nel DAL.
*   **XSS (Cross-Site Scripting)**: React di default effettua l'escape delle stringhe renderizzate, proteggendo contro XSS. Fai attenzione quando usi `dangerouslySetInnerHTML`.
*   **Rate Limiting**: Implementa il rate limiting sulle Server Actions e API Routes più sensibili per prevenire attacchi di forza bruta o DoS.

#### 5. Security Checklist per il DAL
Un audit di sicurezza dovrebbe concentrarsi principalmente sul DAL.

- [ ] **Autenticazione**: Ogni funzione che accede a dati protetti chiama `verifySession()` o `requireAuth()`?
- [ ] **Autorizzazione**: Vengono eseguiti controlli RBAC o di proprietà prima di ogni mutazione (create, update, delete)?
- [ ] **DTO Pattern**: Le funzioni restituiscono solo DTO con campi sicuri? Password, token o dati sensibili non vengono mai esposti?
- [ ] **Input Validation**: L'input viene validato (es. con Zod) all'inizio di ogni Server Action prima di essere passato al DAL?
- [ ] **Error Handling**: I messaggi di errore non espongono dettagli sensibili dell'infrastruttura (es. stack trace)?
- [ ] **SQL Injection**: Stai usando un ORM o un query builder parametrizzato?

---
---

## 📁 01-routing-navigation.md (Priorità MEDIA)

### Contenuto dal Documento Originale:

#### 1. Routing (App Router)
L'App Router usa una struttura di cartelle per definire le route.
*   **`app/page.tsx`**: Definisce la UI per la route `/`.
*   **`app/about/page.tsx`**: Definisce la UI per la route `/about`.

#### 2. Route Dinamiche con Async Params
Usa `[]` per segmenti dinamici. In Next.js 16, `params` è asincrono.
*   `app/blog/[slug]/page.tsx` corrisponde a `/blog/post-1`, `/blog/un-altro-post`, etc.

```tsx
// app/blog/[slug]/page.tsx
// ⚠️ BREAKING CHANGE: params è ora una Promise
async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // È necessario usare await
  return <h1>Post: {slug}</h1>;
}
```

#### 3. Route Groups
Usa `()` per raggruppare route senza che il nome della cartella influenzi l'URL. Utile per organizzare il progetto o applicare layout specifici.
*   `app/(marketing)/about/page.tsx` -> `/about`
*   `app/(shop)/products/page.tsx` -> `/products`

#### 4. Layouts
Definiscono UI condivisa tra più pagine.
*   **`app/layout.tsx` (Root Layout)**: Obbligatorio, avvolge tutte le pagine.
*   **Layout Annidati**: Un file `layout.tsx` in una sottocartella (es. `app/dashboard/layout.tsx`) si applicherà a tutte le pagine in quella sezione, annidandosi all'interno del layout genitore.

#### 5. Navigazione (`next/link`)
Usa il componente `<Link>` per la navigazione client-side (veloce, senza ricaricare la pagina).

```tsx
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

#### 6. Routing e Navigazione Migliorati in Next.js 16
*   **Layout Deduplication**: I layout condivisi vengono scaricati una sola volta.
*   **Incremental Prefetching**: Vengono pre-caricate solo le parti mancanti di una pagina.
*   **Automatic Cancellation**: Le richieste di prefetching vengono annullate se l'utente si allontana dal link.

### Nuove Sezioni Aggiunte (Espansione):

#### 7. Loading UI e Streaming (`loading.tsx`)
Crea un file `loading.tsx` in qualsiasi cartella per mostrare automaticamente un'interfaccia di caricamento (es. uno skeleton) mentre il contenuto della pagina e dei suoi figli viene caricato. Next.js avvolgerà la tua `page.tsx` in un boundary `<Suspense>` usando `loading.tsx` come fallback.

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  // Puoi includere uno Skeleton.
  return <div>Caricamento Dashboard...</div>;
}
```

#### 8. Error Handling (`error.tsx`)
Crea un file `error.tsx` per gestire gli errori che si verificano in un segmento di route e nei suoi figli. Questo file crea un Error Boundary.

*   **Deve essere un Client Component** (`"use client"`).
*   Riceve due props: `error` (l'oggetto errore) e `reset` (una funzione per tentare di renderizzare nuovamente il componente).

```tsx
// app/dashboard/error.tsx
"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void; }) {
  return (
    <div>
      <h2>Qualcosa è andato storto!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Riprova</button>
    </div>
  );
}
```
Per gestire errori nel Root Layout, usa `app/global-error.tsx`.

#### 9. Not Found (`not-found.tsx` e `notFound()`)
Crea un file `not-found.tsx` per renderizzare una UI personalizzata quando la funzione `notFound()` viene chiamata o quando un URL non corrisponde a nessuna route.

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Pagina Non Trovata</h2>
      <p>Impossibile trovare la risorsa richiesta.</p>
      <Link href="/">Torna alla Home</Link>
    </div>
  );
}
```

Puoi attivare la pagina 404 programmaticamente da un Server Component:
```tsx
import { notFound } from 'next/navigation';

async function getPost(slug) {
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) {
    notFound(); // Mostra la UI di not-found.tsx
  }
  return post;
}
```

---
---

## 📁 02-server-client-components.md (Priorità MEDIA)

### Contenuto dal Documento Originale:

#### 1. React Server Components (RSC) e Client Components
Next.js 16 utilizza l'architettura dei **React Server Components (RSC)**.

*   **Server Components (Default)**:
    *   Eseguiti **esclusivamente** sul server.
    *   Ideali per: data fetching, accesso a risorse backend, mantenere dati sensibili sul server.
    *   **Non possono** usare state (`useState`), effetti (`useEffect`) o event handlers (`onClick`).
    *   Riducono il JavaScript inviato al client.

*   **Client Components (`"use client"`)**:
    *   Eseguiti nel browser (ma pre-renderizzati sul server per il caricamento iniziale).
    *   Richiedono la direttiva `"use client";` all'inizio del file.
    *   Usati per: interattività, state, effetti, event handlers e accesso alle API del browser.

**Regola Generale**: Inizia con Server Components e usa Client Components solo quando hai bisogno di interattività. Posiziona la direttiva `"use client"` il più in basso possibile nell'albero dei componenti (sui componenti "foglia").

#### 2. Component Composition Patterns
*   **Server Component che importa un Client Component (Pattern comune)**:

    ```tsx
    // app/page.tsx (Server Component)
    import Counter from '@/components/Counter'; // Un Client Component

    export default function Page() {
      // Logica server-side
      return (
        <div>
          <h1>Benvenuto</h1>
          <Counter /> {/* L'interattività è isolata qui */}
        </div>
      );
    }
    ```

*   **Client Component che riceve un Server Component come `children` (Pattern "Server-in-Client")**:
    Non puoi importare un Server Component in un Client Component. Tuttavia, puoi passare un Server Component come prop (`children`) a un Client Component.

    ```tsx
    // components/ClientWrapper.tsx
    "use client";
    import { useState } from 'react';

    export default function ClientWrapper({ children }: { children: React.ReactNode }) {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
          {isOpen && children} {/* 'children' è un Server Component renderizzato sul server */}
        </div>
      );
    }
    ```

    ```tsx
    // app/page.tsx (Server Component)
    import ClientWrapper from '@/components/ClientWrapper';
    import ServerInfo from '@/components/ServerInfo'; // Un Server Component

    export default function Page() {
      return (
        <ClientWrapper>
          <ServerInfo /> {/* Passiamo un Server Component come figlio */}
        </ClientWrapper>
      );
    }
    ```

### Nuove Sezioni Aggiunte (Espansione):

#### 3. Quando usare l'uno o l'altro? (Tabella Decisionale)

| Se il tuo componente ha bisogno di... | Usa un... | Esempio |
| :--- | :--- | :--- |
| Fetchare dati | **Server Component** | `async function Page() { const data = await fetch(...) }` |
| Accedere al backend (DB, filesystem) | **Server Component** | `import { db } from '@/lib/db'` |
| Gestire dati sensibili (API keys) | **Server Component** | `const apiKey = process.env.API_KEY` |
| Usare `useState`, `useEffect`, `useReducer` | **Client Component** | `const [count, setCount] = useState(0)` |
| Gestire eventi (`onClick`, `onChange`) | **Client Component** | `<button onClick={...}>` |
| Usare API del browser (`window`, `localStorage`) | **Client Component** | `localStorage.getItem('theme')` |
| Usare custom hooks che dipendono da state o effetti | **Client Component** | `const data = useSWR(...)` |
| Usare Context Provider | **Client Component** | `<ThemeContext.Provider value={theme}>` |

#### 4. Context Providers
I Context Provider sono tipicamente legati allo stato e quindi devono risiedere in un Client Component.

**Best Practice**: Crea un componente provider separato con `"use client"` e usalo per avvolgere i Server Components nel tuo layout, mantenendo il layout stesso un Server Component.

```tsx
// providers/ThemeProvider.tsx
"use client";
import { createContext, useState } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
```

```tsx
// app/layout.tsx (Server Component)
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children} {/* children possono essere Server Components */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 5. Librerie di Terze Parti
Molte librerie NPM, specialmente quelle per l'UI (slider, grafici), usano `useState` o `useEffect` e richiedono di essere usate all'interno di un Client Component.

**Come gestirle**:
1.  Crea un componente wrapper con `"use client"`.
2.  Importa e usa la libreria di terze parti all'interno di questo wrapper.
3.  Usa il tuo componente wrapper nel resto dell'applicazione.

```tsx
// components/MyChart.tsx
"use client";
import { Line } from 'react-chartjs-2'; // Esempio di libreria client-side

export default function MyChart({ data }) {
  return <Line data={data} />;
}
```

---
---

## 📁 08-image-font-optimization.md (Priorità MEDIA)

### Contenuto dal Documento Originale:

#### 1. Image Optimization con `next/image`
Next.js include un componente `<Image>` che ottimizza automaticamente le immagini per migliorare le performance e i Core Web Vitals.

*   **Caratteristiche Principali**:
    *   🖼️ **Lazy Loading**: Le immagini vengono caricate solo quando entrano nel viewport.
    *   📐 **Responsive Images**: Genera automaticamente `srcset` per diverse dimensioni di schermo.
    *   🎨 **Formati Moderni**: Converte le immagini in formati come WebP o AVIF se il browser li supporta.
    *   🔄 **Placeholder**: Mostra un placeholder sfocato (`blur`) durante il caricamento.
    *   ⚡ **Prevenzione Layout Shift (CLS)**: Richiede `width` e `height` per riservare lo spazio corretto.

*   **Utilizzo Base**:

    ```tsx
    import Image from 'next/image';

    function MyImage() {
      return (
        <Image
          src="/images/profile.jpg" // Percorso da /public
          alt="Una foto profilo"
          width={500}
          height={500}
        />
      );
    }
    ```

*   **Immagini Esterne**: Per usare immagini da domini esterni, configurali in `next.config.js`.

    ```js
    // next.config.js
    module.exports = {
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'assets.example.com',
          },
        ],
      },
    };
    ```

*   **`fill` e `sizes` per Immagini Responsive**:
    *   `fill`: Fa sì che l'immagine riempia il suo contenitore parente (che deve avere `position: relative`).
    *   `sizes`: Informa il browser su quale dimensione dell'immagine caricare in base ai breakpoint del viewport, ottimizzando il download.

    ```tsx
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src="/hero.jpg"
        alt="Hero image"
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
    ```

*   **`priority`**: Aggiungi l'attributo `priority` alle immagini "above-the-fold" (visibili senza scroll) per caricarle immediatamente e migliorare il Largest Contentful Paint (LCP).

*   **Placeholder `blur`**:
    Per le immagini locali staticamente importate, Next.js genera automaticamente il `blurDataURL`.

    ```tsx
    import profilePic from '../public/me.png';

    <Image
      src={profilePic}
      alt="Profile picture"
      placeholder="blur" // Automatico per import statici
    />
    ```

#### 2. Font Optimization con `next/font`
Il modulo `next/font` ottimizza i font auto-ospitandoli, eliminando richieste di rete esterne e prevenendo il layout shift.

*   **Caratteristiche Principali**:
    *   📦 **Self-hosting Automatico**: Scarica i Google Fonts in fase di build e li serve dalla tua applicazione.
    *   ⚡ **Zero Layout Shift**: Calcola metriche di fallback per minimizzare il CLS.
    *   🔒 **Privacy**: Nessuna richiesta a Google in runtime.

*   **Google Fonts**:

    ```tsx
    // app/layout.tsx
    import { Inter, Lusitana } from 'next/font/google';

    const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
    const lusitana = Lusitana({ weight: ['400', '700'], subsets: ['latin'] });

    export default function RootLayout({ children }) {
      return (
        <html lang="en" className={inter.variable}>
          <body className={lusitana.className}>{children}</body>
        </html>
      );
    }
    ```
    *   **`className`**: Applica direttamente la classe del font.
    *   **`variable`**: Usa una variabile CSS per una maggiore flessibilità (es. con Tailwind CSS).

*   **Local Fonts**:

    ```tsx
    // app/layout.tsx
    import localFont from 'next/font/local';

    const myFont = localFont({
      src: '../public/fonts/MyFont-Regular.woff2',
      display: 'swap',
    });

    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body className={myFont.className}>{children}</body>
        </html>
      );
    }
    ```

*   **Best Practices**:
    *   **Usa Variable Fonts**: Offrono tutti i pesi in un unico file, riducendo le richieste.
    *   **Carica solo i pesi e i subset necessari**: `weight: ['400', '700']`, `subsets: ['latin']`.
    *   **Usa `display: 'swap'`**: Mostra un font di fallback mentre il font personalizzato viene caricato, migliorando la performance percepita.

---
---

## 📁 05-metadata-seo.md (Priorità STANDARD)

### Contenuto dal Documento Originale:

#### 1. Metadata API - SEO e Meta Tags
Next.js 16 offre una potente Metadata API per definire i metadati (`<title>`, `<meta>`, etc.) sia in modo statico che dinamico.

*   **Approcci**:
    1.  **Config-based**: Esporta un oggetto `metadata` o una funzione `generateMetadata`.
    2.  **File-based**: Aggiungi file speciali come `favicon.ico`, `sitemap.xml`, `robots.txt`.

#### 2. Metadata Statico
Per metadati che non cambiano, esporta un oggetto `metadata` da un file `layout.tsx` o `page.tsx`.

```tsx
// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Scopri di più sulla nostra azienda.',
  openGraph: {
    title: 'About Us',
    images: ['/og-image-about.jpg'],
  },
};
```

#### 3. Metadata Dinamico con `generateMetadata`
Per metadati che dipendono da parametri di route o dati esterni, usa la funzione asincrona `generateMetadata`.

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(res => res.json());

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.coverImage],
    },
  };
}
```

*   **Evitare Fetch Duplicati**: Se devi fetchare gli stessi dati sia in `generateMetadata` che nel componente della pagina, wrappa la funzione di fetch con `cache()` di React per memoizzarla.

#### 4. Template per i Titoli
Definisci un template per i titoli nel layout radice per mantenere la coerenza.

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Il Mio Sito', // %s sarà sostituito dal titolo della pagina
    default: 'Il Mio Sito', // Titolo di default
  },
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About', // Risultato: "About | Il Mio Sito"
};
```

#### 5. Metadata Basati su File
Next.js riconosce automaticamente file speciali per i metadati:
*   `app/favicon.ico`: Favicon.
*   `app/opengraph-image.jpg`: Immagine Open Graph di default.
*   `app/robots.ts`: Per generare `robots.txt`.
*   `app/sitemap.ts`: Per generare `sitemap.xml` dinamicamente.
*   `app/manifest.ts`: Per generare `manifest.json` (PWA).

**Esempio di `sitemap.ts` dinamico**:
```ts
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());

  const postEntries = posts.map(post => ({
    url: `https://yoursite.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));

  return [
    { url: 'https://yoursite.com', lastModified: new Date() },
    ...postEntries,
  ];
}
```

#### 6. Best Practices per SEO
*   **Titoli e Descrizioni**: Mantieni i titoli tra 50-60 caratteri e le descrizioni tra 150-160.
*   **Struttura Gerarchica**: Definisci metadati di default nel layout radice e specializzali nelle pagine o nei layout annidati.
*   **Canonical URLs**: Usa `metadata.alternates.canonical` per specificare l'URL canonico di una pagina e prevenire contenuti duplicati.
*   **Robots e Indexing**: Usa `metadata.robots` per controllare come i motori di ricerca indicizzano le tue pagine.

    ```tsx
    // Per pagine private o in sviluppo
    export const metadata: Metadata = {
      robots: {
        index: false,
        follow: false,
      },
    };
    ```

---
---

## 📁 06-authentication-clerk.md (Priorità STANDARD)

### Contenuto dal Documento Originale:

#### 1. Autenticazione con Clerk
Clerk è una soluzione completa per l'autenticazione e la gestione degli utenti che si integra perfettamente con Next.js.

*   **Setup Iniziale**:
    1.  Crea un account su **clerk.com**.
    2.  Crea una nuova applicazione nel dashboard di Clerk.
    3.  Installa il pacchetto: `npm install @clerk/nextjs`.
    4.  Aggiungi le chiavi API al tuo file `.env.local`:
        ```
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
        CLERK_SECRET_KEY=sk_...
        ```

*   **Protezione delle Route con `proxy.ts`**:
    Usa `clerkMiddleware` nel tuo file `proxy.ts` (ex `middleware.ts`) per proteggere le route.

    ```ts
    // src/proxy.ts
    import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

    const isProtectedRoute = createRouteMatcher([
      '/dashboard(.*)', // Protegge tutte le route sotto /dashboard
      '/profile',
    ]);

    export default clerkMiddleware((auth, req) => {
      if (isProtectedRoute(req)) {
        auth.protect(); // Se non autenticato, reindirizza alla pagina di sign-in
      }
    });

    export const config = {
      matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
    };
    ```

*   **`ClerkProvider`**:
    Avvolgi la tua applicazione con `ClerkProvider` nel layout radice per fornire il contesto di autenticazione.

    ```tsx
    // app/layout.tsx
    import { ClerkProvider } from '@clerk/nextjs';

    export default function RootLayout({ children }) {
      return (
        <ClerkProvider>
          <html lang="en">
            <body>{children}</body>
          </html>
        </ClerkProvider>
      );
    }
    ```

*   **Componenti UI di Clerk**:
    Clerk fornisce componenti pronti all'uso per l'UI di autenticazione.

    ```tsx
    // components/Header.tsx
    "use client";
    import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

    export default function Header() {
      return (
        <header>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </header>
      );
    }
    ```
    *   `<SignedIn>`: Mostra i suoi figli solo se l'utente è autenticato.
    *   `<SignedOut>`: Mostra i suoi figli solo se l'utente non è autenticato.
    *   `<UserButton>`: Mostra l'avatar dell'utente con un menu a tendina (profilo, sign out).
    *   `<SignInButton>`: Mostra un bottone che apre il modale di sign-in.

*   **Accesso ai Dati Utente**:
    *   **In Server Components, Route Handlers, Server Actions**: Usa `auth()` e `currentUser()` da `@clerk/nextjs/server`.

        ```tsx
        // app/dashboard/page.tsx (Server Component)
        import { auth, currentUser } from '@clerk/nextjs/server';
        import { redirect } from 'next/navigation';

        export default async function DashboardPage() {
          const { userId } = auth();
          if (!userId) {
            redirect('/sign-in');
          }
          const user = await currentUser();

          return <h1>Ciao, {user?.firstName}</h1>;
        }
        ```

    *   **In Client Components**: Usa gli hooks `useUser()` e `useAuth()` da `@clerk/nextjs`.

        ```tsx
        // components/UserInfo.tsx (Client Component)
        "use client";
        import { useUser } from "@clerk/nextjs";

        export default function UserInfo() {
          const { isSignedIn, user } = useUser();

          if (!isSignedIn) {
            return null;
          }

          return <p>Email: {user.primaryEmailAddress?.emailAddress}</p>;
        }
        ```

---
---

## 📁 09-environment-variables.md (Priorità STANDARD)

### Contenuto dal Documento Originale:

#### 1. Environment Variables - Best Practices
Next.js ha un supporto integrato per le variabili d'ambiente per gestire configurazioni diverse tra sviluppo e produzione.

*   **Tipi di Variabili d'Ambiente**:
    1.  **Server-side only**: Accessibili solo sul server (Server Components, Route Handlers, Server Actions).
    2.  **Client-side (Public)**: Accessibili sia sul server che nel browser.

*   **File di Environment**:
    Next.js carica le variabili da file `.env*` con un ordine di precedenza specifico.
    1.  `.env.local`: Per variabili locali. **Non committare mai questo file su Git**.
    2.  `.env.development` / `.env.production`: Per variabili specifiche dell'ambiente.
    3.  `.env`: Valori di default (può essere committato).

*   **Variabili Server-Side**:
    Qualsiasi variabile **senza** il prefisso `NEXT_PUBLIC_` è privata e accessibile solo lato server.

    ```bash
    # .env.local
    DATABASE_URL="postgresql://..."
    STRIPE_SECRET_KEY="sk_..."
    ```
    L'accesso avviene tramite `process.env.DATABASE_URL`.

*   **Variabili Client-Side (Public)**:
    Per esporre una variabile al browser, devi prefissarla con `NEXT_PUBLIC_`.

    ```bash
    # .env.local
    NEXT_PUBLIC_API_URL="https://api.example.com"
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-..."
    ```
    **⚠️ ATTENZIONE**: Queste variabili vengono incorporate nel bundle JavaScript inviato al client. **Non inserire mai dati sensibili** (API keys, secret) in variabili `NEXT_PUBLIC_`.

*   **Type Safety con TypeScript**:
    Estendi l'interfaccia `ProcessEnv` di NodeJS per ottenere l'autocompletamento e il type-checking.

    ```ts
    // env.d.ts (nella root del progetto)
    declare namespace NodeJS {
      interface ProcessEnv {
        DATABASE_URL: string;
        NEXT_PUBLIC_API_URL: string;
      }
    }
    ```

*   **Validazione con Zod**:
    È una best practice validare le variabili d'ambiente all'avvio dell'applicazione per evitare errori in runtime.

    ```ts
    // lib/env.ts
    import { z } from 'zod';

    const envSchema = z.object({
      DATABASE_URL: z.string().url(),
      NEXT_PUBLIC_API_URL: z.string().url(),
    });

    // Lancia un errore se le variabili non sono valide o mancanti
    export const env = envSchema.parse(process.env);
    ```

*   **Best Practices Fondamentali**:
    1.  **Mai Committare `.env.local`**: Aggiungilo sempre al tuo `.gitignore`.
    2.  **Usa `NEXT_PUBLIC_` con Cautela**: Solo per dati che possono essere resi pubblici.
    3.  **Valida all'Avvio**: Usa Zod o una libreria simile per garantire che tutte le variabili necessarie siano presenti e corrette.
    4.  **Crea un `.env.example`**: Fornisci un file di esempio (senza i valori segreti) per facilitare il setup ad altri sviluppatori.

---
---

## 📁 10-deployment-production.md (Priorità STANDARD)

### Contenuto dal Documento Originale (Sintetizzato e Espanso):

La guida fornita non contiene una sezione dedicata al deployment, ma le best practices menzionate (come la gestione delle variabili d'ambiente e l'ottimizzazione di immagini/font) sono fondamentali per un'applicazione pronta per la produzione. Di seguito è riportato un modulo che espande questi concetti in un contesto di deployment.

#### 1. Vercel Deployment (Piattaforma Raccomandata)
Vercel, dai creatori di Next.js, è la piattaforma più integrata per il deployment.

*   **Setup**:
    1.  Fai il push del tuo codice su un provider Git (GitHub, GitLab, Bitbucket).
    2.  Importa il progetto nel tuo dashboard Vercel.
    3.  Vercel rileverà automaticamente che è un progetto Next.js e lo configurerà.
*   **Environment Variables**: Aggiungi le tue variabili d'ambiente (es. `DATABASE_URL`, `CLERK_SECRET_KEY`) tramite la dashboard di Vercel in `Settings > Environment Variables`. Puoi impostarle per ambienti specifici (Production, Preview, Development).
*   **Preview Deployments**: Per ogni pull request, Vercel crea un'anteprima del deploy con un URL unico, permettendoti di testare le modifiche prima del merge in produzione.

#### 2. Self-Hosting (Docker)
Per un controllo completo, puoi ospitare la tua applicazione Next.js su un tuo server usando Docker.

*   **Dockerfile di Esempio per Produzione**:

    ```dockerfile
    # Fase 1: Build
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    # Imposta le build-time env vars se necessario
    # ARG NEXT_PUBLIC_API_URL
    # ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
    RUN npm run build

    # Fase 2: Produzione
    FROM node:20-alpine AS runner
    WORKDIR /app
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json

    EXPOSE 3000
    CMD ["npm", "start"]
    ```

#### 3. Performance in Produzione
*   **Analisi del Bundle**: Usa `@next/bundle-analyzer` per visualizzare la dimensione dei bundle JavaScript e identificare le dipendenze più pesanti da ottimizzare.
*   **Caching**: Sfrutta appieno le strategie di caching di Next.js (`"use cache"`, `revalidate`, `tags`) per ridurre i tempi di caricamento e il carico sul database.
*   **Monitoring**: Integra servizi di monitoring come Sentry (per il tracciamento degli errori) e Vercel Analytics o Google Analytics (per l'analisi del traffico) per tenere sotto controllo la salute della tua applicazione.

#### 4. Production Checklist
Prima di andare live, controlla i seguenti punti:
- [ ] **Variabili d'Ambiente**: Tutte le variabili necessarie sono impostate correttamente nell'ambiente di produzione.
- [ ] **Dominio**: Il dominio personalizzato è configurato.
- [ ] **Database**: Il database di produzione è connesso e le migrazioni sono state eseguite.
- [ ] **SEO**: I metadati di base (`title`, `description`), `sitemap.xml` e `robots.txt` sono presenti e corretti.
- [ ] **Performance**: Le immagini critiche usano `priority`, i font sono ottimizzati e il caching è configurato.
- [ ] **Sicurezza**: Non ci sono dati sensibili esposti lato client (controlla le variabili `NEXT_PUBLIC_`).
- [ ] **Error Handling**: Le pagine di errore personalizzate (`error.tsx`, `not-found.tsx`) sono state testate.

---
---

## 📁 11-pattern-library.md (Priorità MEDIA)

Questa sezione contiene una raccolta di snippet di codice pronti all'uso basati sui pattern discussi nella guida completa di Next.js 16.

#### 1. Authentication Patterns (con Clerk)

*   **Pagina Protetta (Server Component)**:

    ```tsx
    // app/dashboard/page.tsx
    import { auth, currentUser } from '@clerk/nextjs/server';
    import { redirect } from 'next/navigation';

    export default async function DashboardPage() {
      const { userId } = auth();
      if (!userId) {
        redirect('/sign-in');
      }
      const user = await currentUser();

      return (
        <div>
          <h1>Dashboard</h1>
          <p>Benvenuto, {user?.firstName}!</p>
        </div>
      );
    }
    ```

*   **Componente Header con Bottoni di Autenticazione**:

    ```tsx
    // components/Header.tsx
    "use client";
    import Link from 'next/link';
    import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

    export function Header() {
      return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
          <Link href="/">Home</Link>
          <div>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </header>
      );
    }
    ```

#### 2. Form Patterns con Server Actions

*   **Form Semplice con Validazione e Stato di Caricamento**:

    ```tsx
    // app/actions/contact.ts
    "use server";
    import { z } from 'zod';

    const schema = z.object({ email: z.string().email() });

    export async function submitContactForm(prevState: any, formData: FormData) {
      const validated = schema.safeParse({ email: formData.get('email') });
      if (!validated.success) {
        return { message: 'Email non valida.' };
      }
      // ... invia email o salva nel DB
      return { message: 'Grazie per averci contattato!' };
    }
    ```

    ```tsx
    // components/ContactForm.tsx
    "use client";
    import { useFormState, useFormStatus } from 'react-dom';
    import { submitContactForm } from '@/app/actions/contact';

    function SubmitButton() {
      const { pending } = useFormStatus();
      return <button type="submit" disabled={pending}>{pending ? 'Invio...' : 'Invia'}</button>;
    }

    export function ContactForm() {
      const [state, formAction] = useFormState(submitContactForm, { message: null });
      return (
        <form action={formAction}>
          <input type="email" name="email" placeholder="La tua email" />
          <SubmitButton />
          {state.message && <p>{state.message}</p>}
        </form>
      );
    }
    ```

#### 3. Data Fetching & Caching Patterns

*   **Pagina con Contenuto Cachato (`"use cache"`)**:

    ```tsx
    // app/blog/[slug]/page.tsx
    "use cache";
    import { cacheLife } from 'next/cache';

    async function getPost(slug: string) {
      const res = await fetch(`https://api.example.com/posts/${slug}`);
      return res.json();
    }

    export default async function PostPage({ params }: { params: { slug: string } }) {
      cacheLife({ revalidate: 3600 }); // Cache per 1 ora
      const post = await getPost(params.slug);
      return <article><h1>{post.title}</h1></article>;
    }
    ```

*   **Componente Dinamico con `Suspense`**:

    ```tsx
    // app/page.tsx
    import { Suspense } from 'react';

    async function LiveData() {
      // Dati dinamici, non cachati
      const res = await fetch('https://api.example.com/live', { cache: 'no-store' });
      const data = await res.json();
      return <div>Dati Live: {data.value}</div>;
    }

    function LiveDataSkeleton() {
      return <div>Caricamento dati live...</div>;
    }

    export default function HomePage() {
      return (
        <Suspense fallback={<LiveDataSkeleton />}>
          <LiveData />
        </Suspense>
      );
    }
    ```

#### 4. Loading & Error Patterns

*   **Skeleton Loader per una Route**:

    ```tsx
    // app/products/loading.tsx
    export default function ProductsLoading() {
      return (
        <div>
          <h1>Prodotti</h1>
          <div className="grid" style={{ /* stili per lo skeleton */ }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      );
    }
    ```

*   **Error Boundary per una Route**:

    ```tsx
    // app/products/error.tsx
    "use client";
    export default function ProductsError({ error, reset }: { error: Error; reset: () => void; }) {
      return (
        <div>
          <h2>Ops! C'è stato un errore nel caricare i prodotti.</h2>
          <button onClick={() => reset()}>Riprova</button>
        </div>
      );
    }
    ```