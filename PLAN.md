# PLAN.md — Tech Olympics Hub

> **Propósito:** Organizar as sprints de implementação com foco em estabilização + novas funcionalidades.
> Todo código implementado deve ter testes escritos ANTES (TDD) e passar por review.

---

## Sprint 1 — Fundação de Testes e Estabilização

**Critério de conclusão:** `npm test` roda e passa com ao menos 5 testes reais implementados.

### Fase 1.1 — Setup de Testes
> Dependências: nenhuma
> Paralelismo: todas as tasks podem rodar em paralelo

#### ✅ Task 1.1.1 — Testes do AuthContext
- **Agent:** frontend-agent
- **Input:** `src/contexts/AuthContext.tsx`, `src/integrations/supabase/client.ts`
- **Output:** `src/contexts/AuthContext.test.tsx`
- **Testes críticos:**
  - [x] Renderiza provider e retorna `null` para `user` quando deslogado
  - [x] `signOut` limpa o estado do usuário

#### ✅ Task 1.1.2 — Testes da página de Cadastro
- **Agent:** frontend-agent
- **Input:** `src/pages/Cadastro.tsx`
- **Output:** `src/pages/Cadastro.test.tsx`
- **Testes críticos:**
  - [x] Renderiza formulário com campos obrigatórios (nome, email, CPF, senha)
  - [x] Validação de CPF inválido exibe mensagem de erro

#### ✅ Task 1.1.3 — Testes de tipo/interface (TypeScript)
- **Agent:** qa-agent
- **Input:** `src/integrations/supabase/types.ts`
- **Output:** `src/test/types.test.ts`
- **Testes críticos:**
  - [x] Verifica que tipos de Database são consistentes
  - [x] Verifica que não há `any` no código fonte

#### ✅ Task 1.1.4 — Testes de utilitários
- **Agent:** backend-agent
- **Input:** `src/lib/utils.ts`
- **Output:** `src/lib/utils.test.ts`
- **Testes críticos:**
  - [x] `cn()` mescla classes corretamente
  - [x] `cn()` trata valores `undefined` sem quebrar

### Fase 1.2 — Correções de Bugs Conhecidos
> Dependências: Fase 1.1 completa
> Paralelismo: tasks podem rodar em paralelo

#### ✅ Task 1.2.1 — Validação de CPF duplicado no cadastro
- **Agent:** backend-agent
- **Input:** `src/pages/Cadastro.tsx`, schema `profiles`
- **Output:** Validação no frontend + feedback visual
- **Testes críticos:**
  - [x] Exibe erro "CPF já cadastrado" ao tentar cadastrar CPF existente
  - [x] Permite cadastro com CPF novo

#### ✅ Task 1.2.2 — Paginação em listas de participantes
- **Agent:** frontend-agent
- **Input:** `src/components/admin/ParticipantsTab.tsx`
- **Output:** Paginação com limite de 20 itens por página
- **Testes críticos:**
  - [x] Exibe apenas 20 participantes por página
  - [x] Botão "Próxima" desabilitado na última página

#### ✅ Task 1.2.3 — Loading states nos dashboards
- **Agent:** frontend-agent
- **Input:** `src/pages/ParticipantDashboard.tsx`, `src/components/admin/DashboardTab.tsx`
- **Output:** Spinners/skeletons durante carregamento de dados
- **Testes críticos:**
  - [x] Exibe skeleton enquanto dados não chegam
  - [x] Substitui skeleton pelo conteúdo após carregamento

---

## Sprint 2 — Fortalecimento de Dados e Migrações

**Critério de conclusão:** Todas as migrations existentes têm `down` function e nova migration criada com sucesso.

### ✅ Fase 2.1 — Revisão de Migrations
> Dependências: Sprint 1 completa
> Paralelismo: Task 2.1.1 e 2.1.2 paralelas

#### ✅ Task 2.1.1 — Adicionar `down` nas migrations existentes
- **Agent:** db-agent
- **Input:** `supabase/migrations/*.sql`
- **Output:** Cada migration com `-- DOWN` block
- **Testes críticos:**
  - [x] Toda migration tem `-- DOWN` correspondente ao `up`
  - [x] Reversão não quebra constraints

#### ✅ Task 2.1.2 — Migração de auditoria
- **Agent:** db-agent
- **Input:** Schema atual (todas as tabelas)
- **Output:** `supabase/migrations/YYYYMMDD_create_audit_log.sql`
- **Testes críticos:**
  - [x] Tabela `audit_log` registra ação, tabela, registro_id, usuario_id, timestamp
  - [x] Trigger nas tabelas admin registra INSERT/UPDATE/DELETE

### ✅ Fase 2.2 — Edge Functions
> Dependências: Fase 2.1 completa
> Paralelismo: nenhuma

#### ✅ Task 2.2.1 — Edge Function de exportação de presenças
- **Agent:** backend-agent
- **Input:** Schema `attendance`
- **Output:** `supabase/functions/export-attendance/index.ts`
- **Testes críticos:**
  - [x] Retorna CSV com cabeçalhos corretos
  - [x] Filtra por intervalo de datas

---

## ✅ Sprint 3 — Novas Funcionalidades

**Critério de conclusão:** Funcionalidade implementada com testes passando e review aprovado.

### ✅ Fase 3.1 — Melhorias no Participante
> Dependências: Sprint 2 completa
> Paralelismo: Task 3.1.1 e 3.1.2 paralelas

#### ✅ Task 3.1.1 — Timeline de histórico do participante
- **Agent:** frontend-agent
- **Input:** `src/pages/ParticipantDashboard.tsx`
- **Output:** Nova aba "Histórico" com timeline de eventos
- **Testes críticos:**
  - [x] Exibe eventos em ordem cronológica decrescente
  - [x] Cada evento mostra tipo (olimpíada/oficina/palestra) e data

#### ✅ Task 3.1.2 — Notificação ao liberar certificado
- **Agent:** backend-agent
- **Input:** Tabelas `olympiads`, `workshops`, `lectures`
- **Output:** Integração com sonner + badge de novo certificado no dashboard
- **Testes críticos:**
  - [x] Badge "Novo certificado" aparece após liberação
  - [x] Badge some após visualização

### ✅ Fase 3.2 — Dashboard Avançado
> Dependências: Fase 3.1 completa
> Paralelismo: nenhuma

#### ✅ Task 3.2.1 — Gráfico de evolução de presenças por mês
- **Agent:** frontend-agent
- **Input:** `src/components/admin/DashboardTab.tsx`
- **Output:** Novo gráfico de linha (Recharts) com evolução mensal
- **Testes críticos:**
  - [x] Exibe 12 meses no eixo X
  - [x] Dados refletem o total de presenças do mês

---

## ✅ Sprint 4 — Infraestrutura e Qualidade

**Critério de conclusão:** Cobertura de testes > 30%, build sem warnings.

### ✅ Fase 4.1 — Testes de Integração
> Dependências: Sprint 3 completa
> Paralelismo: Task 4.1.1 e 4.1.2 paralelas

#### ✅ Task 4.1.1 — Testes de renderização de páginas
- **Agent:** qa-agent
- **Input:** Todas as páginas em `src/pages/`
- **Output:** Testes smoke para cada rota
- **Testes críticos:**
  - [x] Rota `/` renderiza sem erro
  - [x] Rota `/login` renderiza formulário
  - [x] Rota `*` renderiza NotFound

#### ✅ Task 4.1.2 — Testes de componentes admin
- **Agent:** qa-agent
- **Input:** `src/components/admin/*.tsx`
- **Output:** Testes de renderização dos 12 tabs do admin
- **Testes críticos:**
  - [x] Cada tab renderiza sem crash
  - [x] Tabs alternam conteúdo corretamente

### ✅ Fase 4.2 — CI/CD e Linting
> Dependências: Fase 4.1 completa
> Paralelismo: nenhuma

#### ✅ Task 4.2.1 — Script de CI (GitHub Actions)
- **Agent:** backend-agent
- **Input:** `package.json`, `vitest.config.ts`
- **Output:** `.github/workflows/test.yml`
- **Testes críticos:**
  - [x] Roda `npm ci`, `npm run lint`, `npm test`
  - [x] Falha se qualquer etapa falhar

---

## Legenda

| Item | Significado |
|------|-------------|
| **Agent** | Quem executa a task |
| **Input** | O que precisa estar pronto antes |
| **Output** | Artefato gerado |
| **Testes críticos** | Condições que provam que a task está completa |
| **Gates** | Critérios que travam avanço entre fases |

## Estrutura de uma Task no OpenCode
```bash
# Exemplo de execução
# @frontend-agent Implemente a Task 1.1.1 conforme o PLAN.md
#
# Passos:
# 1. Leia Input, Output e Testes críticos
# 2. Escreva os testes PRIMEIRO (fase RED)
# 3. Confirme que os testes falham
# 4. Implemente o mínimo para passar (fase GREEN)
# 5. Confirme que os testes passam
# 6. Marque [x] no PLAN.md
```
