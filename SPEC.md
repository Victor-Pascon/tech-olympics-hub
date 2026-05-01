# SPEC.md — Tech Olympics Hub

## 1. Problema
Instituições de ensino (IFS Itabaiana, FAPITEC/SE) organizam olimpíadas de tecnologia, oficinas, palestras e eventos técnicos. A gestão destes eventos é feita manualmente: inscrições em papel, presença em planilhas, certificados emitidos um a um, ranking calculado na mão. O Tech Olympics Hub centraliza todo o fluxo: inscrição, presença, certificação, ranking e comunicação.

## 2. Usuários

| Perfil | Ações |
|--------|-------|
| **Participante** | Cadastra-se, inscreve-se em olimpíadas/oficinas/palestras, acompanha presença, visualiza ranking, baixa certificados |
| **Admin** | Gerencia olimpíadas, atividades, oficinas, palestras; marca presença; libera certificados; gerencia participantes; publica posts; vê relatórios |

## 3. Funcionalidades Implementadas

### 3.1 Autenticação e Perfil
- [x] Cadastro de participante com validação de CPF e busca de CEP
- [x] Login de participante com email/senha
- [x] Login de admin com verificação de role
- [x] Recuperação de senha
- [x] Perfil do participante editável
- [x] Admin cria/edita outros admins via Edge Function

### 3.2 Olimpíadas (Módulo Principal)
- [x] CRUD completo de olimpíadas (nome, tipo, datas, local, endereço, responsável, edital)
- [x] Atividades dentro de cada olimpíada (nome, responsável, horário, sala, vagas, carga horária)
- [x] Inscrição de participantes em olimpíadas e atividades
- [x] Marcação de presença por atividade com código de validação automático
- [x] Controle de vagas (limite por olimpíada e por atividade)
- [x] Liberação de certificados por olimpíada

### 3.3 Oficinas (Workshops)
- [x] CRUD de oficinas vinculadas a olimpíadas
- [x] Upload de materiais de apoio e estudo
- [x] Inscrição de participantes
- [x] Marcação de presença
- [x] Liberação de certificados

### 3.4 Palestras (Lectures)
- [x] CRUD de palestras (nome, descrição, local, carga horária, data, horário, vagas)
- [x] Palestrantes vinculados (nome, email, bio, tópico)
- [x] Inscrição de participantes
- [x] Marcação de presença
- [x] Liberação de certificados

### 3.5 Certificados
- [x] Templates customizáveis por tipo (olimpíada, oficina, palestra)
- [x] Geração de certificados com variáveis ([NOME_ALUNO], [NOME_CURSO], [HORAS])
- [x] Validação pública de certificados via código alfanumérico (10 dígitos)

### 3.6 Ranking
- [x] Lançamento de pontuação por atividade de olimpíada
- [x] Cálculo automático de colocação
- [x] Visualização de ranking com medalhas (ouro/prata/bronze)

### 3.7 Posts (Blog)
- [x] CRUD de posts com editor Markdown
- [x] Upload de imagem de capa e arquivos
- [x] Categorias e tags
- [x] Link do Google Maps nos posts
- [x] Controle de publicação (rascunho/publicado)

### 3.8 Relatórios
- [x] Relatório de presença com filtros (olimpíada, oficina, data)
- [x] Impressão e exportação de relatórios

### 3.9 Dashboard do Admin
- [x] Cards de estatísticas (totais de olimpíadas, participantes, presenças, etc.)
- [x] Gráficos (Recharts) com tendências

### 3.10 Materiais de Apoio
- [x] Upload de arquivos vinculados a olimpíadas, atividades ou oficinas

### 3.11 Infraestrutura
- [x] Storage Supabase (bucket `uploads`) para certificados, posts, materiais
- [x] RLS policies em todas as tabelas
- [x] Edge Functions para criação de admin e reset de senha
- [x] Migrações SQL versionadas (13 migrations)

## 4. Funcionalidades Pendentes (Lacunas)
- [ ] Testes automatizados reais (só existe teste placeholder)
- [ ] Migração de estado local (useState) para React Query mutations
- [ ] Dashboard do participante incompleto (algumas seções usam dados mockados)
- [ ] Ausência de notificações em tempo real (inscrições, liberação de certificados)
- [ ] Falta de paginação em listas grandes (participantes, posts)
- [ ] Upload de múltiplos certificados em lote
- [ ] Exportação de dados (CSV, PDF)
- [ ] Logs de auditoria para ações do admin
- [ ] Tema escuro/claro (atualmente só escuro)
- [ ] i18n (internacionalização)
- [ ] Validação de CPF duplicado no cadastro
- [ ] Responsividade em telas muito pequenas

## 5. Stack Confirmada
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript 5.8 + Vite 5.4 |
| UI | shadcn/ui + Tailwind CSS 3.4 |
| Roteamento | react-router-dom v6 |
| Estado | @tanstack/react-query v5 |
| Formulários | react-hook-form + zod |
| Gráficos | recharts |
| Backend | Supabase (PostgreSQL 15+) |
| Auth | Supabase Auth (email/senha) |
| Storage | Supabase Storage (bucket `uploads`) |
| Edge Functions | Deno (Supabase) |
| Testes | Vitest + @testing-library/react |
| Notificações | sonner |
| Data | date-fns |

## 6. Módulos Existentes

| Módulo | Responsabilidade |
|--------|-----------------|
| `auth/` | Autenticação, cadastro, perfis, roles |
| `olympiads/` | Olimpíadas, atividades, inscrições, presença |
| `workshops/` | Oficinas, materiais, inscrições, presença |
| `lectures/` | Palestras, palestrantes, inscrições, presença |
| `certificates/` | Templates, emissão, validação pública |
| `ranking/` | Pontuação, colocação, medalhas |
| `posts/` | Blog, editor MD, categorias |
| `reports/` | Relatórios de presença |
| `support/` | Materiais de apoio |
| `admin/` | Painel admin, usuários, dashboard |

## 7. Fora do Escopo (definido pelo time)
- App mobile nativo (PWA pode ser considerado)
- Pagamento de inscrições
- Streaming de eventos ao vivo
- Chat entre participantes
- Integração com Google Classroom ou Moodle
- Versão white-label para múltiplas instituições

## 8. Critérios de Aceitação Gerais
- [ ] `npm test` passa sem erros
- [ ] `npm run build` produz build sem erros de TypeScript
- [ ] `npm run lint` não reporta erros
- [ ] Toda migration SQL tem `up` e `down`
- [ ] Toda Edge Function retorna `{ data, error }`
- [ ] Toda tabela tem RLS policy configurada
