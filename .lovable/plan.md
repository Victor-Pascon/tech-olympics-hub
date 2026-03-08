

## Plataforma Olimpíada Tech Defense

### Visão Geral
Plataforma web para gestão de olimpíadas de tecnologia, com blog informativo, cadastro de participantes, área do participante e painel administrativo. O logo/mascote enviado será usado na identidade visual. Backend via Supabase externo.

---

### 1. Blog Público (Página Inicial)
- Header com logo Tech Defense (mascote + emblema), nome da olimpíada e navegação
- Feed de postagens com suporte a texto formatado (rich text), imagens, embed de Google Maps para localização e informações de contato
- Cada postagem pode ser exportada/impressa em PDF
- Dois botões em destaque: **"Cadastre-se na Olimpíada"** e **"Área do Participante"**
- Footer com patrocinadores (IFS Itabaiana, FAPITEC/SE) e links úteis

### 2. Cadastro do Participante
- Formulário com: nome completo, e-mail, CPF, endereço completo (CEP, cidade, estado, rua, número), telefone e senha
- Validação de campos e confirmação de e-mail via Supabase Auth
- Após cadastro, participante é redirecionado à área logada

### 3. Área do Participante (logado)
- **Dashboard** com resumo: olimpíada inscrita, oficina escolhida, datas importantes
- **Oficinas**: lista de oficinas disponíveis para inscrição, com detalhes (professor/orientador, horário, local)
- **Informações da Prova**: local, data e horário da prova presencial
- **Material de Apoio**: download de documentos e links fornecidos pelo admin
- **Perfil**: edição de dados pessoais

### 4. Painel Admin
- **Gestão de Olimpíadas**: criar/editar olimpíadas (nome, tipo, datas, locais)
- **Gestão de Oficinas**: criar/editar oficinas vinculadas a uma olimpíada (nome, professor, horário, local, vagas)
- **Gestão de Postagens**: editor rich text para criar posts do blog com imagens, mapas e formatação
- **Material de Apoio**: upload e gerenciamento de materiais
- **Relatórios**:
  - Quantidade de participantes cadastrados (total e por olimpíada)
  - Lista de presença (marcar presença)
  - Lista de confirmações de inscrição
  - Filtros por olimpíada, oficina, status
  - Exportação em PDF

### 5. Painel Moderador
- Acesso limitado: pode criar/editar postagens do blog e visualizar relatórios
- Não pode gerenciar olimpíadas, oficinas ou configurações do sistema

### 6. Sistema de Roles (Supabase)
- 3 papéis: `admin`, `moderator`, `user` (participante)
- Tabela `user_roles` separada com RLS e função `has_role` security definer
- Proteção server-side via RLS policies

### 7. Banco de Dados (Supabase)
- **profiles**: dados pessoais do participante
- **user_roles**: papéis de usuário
- **olympiads**: olimpíadas cadastradas
- **workshops**: oficinas vinculadas a olimpíadas
- **workshop_enrollments**: inscrições em oficinas
- **posts**: postagens do blog (conteúdo rich text, imagens)
- **support_materials**: materiais de apoio
- **attendance**: lista de presença

### 8. Design
- Tema escuro com tons de azul e verde (inspirado nos logos Tech Defense)
- Visual tecnológico/cybersecurity com elementos de circuito
- Responsivo para mobile e desktop
- Logo do mascote e emblema no header

