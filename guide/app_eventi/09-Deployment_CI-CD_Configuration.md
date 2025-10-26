# Deployment & CI/CD Configuration

## 1. Applicazione Containerizzata (Next.js)

### `Dockerfile`

Questo `Dockerfile` multi-stage è ottimizzato per un'applicazione Next.js. Crea un'immagine di produzione piccola e sicura, sfruttando la cache di Docker per build veloci.

-   **Stage 1 (dependencies):** Installa solo le dipendenze per creare uno strato separato nella cache. Questo strato cambia solo se `package.json` viene modificato.
-   **Stage 2 (builder):** Esegue il build dell'applicazione (`npm run build`), generando gli artefatti ottimizzati nella cartella `.next`.
-   **Stage 3 (runner):** Crea l'immagine finale partendo da un'immagine Node.js minimale (`alpine`). Copia solo gli artefatti di build necessari e installa unicamente le dipendenze di produzione, riducendo drasticamente la dimensione finale e la superficie di attacco.

```dockerfile
# Stage 1: Installazione delle dipendenze
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build dell'applicazione
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Immagine di produzione finale
FROM node:20-alpine AS runner
WORKDIR /app

# Imposta le variabili d'ambiente per l'esecuzione in produzione
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copia gli artefatti di build dallo stage 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crea un utente non-root per maggiore sicurezza
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Espone la porta su cui l'app Next.js viene eseguita
EXPOSE 3000

# Comando per avviare il server Next.js in produzione
CMD ["node", "server.js"]
```

## 2. Ambiente di Sviluppo Locale

### `docker-compose.yml`

Questo file definisce l'ambiente di sviluppo locale completo. Permette di avviare l'applicazione Next.js e un database PostgreSQL con un solo comando (`docker-compose up`).

-   **Servizio `nextjs-app`:** Costruisce l'immagine Docker usando il `Dockerfile` e monta il codice sorgente locale nel container. Questo abilita il **live reloading**: ogni modifica al codice sul tuo computer si riflette immediatamente nell'applicazione in esecuzione.
-   **Servizio `db`:** Avvia un'istanza di PostgreSQL usando l'immagine ufficiale. I dati vengono salvati in un volume Docker (`postgres-data`) per garantirne la persistenza tra i riavvii.
-   **Sicurezza:** Le credenziali del database e altre variabili d'ambiente sono gestite tramite un file `.env` locale, che non deve mai essere committato su Git.

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Servizio per l'applicazione Next.js
  nextjs-app:
    container_name: event-manager-app
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      # Monta il codice sorgente per il live reloading in sviluppo
      - .:/app
      # Esclude node_modules per usare quelli installati nel container
      - /app/node_modules
    env_file:
      - .env.local # Carica le variabili d'ambiente dal file .env.local
    depends_on:
      - db # Fa in modo che il database si avvii prima dell'app
    restart: unless-stopped
    command: npm run dev

  # Servizio per il database PostgreSQL
  db:
    container_name: event-manager-db
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres-data: # Volume per la persistenza dei dati del database
```

## 3. Pipeline di Continuous Integration & Deployment

### `.github/workflows/deploy.yml`

Questo workflow di GitHub Actions automatizza il processo di test, build e deployment dell'applicazione ogni volta che viene effettuato un push sul branch `main`.

-   **Trigger:** Si attiva su `push` al branch `main`.
-   **Job `test`:** Installa le dipendenze Node.js, esegue il linter per verificare la qualità del codice e lancia i test unitari. Se uno di questi step fallisce, l'intera pipeline si interrompe.
-   **Job `build-and-push`:** Se il job `test` ha successo, questo job costruisce l'immagine Docker e la carica su GitHub Container Registry. Le credenziali sono gestite in modo sicuro tramite i secrets del repository.
-   **Job `deploy`:** Se l'immagine è stata caricata con successo, questo job si connette via SSH al server di produzione (VPS), scarica l'ultima versione dell'immagine e riavvia il servizio usando `docker-compose`, garantendo un deployment a zero downtime.

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # --- JOB 1: TEST ---
  test:
    name: Run Linter and Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

  # --- JOB 2: BUILD AND PUSH DOCKER IMAGE ---
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    needs: test # Eseguito solo se il job 'test' ha successo
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  # --- JOB 3: DEPLOY TO PRODUCTION ---
  deploy:
    name: Deploy to Production VPS
    runs-on: ubuntu-latest
    needs: build-and-push # Eseguito solo se il job 'build-and-push' ha successo

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/your/app/directory
            
            # Login a GitHub Container Registry per fare il pull dell'immagine privata
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Scarica l'ultima versione dell'immagine dall'ambiente docker-compose
            docker-compose pull
            
            # Riavvia i servizi con la nuova immagine, ricreando i container
            docker-compose up -d --force-recreate
            
            # Pulisce le vecchie immagini non utilizzate per liberare spazio
            docker image prune -f
```