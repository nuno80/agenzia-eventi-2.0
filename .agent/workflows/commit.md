---
description: effettua lint check e il commit a termine di ogni task
---

Esegui i seguenti tre step in ordine, passando allo step successivo solo dopo aver completato con successo il precedente:

Esegui: pnpm check:fix:unsafe

Assicurati che non rimangano errori o warning bloccanti.

Aggiorna il file: @tasks-dashboard.json

Applica tutte le modifiche necessarie e verifica che il file sia valido JSON.

Esegui un commit dettagliato e il push su origin main

Usa un messaggio di commit chiaro e descrittivo.

Concludi con:

git push origin main
