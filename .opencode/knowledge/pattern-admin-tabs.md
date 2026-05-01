# Pattern: Admin Dashboard com Múltiplas Tabs

## Problema
O painel admin precisava de múltiplas seções (olimpíadas, oficinas, palestras, posts, etc.) sem recarregar a página.

## Solução
Cada seção é um componente separado em `src/components/admin/`:
- `OlympiadsTab.tsx` — CRUD de olimpíadas
- `WorkshopsTab.tsx` — CRUD de oficinas
- `LecturesTab.tsx` — CRUD de palestras
- `PostsTab.tsx` — Blog posts
- etc.

O `AdminDashboard.tsx` usa um estado `activeTab` + `MobileTabsMenu` para navegação mobile.
Cada tab segue o mesmo padrão:
1. Carrega dados com `useQuery` do React Query
2. Renderiza tabela com shadcn Table
3. Modal de criação/edição com shadcn Dialog
4. Operações com confirmação (AlertDialog)
5. Toast de sucesso/erro via sonner
