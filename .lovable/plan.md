

## Plano: Menu hamburguer para abas no mobile (Admin e Participante)

### Problema
Nas telas mobile, as abas (`TabsList`) do painel Admin (12 abas) e do Participante quebram em múltiplas linhas e ficam confusas, sobrepondo conteúdo (ex: "Ranking/Relatórios" aparecendo atrás do card "Participantes").

### Solução
Manter as `Tabs` atuais (lógica intacta), mas no mobile (`< md`) esconder a `TabsList` horizontal e exibir um **botão hamburguer** que abre um `Sheet` lateral contendo a lista vertical das abas. Ao clicar em uma aba, o sheet fecha e o `tab` ativo é atualizado.

### Arquivos a modificar

**1. `src/pages/AdminDashboard.tsx`**
- Importar `Sheet`, `SheetContent`, `SheetTrigger`, `SheetHeader`, `SheetTitle` e `Menu` (lucide).
- Extrair a lista de abas para um array `[{ value, label, icon }]`.
- Adicionar header mobile com botão hamburguer + label da aba ativa (visível apenas `md:hidden`).
- `TabsList` existente recebe `hidden md:flex` para sumir no mobile.
- `Sheet` lateral (lado esquerdo) com botões verticais para cada aba; ao clicar, seta `tab` e fecha o sheet.

**2. `src/pages/ParticipantDashboard.tsx`** (mesma abordagem)
- Inspecionar arquivo para confirmar estrutura de `Tabs` antes de aplicar.
- Aplicar o mesmo padrão: hamburguer + Sheet vertical no mobile, `TabsList` escondida no mobile.

### Observações
- Nenhuma alteração em desktop (continua com `TabsList` horizontal).
- Sem mudanças de banco/edge functions.
- Mantém todos os `TabsContent` inalterados.

