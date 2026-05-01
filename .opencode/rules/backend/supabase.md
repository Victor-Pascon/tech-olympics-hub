---
paths:
  - "supabase/migrations/**/*.sql"
  - "supabase/functions/**/*.ts"
---

# Regras de Supabase/BD

- Toda migration deve ter blocks `-- UP` e `-- DOWN`
- Tabelas novas sempre com `enable row level security`
- Tabelas novas sempre com `id uuid primary key default gen_random_uuid()`
- Edge Functions devem ser em Deno (TypeScript puro, sem npm)
- Toda Edge Function deve ter `try/catch` e retornar `{ data, error }`
- Variáveis de ambiente via `Deno.env.get()`
- Nunca expor service_role_key no cliente
