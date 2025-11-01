# 1. Crea un database completamente nuovo con nome diverso
DB_NAME="agenzia-eventi-test"
turso db create $NEW_DB_NAME

# 2. Ottieni le sue credenziali
NEW_URL=$(turso db show --url $NEW_DB_NAME)
NEW_TOKEN=$(turso db tokens create $NEW_DB_NAME)

# 3. Aggiorna .env.local
echo "TURSO_CONNECTION_URL=$NEW_URL" >> .env.local
echo "TURSO_AUTH_TOKEN=$NEW_TOKEN" >> .env.local

# 4. Esegui migrazioni sul nuovo database
pnpm db:generate
pnpm db:migrate

# 5. (Opzionale) Distruggi il vecchio database dopo
turso db destroy agenzia-eventi-test-agenziaeventimc
