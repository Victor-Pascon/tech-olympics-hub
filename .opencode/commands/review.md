---
name: review
description: >
  Revisa o código implementado na sessão atual contra SPEC.md, AGENTS.md e PLAN.md.
  Uso: /review
---

Invoque o agent @code-reviewer com o seguinte prompt:

"Revise todo o código implementado nesta sessão.
1. Leia o SPEC.md para entender o que deveria ter sido construído
2. Leia o PLAN.md para entender os critérios de cada task
3. Leia o AGENTS.md para as convenções do projeto
4. Analise o código modificado nesta sessão

Classifique cada issue como BLOQUEANTE, IMPORTANTE ou SUGESTÃO."
