#!/usr/bin/env bash
# .opencode/hooks/global/run-tests-after-edit.sh
# Roda testes automaticamente após edição de código
# Estratégia: roda apenas testes relacionados ao arquivo modificado

FILE=$(echo "$INPUT" | jq -r '.tool_input.file // empty' 2>/dev/null)
if [ -z "$FILE" ]; then
  exit 0
fi

# Extrai nome base sem extensão
BASENAME=$(basename "$FILE" | sed 's/\.[^.]*$//')

# Procura arquivo de teste correspondente
TEST_FILE=$(find src -name "${BASENAME}.test.*" -o -name "${BASENAME}.spec.*" 2>/dev/null | head -1)

if [ -n "$TEST_FILE" ]; then
  npx vitest run "$TEST_FILE" --reporter=verbose 2>&1
  if [ $? -ne 0 ]; then
    echo "⚠️ Testes relacionados falharam. Verifique antes de continuar." >&2
  fi
fi
exit 0
