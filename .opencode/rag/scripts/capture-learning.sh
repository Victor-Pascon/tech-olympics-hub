#!/usr/bin/env bash
# .opencode/rag/scripts/capture-learning.sh
# Captura aprendizado da sessão atual e salva no RAG + knowledge/
# Uso: bash .opencode/rag/scripts/capture-learning.sh <category> <title> <content>

DB_PATH=".opencode/rag/rag.db"
CATEGORY="$1"
TITLE="$2"
CONTENT="$3"

# Tenta inicializar o banco se não existir
if [ ! -f "$DB_PATH" ]; then
  bash .opencode/rag/scripts/init-db.sh
fi

# Salva como arquivo markdown (para versionamento)
DATE=$(date +%Y-%m-%d)
SAFE_TITLE=$(echo "$TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
FILENAME=".opencode/knowledge/${DATE}-${SAFE_TITLE}.md"

cat > "$FILENAME" << KNOWLEDGEEOF
# $(echo "$CATEGORY" | tr '[:lower:]' '[:upper:]' | cut -c1)$(echo "$CATEGORY" | cut -c2-): $TITLE

## Data
$(date '+%d/%m/%Y %H:%M')

## Descrição
$CONTENT
KNOWLEDGEEOF

# Salva no SQLite
if command -v sqlite3 &> /dev/null; then
  ESCAPED_CONTENT=$(echo "$CONTENT" | sed "s/'/''/g")
  ESCAPED_TITLE=$(echo "$TITLE" | sed "s/'/''/g")
  sqlite3 "$DB_PATH" "INSERT INTO knowledge_entries (category, title, content, source_file) VALUES ('$CATEGORY', '$ESCAPED_TITLE', '$ESCAPED_CONTENT', '$FILENAME');"
  echo "Conhecimento salvo em: $FILENAME (RAG + SQLite)"
else
  echo "Conhecimento salvo em: $FILENAME (apenas arquivo — sqlite3 não disponível)"
fi
