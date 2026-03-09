

## Plano: Reformulação Completa do Painel Administrativo

### Resumo das Mudanças Solicitadas

O painel administrativo precisa de uma reformulação significativa em todas as suas abas, com dados reais do Supabase, gráficos no dashboard, formulários completos de cadastro, e uma nova aba de Usuários.

---

### 1. Alterações no Banco de Dados (Migrações SQL)

**Tabela `olympiads` -- adicionar colunas:**
- `responsavel`, `observacoes`, `numero_edital`, `limite_participantes`, `faixa_etaria`, `status` (ativa/inativa)

**Nova tabela `olympiad_activities` (subcategorias/atividades):**
- `id`, `olympiad_id` (FK), `nome`, `descricao`, `created_at`

**Tabela `workshops` -- adicionar colunas:**
- `material_apoio` (texto/URL), `material_estudo` (texto/URL)

**Tabela `posts` -- adicionar colunas:**
- `categoria`, `visualizacoes` (integer, default 0), `tags` (text)

**Nova tabela `admin_users` (perfis administrativos estendidos):**
- `id`, `user_id` (FK profiles), `matricula` (opcional), `funcao` (enum ou text[]: ministrante, professor_auxiliador, responsavel, juiz, criador_olimpiada, criador_desafios), `created_at`

---

### 2. Aba Dashboard (Resumo → Dashboard)

- Renomear "Resumo" para "Dashboard"
- Cards de resumo com dados reais via queries Supabase:
  - Total de inscritos (profiles count)
  - Total de olimpíadas (olympiads count)
  - Total de oficinas (workshops count)
  - Total de visualizações do blog (sum posts.visualizacoes)
- **Gráficos usando Recharts** (já instalado):
  - BarChart: Inscritos por olimpíada
  - BarChart: Inscritos por oficina
  - PieChart: Comparativo inscritos vs oficinas
  - LineChart: Visualizações do blog ao longo do tempo

---

### 3. Aba Olimpíadas

- Listar olimpíadas reais do Supabase (manter Tech Defense 2026 no banco, zerar participantes)
- **Formulário "Nova Olimpíada"** (Dialog/Modal) com campos:
  - Nome, Descrição, Data início/fim, Local, Responsável, Observações, Numero edital, Limite participantes, Faixa etária, Tipo/Status
  - **Subcategorias/Atividades**: campo dinâmico para adicionar atividades (ex: Teste de Penetração, Manutenção, Redes)
- **Botões por olimpíada**: Ver Participantes, Lançar Presença, Imprimir Lista de Presença
- Editar e Excluir olimpíadas com operações reais no banco

---

### 4. Aba Oficinas

- Formulário "Nova Oficina" com campos:
  - Nome, Descrição, Olimpíada (select), Ministrante, Vagas, Local, Horário, Material de apoio, Material de estudo
- Listar oficinas reais do banco
- Editar e Excluir

---

### 5. Aba Postagens

- Formulário completo com: Título, Conteúdo, Imagem URL, Categoria, Tags
- Salvar no Supabase com `autor_id = user.id`, `publicado = true/false`
- Listar postagens existentes com info de autor, data/hora
- Postagens publicadas aparecem automaticamente na página inicial (Index.tsx já busca do banco ou precisa ser ajustado)
- Incrementar `visualizacoes` ao exibir na Index

---

### 6. Aba Relatórios

- Filtros por olimpíada e oficina (dados reais)
- Tabela de participantes com presença
- Botão Exportar/Imprimir (window.print ou gerar PDF simples)
- Métricas: total inscritos, presentes, ausentes, taxa de comparecimento

---

### 7. Nova Aba: Usuários

- Listar usuários admin existentes
- Formulário "Novo Usuário Admin":
  - Nome completo, E-mail, Senha (cria conta via supabase.auth.admin ou edge function)
  - Matrícula (opcional)
  - Função (multi-select): Ministrante, Professor Auxiliador, Responsável, Juiz, Criador de Olimpíada, Criador de Desafios
- Atribuir role `admin` automaticamente ao criar

---

### 8. Ajuste na Index.tsx

- Buscar posts reais do Supabase (publicados)
- Incrementar campo `visualizacoes` ao renderizar post

---

### Arquivos a Criar/Modificar

1. **Migração SQL** -- novas colunas e tabelas
2. **`src/pages/AdminDashboard.tsx`** -- reescrita completa (componente grande, pode ser dividido em sub-componentes)
3. **`src/pages/Index.tsx`** -- buscar posts reais e contar visualizações
4. **Edge Function** (opcional) -- para criar usuários admin com senha (necessário service_role_key)

### Considerações Técnicas

- O componente AdminDashboard será extenso; recomendo dividir em componentes separados por aba (ex: `AdminDashboardTab.tsx`, `AdminOlympiadsTab.tsx`, etc.)
- Para criar usuários via admin, será necessária uma Edge Function usando `supabase.auth.admin.createUser()` pois o client-side não permite criar contas para outros usuários
- Gráficos usarão Recharts com o ChartContainer já existente no projeto

