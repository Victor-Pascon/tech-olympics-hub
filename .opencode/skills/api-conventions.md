---
name: api-conventions
description: >
  Implementa queries Supabase e Edge Functions seguindo o padrão do projeto:
  tipagem TypeScript estrita, tratamento de erros, RLS obrigatório.
  Use sempre que for criar queries, mutations ou endpoints de API.
---

# API Conventions

## Quando usar
- Criar query Supabase
- Implementar Edge Function
- Criar hook de dados com React Query

## Quando NÃO usar
- Componentes de UI (usar ui-conventions)
- Migrations SQL (usar migration-conventions)

## Passo a passo
### 1. Usar o cliente tipado do Supabase
```tsx
import { supabase } from "@/integrations/supabase/client"
import type { Database } from "@/integrations/supabase/types"
```

### 2. Especificar colunas em todas as queries
```tsx
// ✅ Correto
const { data } = await supabase
  .from("profiles")
  .select("id, nome, email, cpf")
  .eq("id", userId)

// ❌ Incorreto
const { data } = await supabase.from("profiles").select("*")
```

### 3. Tratar erro sempre
```tsx
const { data, error } = await supabase.from("olympiads").select("id, nome")
if (error) {
  toast.error("Erro ao carregar olimpíadas")
  return
}
```

## Edge Functions
```tsx
// Toda função deve ter try/catch e retornar { data, error }
try {
  const { data, error } = await supabase.functions.invoke("create-admin-user", {
    body: { email, password }
  })
  if (error) throw error
  return { data, error: null }
} catch (error) {
  return { data: null, error: error.message }
}
```
