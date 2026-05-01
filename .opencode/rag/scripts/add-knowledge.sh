#!/usr/bin/env bash
# .opencode/rag/scripts/add-knowledge.sh
# Adiciona entrada de conhecimento ao banco RAG
# Uso: bash .opencode/rag/scripts/add-knowledge.sh <category> <title> <content> [tags]
# Categorias: bug, decision, pattern, failure

DB_PATH=".opencode/rag/rag.db"
CATEGORY="$1"
TITLE="$2"
CONTENT="$3"
TAGS="${4:-}"

if [ -z "$CATEGORY" ] || [ -z "$TITLE" ] || [ -z "$CONTENT" ]; then
  echo "Uso: add-knowledge.sh <category> <title> <content> [tags]"
  echo "Categorias: bug, decision, pattern, failure"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Banco RAG não encontrado. Execute init-db.sh primeiro."
  exit 1
fi

ESCAPED_CONTENT=$(echo "$CONTENT" | sed "s/'/''/g")
ESCAPED_TITLE=$(echo "$TITLE" | sed "s/'/''/g")

sqlite3 "$DB_PATH" "INSERT INTO knowledge_entries (category, title, content, tags) VALUES ('$CATEGORY', '$ESCAPED_TITLE', '$ESCAPED_CONTENT', '$TAGS');"

echo "Conhecimento adicionado com sucesso na categoria '$CATEGORY'."
