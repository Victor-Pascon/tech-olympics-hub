#!/usr/bin/env bash
# .opencode/hooks/global/block-env-read.sh
# Bloqueia leitura de arquivos .env
FILE=$(echo "$INPUT" | jq -r '.tool_input.file // empty' 2>/dev/null)
if echo "$FILE" | grep -qiE "\.env"; then
  echo "Arquivo .env protegido — não pode ser lido" >&2
  exit 2
fi
exit 0
