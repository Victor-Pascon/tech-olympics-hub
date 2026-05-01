---
name: migration-conventions
description: >
  Cria migrations SQL seguindo o padrão do projeto: snake_case, UUIDs,
  RLS obrigatório, blocks UP/DOWN. Use sempre que for criar nova migration
  ou modificar o schema do banco.
---

# Migration Conventions

## Quando usar
- Criar nova tabela
- Adicionar colunas
- Modificar constraints
- Adicionar índices

## Quando NÃO usar
- Queries temporárias
- Dados seed (usar seed separado)

## Estrutura
```sql
-- Nome do arquivo: 20260430_descricao.sql

-- UP
create table if not exists public.exemplo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  created_at timestamptz default now()
);

alter table public.exemplo enable row level security;

create policy "Usuários podem ler exemplos"
  on public.exemplo for select
  using (true);

-- DOWN
drop table if exists public.exemplo;
```

## Regras
- Nome do arquivo: `YYYYMMDD_descricao.sql`
- Toda PK = `uuid primary key default gen_random_uuid()`
- Toda FK = `references tabela(id) on delete cascade`
- Sempre incluir `-- DOWN`
- Toda tabela precisa de RLS
- Colunas em snake_case
