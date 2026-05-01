#!/usr/bin/env bash
# .opencode/rag/scripts/init-db.sh
# Inicializa o banco SQLite RAG
# Uso: bash .opencode/rag/scripts/init-db.sh

DB_PATH=".opencode/rag/rag.db"
SCHEMA_PATH=".opencode/rag/schema.sql"

if [ ! -f "$DB_PATH" ]; then
  echo "Inicializando banco RAG em $DB_PATH..."
  sqlite3 "$DB_PATH" < "$SCHEMA_PATH"
  echo "Banco RAG criado com sucesso."
else
  echo "Banco RAG já existe em $DB_PATH."
fi
