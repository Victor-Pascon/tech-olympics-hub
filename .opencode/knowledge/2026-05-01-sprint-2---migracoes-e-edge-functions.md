# Decision: Sprint 2 - Migracoes e Edge Functions

## Data
30/04/2026, 21:58:36

## Categoria
decision

## Descrição
Sprint 2 executada: (1) 12 migrations SQL receberam blocks -- DOWN completos com reversao de tabelas, colunas, policies e triggers. (2) Criada migration 20260430_create_audit_log.sql com tabela audit_log, funcao audit_trigger_func e triggers em olympiads, workshops, lectures, posts, profiles e certificate_templates. (3) Criada Edge Function export-attendance que gera CSV de presencas com filtros por evento/data e dados do participante (nome, email, CPF). Configuracao adicionada ao supabase/config.toml.
