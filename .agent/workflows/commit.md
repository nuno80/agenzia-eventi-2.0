---
description: effettua lint check e il commit a termine di ogni task
---

Esegui i seguenti step in ordine:

// turbo
1. Esegui: `pnpm check:fix:unsafe`

2. Assicurati che non rimangano errori bloccanti

3. Aggiorna `.gemini/project-state/BACKLOG.md` se hai completato task

// turbo
4. Esegui commit con messaggio descrittivo:
   ```bash
   git add .
   git commit -m "feat/fix/chore: descrizione"
   ```

// turbo
5. Push su origin:
   ```bash
   git push origin main
   ```
