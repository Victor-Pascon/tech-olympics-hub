---
name: implementar
description: >
  Executa uma task do PLAN.md com TDD e review automático ao final.
  Use quando quiser implementar uma task, executar uma fase ou desenvolver
  qualquer item do PLAN.md. Uso: /implementar task 1.1.1 | /implementar fase 1
---

Leia a task solicitada no PLAN.md.

Execute na seguinte sequência obrigatória:
1. Identifique o agent responsável pela task
2. Leia Input, Output e Testes críticos
3. Despache agent para escrever testes primeiro (RED)
4. Confirme que testes falham antes de implementar
5. Despache agent para implementar o mínimo para passar (GREEN)
6. Confirme que testes passam
7. Marque checkbox da task no PLAN.md
8. Invoque @code-reviewer automaticamente
9. Reporte o veredicto
