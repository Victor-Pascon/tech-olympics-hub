---
paths:
  - "src/components/admin/**/*.tsx"
---

# Regras de Componentes Admin

- Toda tab do admin deve ser um componente separado em `src/components/admin/`
- Usar `useQuery` do React Query para dados do servidor
- Tratar loading com `Skeleton` do shadcn/ui
- Tratar erro com `sonner` toast
- Operações de escrita (create/update/delete) devem usar `useMutation`
- Invalidar queries após mutação com `queryClient.invalidateQueries`
