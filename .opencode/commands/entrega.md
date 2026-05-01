---
name: entrega
description: >
  Prepara relatório de entrega: verifica PLAN.md completo, executa testes finais,
  e gera resumo do que foi implementado. Uso: /entrega
---

Execute na seguinte sequência:
1. Verifique o PLAN.md — todas as tasks da fase/sprint estão marcadas?
2. Execute `npm test` — todos os testes passam?
3. Execute `npm run build` — build sem erros?
4. Execute `npm run lint` — sem warnings?
5. Se algum passo falhar, reporte e não prossiga
6. Se tudo passar, registre aprendizado no RAG
7. Gere relatório final com:
   - O que foi implementado
   - Testes adicionados/alterados
   - Decisões tomadas
   - Próximos passos
