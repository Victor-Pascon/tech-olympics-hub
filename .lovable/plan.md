

## Plano de Implementação

### Problemas identificados e soluções

**1. Botões "Sobre" e "Contato" no Header nao funcionam**
- Os links apontam para `/#sobre` e `/#contato`, mas as seções na Index.tsx usam `id="blog"` e `id="contato"` -- falta a seção "sobre" com `id="sobre"`
- Solução: Adicionar `id="sobre"` na seção "Por que participar?" da Index.tsx, e implementar scroll suave via `useEffect` no Index.tsx para lidar com hash navigation do React Router

**2. Falta botão de acesso Admin no Header**
- Adicionar link "Admin" no Header (desktop e mobile)

**3. Desativar confirmação de e-mail no Supabase Auth**
- Configurar Supabase Auth para desabilitar email confirmation (o usuario precisa fazer isso no dashboard do Supabase: Auth > Providers > Email > desmarcar "Confirm email")
- No código, ao cadastrar via `supabase.auth.signUp`, não exigir verificação

**4. Criar schema do banco de dados**
- Migration SQL com todas as tabelas planejadas: `profiles`, `user_roles` (enum `app_role`), `olympiads`, `workshops`, `workshop_enrollments`, `posts`, `support_materials`, `attendance`
- Função `has_role` security definer
- RLS policies para cada tabela
- Trigger para criar profile automaticamente no signup

**5. Implementar autenticação funcional (Cadastro + Login)**
- `Cadastro.tsx`: usar `supabase.auth.signUp` com email/senha + inserir dados do profile
- `Login.tsx`: usar `supabase.auth.signInWithPassword` e redirecionar para `/participante`
- Criar contexto de auth (`AuthProvider`) para gerenciar sessão

**6. Melhorias visuais**
- Refinar cards do blog com gradientes e hover effects mais marcantes
- Melhorar espaçamentos e tipografia nas seções da Index
- Polir visualmente os dashboards (participante e admin)

### Ordem de execução
1. Migration SQL (tabelas, RLS, triggers)
2. AuthProvider + proteção de rotas
3. Cadastro e Login funcionais (sem confirmação de email)
4. Fixes de navegação (Sobre/Contato scroll, botão Admin)
5. Melhorias visuais

### Nota importante
O usuario precisara desativar "Confirm email" no painel do Supabase em Auth > Providers > Email para que o cadastro funcione sem verificação.

