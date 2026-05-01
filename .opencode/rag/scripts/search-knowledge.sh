#!/usr/bin/env bash
# .opencode/rag/scripts/search-knowledge.sh
# Busca conhecimento no banco RAG por termo ou categoria
# Uso: bash .opencode/rag/scripts/search-knowledge.sh [termo] [categoria]

DB_PATH=".opencode/rag/rag.db"
TERMO="$1"
CATEGORIA="$2"

if [ ! -f "$DB_PATH" ]; then
  echo "Banco RAG não encontrado. Execute init-db.sh primeiro."
  exit 1
fi

# Monta query
QUERY="SELECT id, category, title, substr(content, 1, 200) as snippet, created_at FROM knowledge_entries WHERE 1=1"

if [ -n "$TERMO" ]; then
  ESCAPED_TERM=$(echo "$TERMO" | sed "s/'/''/g")
  QUERY="$QUERY AND (title LIKE '%$ESCAPED_TERM%' OR content LIKE '%$ESCAPED_TERM%' OR tags LIKE '%$ESCAPED_TERM%')"
fi

if [ -n "$CATEGORIA" ]; then
  QUERY="$QUERY AND category = '$CATEGORIA'"
fi

QUERY="$QUERY ORDER BY created_at DESC LIMIT 20;"

echo ""
echo "=== Resultados da Busca RAG ==="
sqlite3 -header -column "$DB_PATH" "$QUERY"
echo ""
