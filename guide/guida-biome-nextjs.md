# Guida Completa: Configurare Biome con Next.js

Guida dettagliata per configurare Biome come linter e formatter in un progetto Next.js con **pnpm**, basata sulla documentazione ufficiale.

## Indice

1. [Cos'è Biome](#cosè-biome)
2. [Installazione](#installazione)
3. [Configurazione Base](#configurazione-base)
4. [Integrazione con Next.js](#integrazione-con-nextjs)
5. [Configurazione VS Code](#configurazione-vs-code)
6. [Script NPM](#script-npm)
7. [Configurazione Avanzata](#configurazione-avanzata)
8. [Continuous Integration](#continuous-integration)
9. [Migrazione da ESLint/Prettier](#migrazione-da-eslintprettier)

---

## Cos'è Biome

Biome è un toolchain moderno per JavaScript e TypeScript che combina:
- **Linter**: analisi statica del codice
- **Formatter**: formattazione automatica
- **Import Organizer**: ordinamento degli import

Scritto in Rust, è 10-20x più veloce di ESLint+Prettier e richiede zero configurazione per iniziare.

---

## Installazione

### 1. Crea un nuovo progetto Next.js (opzionale)

Se stai creando un nuovo progetto, puoi scegliere Biome direttamente durante la creazione:

```bash
npx create-next-app@latest
```

**Nota**: A partire da Next.js 15.5, puoi selezionare Biome come linter durante la creazione del progetto.

### 2. Installa Biome in un progetto esistente

```bash
# NPM
npm install --save-dev --save-exact @biomejs/biome

# PNPM
pnpm add --save-dev --save-exact @biomejs/biome

# Yarn
yarn add --dev --exact @biomejs/biome

# Bun
bun add --dev --exact @biomejs/biome
```

> **Importante**: Usa sempre `--save-exact` (`-E`) per evitare problemi di compatibilità tra versioni.

### 3. Inizializza la configurazione

```bash
# NPM
npx @biomejs/biome init

# PNPM
pnpm exec biome init

# Yarn
yarn exec biome init

# Bun
bunx --bun biome init
```

Questo comando crea un file `biome.json` nella root del progetto.

---

## Configurazione Base

Il file `biome.json` generato avrà questa struttura base:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": false,
    "clientKind": "git",
    "useIgnoreFile": false
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": []
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space"
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```

### Configurazione raccomandata per Next.js

Ecco una configurazione ottimizzata per progetti Next.js con TypeScript:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/.cache/**",
      "**/node_modules/**"
    ]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "useFilenamingConvention": {
          "level": "warn",
          "options": {
            "filenameCases": ["kebab-case", "PascalCase"],
            "strictCase": false,
            "requireAscii": true
          }
        }
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "trailingCommas": "es5",
      "semicolons": "asNeeded",
      "arrowParentheses": "always",
      "quoteProperties": "asNeeded"
    }
  }
}
```

---

## Integrazione con Next.js

### Disabilitare next lint (Next.js 15.4 e precedenti)

Se usi Next.js < 15.5, devi disabilitare `next lint` nel file `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disabilita ESLint durante il build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
```

### Next.js 15.5+ (Supporto Nativo)

A partire da Next.js 15.5, `next lint` è deprecato e Biome è supportato nativamente. Gli script vengono generati automaticamente durante `create-next-app`.

---

## Configurazione VS Code

### 1. Installa l'estensione Biome

Cerca "Biome" nel marketplace delle estensioni di VS Code o installala da qui:
- **ID Estensione**: `biomejs.biome`
- **Link**: [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

### 2. Configura VS Code per il progetto

Crea o modifica `.vscode/settings.json` nella root del progetto:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

### 3. Configura EditorConfig (opzionale)

Biome rispetta le impostazioni di `.editorconfig`. Esempio:

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## Script NPM

Aggiungi questi script al tuo `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    "check": "biome check .",
    "check:fix": "biome check --write .",
    "ci": "biome ci ."
  }
}
```

### Spiegazione dei comandi

- **`format --write`**: Formatta tutti i file e salva le modifiche
- **`format`**: Controlla la formattazione senza modificare i file
- **`lint --write`**: Esegue il linting e applica le correzioni sicure
- **`lint`**: Esegue solo il controllo del linting
- **`check --write`**: Formatta, linta e organizza gli import (comando completo)
- **`check`**: Come `check --write` ma senza salvare le modifiche
- **`ci`**: Ottimizzato per CI/CD, fallisce se trova errori

### Uso pratico

```bash
# Durante lo sviluppo - correggi tutto
npm run check:fix

# Prima del commit - solo controlli
npm run check

# Solo formattazione
npm run format

# Solo linting
npm run lint:fix
```

---

## Configurazione Avanzata

### Ignorare file specifici

Oltre a `files.ignore` nel `biome.json`, puoi usare commenti inline:

```javascript
// biome-ignore lint/suspicious/noExplicitAny: necessario per questo caso
const data: any = fetchData();
```

Oppure ignorare un intero file:

```javascript
// biome-ignore-file
```

### Configurazione per linguaggio specifico

```json
{
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "json": {
    "formatter": {
      "enabled": true,
      "indentWidth": 4
    }
  },
  "typescript": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```

### Regole di linting personalizzate

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "error",
        "useFlatMap": "warn"
      },
      "style": {
        "noNegationElse": "off",
        "useTemplate": "warn"
      },
      "suspicious": {
        "noArrayIndexKey": "error",
        "noExplicitAny": "warn"
      },
      "a11y": {
        "noAccessKey": "error",
        "useAltText": "error"
      }
    }
  }
}
```

### Organizzazione import

```json
{
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "rules": {
      "nursery": {
        "useSortedKeys": {
          "level": "warn",
          "options": {}
        }
      }
    }
  }
}
```

---

## 🤖 Flusso Ottimale Pre-Commit con Codice Generato da LLM

Quando usi un LLM per generare codice, è fondamentale avere un processo di validazione robusto. Ecco il flusso consigliato:

### 1️⃣ Prima Validazione Immediata (dopo generazione)

```bash
# Controlla TUTTO senza modificare nulla
npm run check

# Oppure più dettagliato per vedere ogni categoria
npm run format:check  # Solo formattazione
npm run lint          # Solo linting
npx tsc --noEmit      # Type checking
```

**Perché**: Ti dà una panoramica completa di cosa va sistemato prima di applicare modifiche automatiche.

**Output da controllare**:
- Quanti errori ci sono?
- Sono safe o unsafe fixes?
- Ci sono errori di tipo TypeScript?

### 2️⃣ Applicazione Fix Automatici (Solo Safe)

```bash
# Applica SOLO correzioni sicure
npm run check:fix

# Equivalente a:
# biome check --write .
```

**⚠️ CRITICO**: Questo applica SOLO i "safe fixes". Gli "unsafe fixes" richiedono esplicitamente il flag `--unsafe`.

**Cosa viene applicato**:
- ✅ Formattazione (indentazione, quotes, semicoloni)
- ✅ Organizzazione import
- ✅ Fix sicuri (es. `let` → `const` per variabili immutabili)

**Cosa NON viene applicato**:
- ❌ Unsafe fixes (es. rimozione variabili inutilizzate)
- ❌ Fix che potrebbero cambiare la logica
- ❌ Correzioni di tipo TypeScript

### 2️⃣-bis Applicazione Unsafe Fixes (Solo se necessario)

```bash
# ⚠️ USA CON CAUTELA!
biome check --write --unsafe .
```

**Quando usarlo**:
- Durante la migrazione iniziale da ESLint/Prettier
- Quando hai verificato manualmente che i fix sono appropriati
- MAI su codice LLM non ancora revisionato!

Esempio reale: "Ho eseguito i fix unsafe su tutto il codebase, poi ho verificato tutto manualmente e dove non erano appropriati li ho revertiti".

### 3️⃣ Revisione Manuale del Codice

**CRITICO quando usi LLM**: Non fidarti ciecamente delle correzioni automatiche!

```bash
# Usa git diff per vedere TUTTE le modifiche
git diff

# Oppure usa uno strumento visual
git difftool
```

**Checklist Revisione Codice LLM**:
- ✅ La logica è corretta?
- ✅ Gestisce gli edge case?
- ✅ Ci sono errori di tipo/null safety?
- ✅ Le API calls sono corrette?
- ✅ I nomi delle variabili hanno senso nel contesto?
- ✅ Non ci sono hardcoded credentials o dati sensibili?
- ✅ Il codice è testabile?

### 4️⃣ Test (Essenziale!)

```bash
# Esegui i test esistenti
npm test

# Build di produzione per verificare compatibilità
npm run build

# Type checking separato (se usi TypeScript)
npx tsc --noEmit
```

**Importante**: Biome non sostituisce TypeScript! Continua a usare `tsc` per il type checking completo.

### 5️⃣ Validazione Pre-Commit Automatica

Usa **Husky** o **Lefthook** per automatizzare:

#### Setup Husky + lint-staged (Consigliato)

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

**Vantaggio**: Controlla SOLO i file modificati, molto più veloce!

### 6️⃣ Validazione CI/CD

Nel CI, usa sempre il comando `ci` ottimizzato:

```yaml
# .github/workflows/ci.yml
- name: Run Biome
  run: npm run ci

- name: Type Check
  run: npx tsc --noEmit

- name: Tests
  run: npm test

- name: Build
  run: npm run build
```

### 🎯 Flusso Completo Ottimale

```bash
# === DOPO che l'LLM ha generato codice ===

# 1. CONTROLLO COMPLETO (senza modifiche)
npm run check                    # Biome check
npx tsc --noEmit                 # TypeScript check
# 📊 Leggi l'output! Quanti errori? Safe o unsafe?

# 2. APPLICAZIONE SAFE FIXES
npm run check:fix                # Solo fix sicuri
# ⚠️ NON applica unsafe fixes!

# 3. REVISIONE MANUALE OBBLIGATORIA
git diff
# 🔍 Verifica OGNI modifica riga per riga
# - La logica è corretta?
# - I fix hanno senso?
# - Qualcosa è cambiato in modo inaspettato?

# 4. TYPE CHECK (se usi TypeScript)
npx tsc --noEmit
# Biome NON fa type checking completo!

# 5. TEST
npm test                         # Unit tests
npm run build                    # Build di produzione
# Verifica che tutto compila e funziona

# 6. UNSAFE FIXES (opzionale, solo se sei sicuro)
# biome check --write --unsafe .
# ⚠️ Solo dopo aver verificato manualmente!

# 7. COMMIT
git add .
git commit -m "feat: descrizione"
# Se usi Husky, lint-staged si esegue automaticamente
```

### ⚠️ Errori Comuni con Codice LLM

1. **Usare solo `check:fix` senza type checking**
   ```bash
   # ❌ SBAGLIATO - Biome non fa type checking completo!
   npm run check:fix && git commit
   
   # ✅ CORRETTO
   npm run check:fix && npx tsc --noEmit && npm test && git commit
   ```

2. **Non testare il codice generato**
   - Gli LLM possono generare codice sintatticamente corretto ma logicamente sbagliato
   - SEMPRE scrivere/eseguire test per codice critico

3. **Applicare `--unsafe` senza capire**
   ```bash
   # ❌ MAI fare questo alla cieca su codice LLM!
   biome check --write --unsafe
   
   # ✅ Prima controlla cosa farebbe
   biome check --diagnostic-level=error
   # Poi applica solo se appropriato
   ```

4. **Non leggere il diff prima del commit**
   - Biome può suggerire refactoring che cambiano la logica
   - `git diff` è OBBLIGATORIO, non opzionale

5. **Dimenticare che safe ≠ sempre corretto**
   - "Safe" significa "non cambia semantica" secondo Biome
   - Ma su codice LLM potrebbe comunque non essere quello che vuoi
   - Esempio: formattare in modo diverso da come volevi

6. **Ignorare warning come "unsafe fixes available"**
   - Biome ti avvisa se ci sono fix unsafe disponibili
   - Non ignorarli, decidere consapevolmente se applicarli

### 💡 Esempio Pratico Real-World

Scenario: L'LLM ha generato un componente React

```bash
# 1. Controllo iniziale
$ npm run check
# Output: ⚠️ 15 warnings, 3 errors
# - noUnusedVariables: 5 unsafe fixes available
# - noExplicitAny: 3 errors
# - Formatting: 7 warnings (safe fixes available)

# 2. Applico SOLO safe fixes
$ npm run check:fix
# ✅ 7 formatting fixes applied
# ⚠️ 8 issues remaining (require manual review or --unsafe)

# 3. Type check
$ npx tsc --noEmit
# ❌ Error: Type 'string' is not assignable to type 'number'
# 👀 L'LLM ha sbagliato un tipo!

# 4. Correggo manualmente l'errore di tipo
# (edit del file)

# 5. Rivedo gli unsafe fixes
$ biome check --diagnostic-level=warn
# Leggo attentamente ogni variabile "unused"
# Decido quali sono davvero inutilizzate

# 6. Applico unsafe (opzionale, solo se appropriato)
$ biome check --write --unsafe
# O meglio ancora, rimuovo manualmente le variabili

# 7. Test finale
$ npm test && npm run build
# ✅ All tests pass, build successful

# 8. Commit
$ git add . && git commit -m "feat: add user profile component"
```

### 🔧 Script Personalizzato per LLM

Aggiungi al `package.json` questi script ottimizzati:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "format": "biome format --write .",
    "format:check": "biome format .",
    
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    
    "check": "biome check .",
    "check:fix": "biome check --write .",
    
    "ci": "biome ci .",
    
    "type-check": "tsc --noEmit",
    
    "llm:validate": "npm run check && npm run type-check && npm test",
    "llm:fix": "npm run check:fix && npm run type-check",
    "llm:safe": "npm run check && git diff --quiet || (echo '⚠️  Files modified! Review changes with: git diff' && exit 1)",
    "llm:full": "npm run check:fix && npm run type-check && npm test && npm run build",
    
    "precommit": "npm run check:fix && npm run type-check"
  }
}
```

### Spiegazione Script LLM

**`llm:validate`** - Controllo completo senza modifiche
```bash
npm run llm:validate
# Esegue: check + type-check + test
# Usa PRIMA di applicare fix
```

**`llm:fix`** - Applica safe fixes + verifica tipi
```bash
npm run llm:fix
# Esegue: check:fix + type-check
# Applica fix sicuri e verifica TypeScript
```

**`llm:safe`** - Verifica che non ci siano modifiche non committate
```bash
npm run llm:safe
# Fallisce se ci sono file modificati
# Utile in CI per verificare che tutto sia committed
```

**`llm:full`** - Validazione completa (usa prima del commit)
```bash
npm run llm:full
# Esegue: fix + type-check + test + build
# Pipeline completa, usa prima del commit finale
```

### 📊 Tool Aggiuntivi Consigliati

1. **TypeScript strict mode** - `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitReturns": true
     }
   }
   ```

2. **Dependency Cruiser** - per verificare dipendenze circolari:
   ```bash
   npm install --save-dev dependency-cruiser
   ```

3. **Knip** - per trovare codice inutilizzato:
   ```bash
   npm install --save-dev knip
   ```

### 💡 Best Practice Finale

**Regola d'oro**: Tratta il codice generato da LLM come codice scritto da un junior developer molto produttivo ma che fa errori di logica. Necessita sempre di:
- ✅ Code review approfondita
- ✅ Test coverage adeguato
- ✅ Validazione runtime
- ✅ Type checking completo

**Non automatizzare ciecamente `--unsafe` o `-write` senza review manuale!**

---

## Continuous Integration

### Configurazione per GitHub Actions

Crea `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  biome:
    name: Biome Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Biome
        run: npm run ci
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
biome:
  image: node:20-alpine
  stage: test
  script:
    - npm ci
    - npm run ci
  cache:
    paths:
      - node_modules/
```

### Pre-commit hook con Husky

```bash
# Installa Husky
npm install --save-dev husky
npx husky init

# Crea hook pre-commit
echo "npm run check:fix" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Pre-commit hook con Lefthook

```bash
# Installa Lefthook
npm install --save-dev @evilmartians/lefthook
```

Crea `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      run: npm run lint:fix
    format:
      run: npm run format

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

---

## Migrazione da ESLint/Prettier

### 1. Rimuovi dipendenze vecchie

```bash
npm uninstall eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 2. Rimuovi file di configurazione

Elimina questi file se presenti:
- `.eslintrc.js` / `.eslintrc.json`
- `.prettierrc` / `.prettierrc.js`
- `.prettierignore`

### 3. Aggiorna VS Code settings

Rimuovi o commenta le vecchie configurazioni ESLint/Prettier in `.vscode/settings.json`:

```json
{
  // ❌ Rimuovi queste righe
  // "editor.defaultFormatter": "esbenp.prettier-vscode",
  // "eslint.validate": ["javascript", "typescript"],
  
  // ✅ Aggiungi Biome
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

### 4. Converti regole ESLint in Biome

Biome include già la maggior parte delle regole ESLint popolari. Consulta la [documentazione delle regole](https://biomejs.dev/linter/rules/) per la mappatura completa.

### 5. Test della migrazione

```bash
# Controlla tutti i file
npm run check

# Applica correzioni automatiche
npm run check:fix
```

---

## Troubleshooting

### Biome non formatta al salvataggio

1. Verifica che l'estensione Biome sia installata e attiva
2. Controlla che `biome.json` sia nella root del progetto
3. Verifica `.vscode/settings.json` per conflitti con altri formatter
4. Riavvia VS Code

### Errore "Could not find Biome in your dependencies"

Soluzione:

```json
// .vscode/settings.json
{
  "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome"
}
```

### Conflitti con file generati

Aggiungi le cartelle al file `biome.json`:

```json
{
  "files": {
    "ignore": [
      "node_modules",
      ".next",
      "out",
      "dist",
      "build",
      ".contentlayer",
      ".turbo"
    ]
  }
}
```

---

## Risorse Utili

- [Documentazione Ufficiale Biome](https://biomejs.dev/)
- [Getting Started Guide](https://biomejs.dev/guides/getting-started/)
- [Configurazione Biome](https://biomejs.dev/guides/configure-biome/)
- [Regole del Linter](https://biomejs.dev/linter/rules/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Playground Online](https://biomejs.dev/playground/)

---

## Conclusione

Biome offre un'esperienza di sviluppo più semplice e veloce rispetto alla combinazione ESLint+Prettier. Con questa guida dovresti essere in grado di configurarlo completamente nel tuo progetto Next.js.

**Pro tip**: Usa sempre `npm run check:fix` prima di fare commit per mantenere il codice pulito e consistente! 🚀