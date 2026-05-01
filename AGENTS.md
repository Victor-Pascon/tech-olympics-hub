# AGENTS.md — Tech Olympics Hub

## Stack Atual
- **Frontend:** React 18 + TypeScript 5.8 + Vite 5.4
- **UI:** shadcn/ui + Tailwind CSS 3.4 + tailwindcss-animate
- **Ícones:** lucide-react
- **Roteamento:** react-router-dom v6
- **Estado Servidor:** @tanstack/react-query v5
- **Formulários:** react-hook-form + @hookform/resolvers + zod
- **Gráficos:** recharts
- **Backend:** Supabase (PostgreSQL 15+, Auth, Storage, Edge Functions Deno)
- **ORM/SQL:** SQL direto via @supabase/supabase-js
- **Testes:** Vitest + @testing-library/react + jsdom
- **Notificações:** sonner
- **Data:** date-fns

## Convenções de Nomenclatura
- **Componentes React:** PascalCase (Ex: `ParticipantDashboard.tsx`)
- **Arquivos UI (shadcn):** kebab-case (Ex: `alert-dialog.tsx`)
- **Pastas:** kebab-case (Ex: `integrations/supabase/`)
- **Funções/Variáveis:** camelCase
- **Tabelas no BD:** snake_case (Ex: `olympiad_enrollments`)
- **Colunas no BD:** snake_case
- **Migrações SQL:** `YYYYMMDD_descricao.sql`
- **Testes:** `*.test.ts` ou `*.test.tsx`

## Estrutura de Pastas
```
src/
├── components/
│   ├── admin/       # Tabs do painel admin (12 componentes)
│   ├── ui/          # shadcn/ui (50 componentes)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── MobileTabsMenu.tsx
│   └── NavLink.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── Index.tsx
│   ├── Cadastro.tsx
│   ├── Login.tsx
│   ├── AdminLogin.tsx
│   ├── ParticipantDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── ResetPassword.tsx
│   ├── CertificateValidation.tsx
│   └── NotFound.tsx
├── test/
│   ├── setup.ts
│   └── example.test.ts
├── App.tsx
├── main.tsx
└── index.css

supabase/
├── functions/
│   ├── create-admin-user/index.ts
│   └── reset-user-password/index.ts
└── migrations/       # 13 migrations SQL
```

## Regras de Ouro
1. **Nunca expor IDs numéricos** — UUIDs em toda PK e FK
2. **Toda rota/operação retorna dados no formato do Supabase** — respeitar tipos gerados em `types.ts`
3. **Tabelas têm RLS obrigatório** — políticas row-level security em toda tabela
4. **Nunca commitar .env ou secrets** — usar variáveis VITE_SUPABASE_*
5. **Migrações são imutáveis** — depois de aplicadas, nunca editar; criar nova migration
6. **Toda edge function trata erro com try/catch** — retornar `{ data, error }`
7. **Testes antes de implementar (TDD)** — escrever teste, ver falhar, implementar, ver passar
8. **Nunca misturar planejamento e execução** — sessão de planejamento separada
9. **Toda task no PLAN.md tem testes críticos definidos ANTES do código**
10. **Manter o .opencode/ versionado no git** — faz parte da arquitetura

## Comandos de Setup
```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Lint
npm run lint
```

## Edge Functions (Supabase)
```bash
# Servir localmente
supabase functions serve

# Deploy
supabase functions deploy create-admin-user
supabase functions deploy reset-user-password
```

## O que NUNCA fazer
- Rodar `supabase db push` sem revisão manual
- Usar `SELECT *` em queries Supabase sem especificar colunas
- Hardcodar URLs ou chaves que não sejam as do VITE_SUPABASE_*
- Ignorar erros de TypeScript — tipagem é obrigatória
- Modificar migrations já aplicadas
- Usar `any` no TypeScript — preferir tipos específicos ou `unknown`
- Compartilhar contexto entre agents editando o mesmo arquivo em paralelo
