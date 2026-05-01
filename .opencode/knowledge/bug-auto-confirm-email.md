# Bug: Senha de Admin e Confirmação de Email

## Sintoma
Usuários admin não conseguiam fazer login porque o email não era confirmado automaticamente.

## Causa Raiz
O Supabase Auth requer confirmação de email por padrão. Admin users criados via Edge Function não tinham email confirmado.

## Solução
1. Criada migration `20260321150000_auto_confirm_users.sql` com trigger `on_auth_user_created_auto_confirm` que auto-confirma emails no INSERT
2. Admin joaovpascon@gmail.com recebe role admin via trigger dedicado

## Prevenção
Sempre verificar se triggers de auto-confirm estão ativos ao criar novos ambientes.
