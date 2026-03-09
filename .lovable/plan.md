

## Plano: Melhorias no Painel Administrativo

### Resumo
Expandir formulários de olimpíadas, oficinas e postagens com campos detalhados; melhorar o dashboard com gráficos por olimpíada com drill-down em subcategorias; adicionar upload de arquivos via storage bucket; estilizar scrollbars; e expandir relatórios com filtro por dia.

---

### 1. Migração SQL — Novas colunas e Storage

**Tabela `olympiads`** — adicionar campos de endereço:
- `cep`, `rua`, `bairro`, `cidade`, `estado`, `numero_endereco`, `complemento`, `ponto_referencia`, `horario`, `dias_semana`

**Tabela `olympiad_activities`** — expandir com:
- `responsavel`, `horario`, `data_atividade` (date), `local_sala` (sala/lab), `limite_vagas` (integer)

**Tabela `workshops`** — adicionar:
- `data_inicio`, `data_fim`, `dias_aulas` (text — datas das aulas separadas por vírgula)

**Tabela `posts`** — adicionar:
- `localizacao_maps` (text — URL do Google Maps)

**Storage bucket** `uploads` (público) para arquivos de oficinas e postagens (PDFs, DOCs, imagens, vídeos, áudio — limite 50MB no frontend).

**Tabela `post_files`** — nova:
- `id`, `post_id` (FK posts), `file_url`, `file_name`, `file_type`, `created_at`

**Tabela `workshop_files`** — nova:
- `id`, `workshop_id` (FK workshops), `file_url`, `file_name`, `file_type`, `tipo` (apoio/estudo), `created_at`

RLS: admins ALL em ambas; public SELECT.

---

### 2. Olimpíadas — Formulário expandido

- Substituir campo "Local" único por seção de endereço completo: CEP, Rua, Bairro, Cidade, Estado, Número, Complemento, Ponto de Referência
- Adicionar campos Horário e Dias da Semana
- Expandir formulário de atividades/subcategorias para incluir: Responsável, Horário, Data, Local (sala/lab), Limite de Vagas
- Permitir adicionar novas subcategorias diretamente da listagem de olimpíadas (botão na tabela)

### 3. Oficinas — Formulário expandido

- Adicionar campos Data Início, Data Fim, Datas das Aulas
- Substituir campos Material de Apoio/Estudo (URL) por sistema de upload de arquivos (PDF, DOC, vídeo, áudio) usando Supabase Storage
- Manter campo de URL como alternativa

### 4. Postagens — Upload de mídia + Google Maps

- Adicionar upload de imagens/vídeos via Storage (além de URL)
- Adicionar campo de localização Google Maps (URL)
- Listar arquivos anexados na postagem

### 5. Dashboard — Gráficos por olimpíada com drill-down

- Remover gráfico "Comparativo Inscritos vs Oficinas"
- Cada olimpíada ganha seu próprio card com BarChart de inscritos
- Abaixo de cada gráfico de olimpíada, listar oficinas vinculadas com contagem
- Click no gráfico abre Dialog com gráfico de inscritos por subcategoria/atividade
- Manter gráfico de Visualizações do Blog

### 6. Relatórios — Filtro por dia

- Adicionar filtro por data (dia) além de olimpíada e oficina
- Filtrar participantes que compareceram em um dia específico

### 7. Scrollbar customizada

- Adicionar CSS global para scrollbar estilizada (fina, cores do tema escuro, borda arredondada) em todos os elementos com overflow

---

### Arquivos a criar/modificar

1. **Migração SQL** — novas colunas, tabelas e storage bucket
2. **`src/components/admin/OlympiadsTab.tsx`** — formulário expandido com endereço e atividades detalhadas
3. **`src/components/admin/WorkshopsTab.tsx`** — upload de arquivos, datas das aulas
4. **`src/components/admin/PostsTab.tsx`** — upload de mídia, campo Google Maps
5. **`src/components/admin/DashboardTab.tsx`** — gráficos individuais por olimpíada com drill-down
6. **`src/components/admin/ReportsTab.tsx`** — filtro por dia
7. **`src/index.css`** — scrollbar customizada global

