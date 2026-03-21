

## Plano: Corrigir Login e Resetar Senha do Usuário

### Problema
O usuário não consegue fazer login com `joaovpascon@gmail.com` / `Vic@310721`. Os logs de autenticação confirmam `invalid_credentials`, o que significa que a senha armazenada no Supabase Auth é diferente.

### Solução

**1. Criar Edge Function `reset-user-password`**
- Usa `SUPABASE_SERVICE_ROLE_KEY` para chamar `auth.admin.updateUser()` 
- Recebe `email` e `new_password` no body
- Protegida: só admins podem chamar (ou aceita um secret token fixo para uso único)
- Para este caso específico, vou torná-la callable sem auth (uso único para reset) com verificação por secret

**2. Chamar a função para resetar a senha**
- Resetar a senha do usuário `joaovpascon@gmail.com` para `Vic@310721`

**3. Adicionar funcionalidade de "Esqueci minha senha" nas páginas de login**
- Botão "Esqueceu a senha?" nas páginas Login e AdminLogin
- Chama `supabase.auth.resetPasswordForEmail()` com redirect para `/reset-password`
- Criar página `/reset-password` para definir nova senha

### Arquivos a criar/modificar

1. **`supabase/functions/reset-user-password/index.ts`** — Edge function para reset de senha via admin API
2. **`supabase/config.toml`** — Registrar nova função com `verify_jwt = false`
3. **`src/pages/Login.tsx`** — Adicionar link "Esqueceu a senha?"
4. **`src/pages/AdminLogin.tsx`** — Adicionar link "Esqueceu a senha?"
5. **`src/pages/ResetPassword.tsx`** — Nova página para redefinir senha
6. **`src/App.tsx`** — Adicionar rota `/reset-password`

