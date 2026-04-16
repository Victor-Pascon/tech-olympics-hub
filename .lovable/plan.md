

## Plano: Corrigir subcategorias de olimpiadas e reset de senha

### Problema 1: Subcategorias (atividades) nao salvam
O erro nos logs de rede e claro: `Could not find the 'total_horas' column of 'olympiad_activities'`. A tabela `olympiad_activities` no banco nao possui a coluna `total_horas`, mas o codigo envia esse campo nos inserts.

**Correcao:** Criar migration para adicionar coluna `total_horas` na tabela `olympiad_activities`:
```sql
ALTER TABLE public.olympiad_activities ADD COLUMN total_horas integer DEFAULT 0;
```

### Problema 2: Reset de senha redireciona para localhost
O codigo usa `window.location.origin` corretamente, mas o Supabase Auth tem uma configuracao de **Site URL** e **Redirect URLs** que controla os URLs permitidos nos emails. Se o Site URL esta como `http://localhost:3000`, o email enviado tera esse URL.

**Correcao:**
- Orientar o usuario a atualizar o **Site URL** no painel do Supabase (Authentication > URL Configuration) para `https://tech-olympics-hub.lovable.app`
- Adicionar `https://tech-olympics-hub.lovable.app/reset-password` e `https://id-preview--05b2063f-6bec-424d-bff7-a61e9cf14457.lovable.app/reset-password` na lista de **Redirect URLs**

### Arquivos alterados
1. **Nova migration SQL** - adicionar `total_horas` em `olympiad_activities`
2. **Nenhuma alteracao de codigo** - o codigo ja esta correto, o problema era apenas a coluna faltando no banco

### Configuracao manual necessaria (Supabase Dashboard)
- Authentication > URL Configuration > Site URL: `https://tech-olympics-hub.lovable.app`
- Adicionar URLs de redirect permitidos

