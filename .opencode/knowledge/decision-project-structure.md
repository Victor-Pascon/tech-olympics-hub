# Decision: Estrutura do Projeto Tech Olympics Hub

## Contexto
Projeto Vite + React + TypeScript com Supabase como backend. Originalmente criado via Lovable.dev, depois migrado para desenvolvimento local com OpenCode.

## Stack
- Frontend: React 18 + TypeScript 5.8 + Vite 5.4 + shadcn/ui + Tailwind
- Backend: Supabase (PostgreSQL 15+, Auth, Storage, Edge Functions)
- Testes: Vitest + @testing-library/react
- Roteamento: react-router-dom v6
- Estado server: @tanstack/react-query v5

## Decisões
- UUIDs em todas as PK/FK (nunca serial/integer)
- RLS policies em todas as tabelas
- CPF com validação no frontend via biblioteca
- CEP com busca automática via API ViaCEP
- Certificados com template customizável + código de validação único
- Tema escuro cyberpunk com verde/cyan

## Estrutura
- `src/pages/` — páginas/rotas da aplicação
- `src/components/admin/` — tabs do painel admin
- `src/components/ui/` — shadcn/ui components
- `src/integrations/supabase/` — cliente e tipos Supabase
- `supabase/migrations/` — migrations SQL versionadas
- `supabase/functions/` — Edge Functions Deno
