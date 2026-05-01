# Relatório Completo — Workshop & Treinamento ExponencIA
## Arquitetura de Agentes Inteligentes: O Harness de IA

---

## 1. RESUMO EXECUTIVO

O **Harness de IA** é o sistema de contexto vivo do projeto. Ele transforma a IA de uma ferramenta que apenas gera código em uma ferramenta que **mantém** o código com conhecimento profundo do sistema.

**Problema que resolve:** A IA "quebra" código porque age como um engenheiro cego: não conhece a arquitetura, convenções, histórico de bugs e decisões do projeto. Sem contexto, toda decisão razoável gera efeitos colaterais inesperados.

**Solução:** Um conjunto de artefatos versionados e um sistema de memória (RAG) que injetam automaticamente o contexto correto, no formato correto, no momento correto — em toda sessão.

### Os 9 Artefatos do Harness

| Artefato | Função |
|----------|--------|
| **SPEC.md** | O que construir — problema, usuários, funcionalidades, stack, critérios de aceitação. |
| **CLAUDE.md / AGENTS.md** | Como trabalhar neste projeto — stack, convenções, regras de ouro, onboarding do agent. |
| **PLAN.md** | Em que ordem construir — sprints, fases, tasks, testes críticos, gates de conclusão. |
| **Agents** | Quem executa o quê — sub-agents especializados com escopo, tools e prompts próprios. |
| **Skills** | O que cada agent sabe fazer além do básico — workflows especializados carregados sob demanda. |
| **Rules** | Como se comportar em contextos específicos — regras escopadas por path do projeto. |
| **Hooks** | O que deve acontecer sempre, independente do agent — enforcement determinístico. |
| **RAG** | O que foi aprendido nas sessões anteriores — memória persistente de bugs, decisões e padrões. |
| **MCP** | Quais ferramentas externas o agent acessa — banco, browser, APIs, serviços. |

### Pilares do Sucesso
1. **Contexto Estruturado > Inteligência do Modelo** — A qualidade do resultado depende mais do contexto fornecido do do modelo usado.
2. **Separação de Planejamento e Execução** — Nunca misture a sessão de planejamento (Plan Mode) com a sessão de implementação.
3. **Menor Privilégio por Agente** — Cada agent só tem acesso ao mínimo de tools necessário para sua função.
4. **TDD como Prova de Aderência** — Testes são a única prova objetiva de que o requisito foi cumprido.
5. **Builder-Validator** — Todo código implementado passa por review antes de avançar.

---

## 2. PASSO A PASSO — CONSTRUÇÃO DO HARNESS DO ZERO

Este fluxo é para novos projetos. Siga a ordem rigorosamente — cada etapa é pré-requisito da próxima.

### Fase 0: Preparação do Ambiente (10-15 min)

**Ação:** Configure o repositório e a ferramenta de IA.

```bash
# 1. Crie o repositório do projeto
git init meu-projeto && cd meu-projeto

# 2. Escolha sua ferramenta:
# Claude Code (recomendado para orquestração complexa)
# OpenCode (recomendado para controle granular e plugins)

# 3. Crie o arquivo de ignore para a IA
# Claude Code → .claudeignore
# OpenCode → .opencodeignore
```

**Conteúdo do `.claudeignore` / `.opencodeignore`:**
```
.env
.env.*
node_modules/
__pycache__/
*.pyc
.claude/rag.db  # se usar RAG
```

> **Regra de Ouro:** Nunca deixe a IA ler arquivos sensíveis (`.env`, credenciais, secrets).

---

### Fase 1: Especificação — Criar o SPEC.md (30-60 min)

**Ação:** Documente O QUE será construído. O SPEC.md é a fonte da verdade do projeto.

**Prompt para o agent (Plan Mode / somente leitura):**
```
Vou criar um novo projeto. 
Descreva o problema que resolvemos, os usuários, as funcionalidades principais, 
os módulos do sistema, a stack tecnológica e os critérios de aceitação.
Gere o arquivo SPEC.md na raiz do projeto.
```

**Estrutura obrigatória do SPEC.md:**
```markdown
# SPEC.md — [Nome do Projeto]

## 1. Problema
[Descrição clara do problema que o sistema resolve]

## 2. Usuários
[Quem usa o sistema e o que cada um faz]

## 3. Funcionalidades
- [Feature 1 com exemplo concreto]
- [Feature 2 com exemplo concreto]

## 4. Módulos
- backend: [responsabilidade]
- frontend: [responsabilidade]

## 5. Stack
- Linguagem: [ex: Python 3.12]
- Framework: [ex: FastAPI + React]
- Banco: [ex: PostgreSQL 16]
- Testes: [ex: pytest + Vitest]

## 6. Critérios de Aceitação
- [Critério 1 verificável por teste]
- [Critério 2 verificável por teste]

## 7. Fora do Escopo
[O que este projeto NÃO faz — evita interpretações erradas]
```

**Checklist de qualidade:**
- [ ] Cada funcionalidade tem pelo menos 1 exemplo concreto
- [ ] Não existem requisitos implícitos
- [ ] Casos de borda estão documentados
- [ ] O que está FORA do escopo está claramente delimitado

---

### Fase 2: Convenções — Criar o CLAUDE.md / AGENTS.md (20-30 min)

**Ação:** Documente COMO trabalhar neste projeto. Este é o "onboarding" que todo agent recebe.

**Prompt para o agent:**
```
Leia o SPEC.md gerado. 
Crie o CLAUDE.md (ou AGENTS.md) com a stack específica, convenções de nomenclatura, 
padrões de código, regras de ouro e o que nunca pode ser feito neste projeto.
```

**Estrutura obrigatória:**
```markdown
# CLAUDE.md / AGENTS.md — Convenções do Projeto

## Stack
- Python 3.12 + FastAPI
- PostgreSQL 16 via SQLAlchemy 2.0
- pytest para testes

## Convenções de Nomenclatura
- Rotas: snake_case
- Models: PascalCase
- Variáveis: snake_case
- Arquivos de teste: test_[modulo].py

## Regras de Ouro
1. Nunca expor IDs numéricos — usar UUIDs públicos
2. Toda rota retorna { data, error } — nunca status HTTP isolado
3. Escrever testes antes de implementar (TDD)
4. Nunca commitar em main diretamente

## Estrutura de Pastas
backend/
├── app/
│   ├── main.py
│   ├── core/       # config, security, database
│   ├── models/     # SQLAlchemy models
│   ├── schemas/    # Pydantic schemas
│   ├── services/   # business logic
│   └── api/        # routers
└── tests/
    └── test_health.py

## Comandos de Setup
```bash
# Instalar dependências
pip install -r requirements.txt
# Rodar testes
pytest tests/ -q
# Subir servidor
uvicorn app.main:app --reload
```

## O que NUNCA fazer
- Rodar migrations sem aprovação explícita
- Hardcodar senhas ou tokens
- Usar `except:` genérico sem logging
```

---

### Fase 3: Plano de Execução — Criar o PLAN.md (30-45 min)

**Ação:** Defina EM QUE ORDEM construir. Separe planejamento de execução.

**Workflow:**
1. Abra uma sessão em **Plan Mode** (somente leitura)
2. Peça ao agent para ler SPEC.md + CLAUDE.md
3. Gere o PLAN.md com a estrutura abaixo
4. **Revise e edite manualmente** antes de aprovar
5. **Feche a sessão de planejamento** — nunca misture com execução

**Estrutura obrigatória do PLAN.md:**
```markdown
# PLAN.md

## Sprint 1 — [critério de conclusão em 1 frase verificável]

### Fase 1 — [nome]
> Dependências: nenhuma
> Paralelismo: Task 1.1 e 1.2 podem rodar em paralelo

#### Task 1.1 — [nome descritivo]
- Agent: backend
- Input: [o que precisa estar pronto]
- Output: [arquivo ou função com assinatura exata]
- Testes críticos:
  - [ ] [comportamento com input válido]
  - [ ] [caso de erro tratado]

#### Task 1.2 — [nome descritivo]
- Agent: frontend
- Input: ...
- Output: ...
- Testes críticos:
  - [ ] ...

### Fase 2 — [nome]
> Dependências: Fase 1 completa
> Paralelismo: nenhuma (tasks sequenciais)
```

**Regras de ouro do PLAN.md:**
- Toda task tem pelo menos 2 testes críticos definidos ANTES do código
- Nenhum output pode ser vago — descreva arquivo/função/estrutura exata
- Tasks na mesma fase são genuinamente independentes
- Tasks de integração NUNCA na mesma fase que as tasks base
- Cada fase tem critério de conclusão verificável por comando de terminal

---

### Fase 4: Scaffold — Estrutura Inicial (30-60 min)

**Ação:** Crie a estrutura vazia, instale dependências e levante um servidor mínimo.

**O que é:** O scaffold é o "terreno" onde as tasks do PLAN.md vão acontecer. Ele vem **antes** da Fase 1 de implementação.

**Prompt para o agent:**
```
Leia o SPEC.md, CLAUDE.md e PLAN.md.
Gere o scaffold completo seguindo estas regras:

1. Crie TODOS os diretórios definidos no CLAUDE.md
2. Adicione um README.md de uma linha em cada pasta
3. Crie os arquivos de configuração da stack (requirements.txt, tsconfig.json, etc.)
4. Instale as dependências
5. Crie o ponto de entrada com apenas uma rota /health que retorna 200
6. Configure o framework de testes e crie um teste de smoke passando

O QUE NÃO FAZER:
- Não implemente lógica de negócio
- Não crie modelos de dados
- Não crie endpoints além de /health
- Não crie componentes de UI além do layout base
```

**Critério de conclusão:**
```bash
# Backend
curl localhost:8000/health  # → {"status": "ok"}

# Frontend
curl localhost:3000         # → HTML da página base sem erro
```

> **Atenção:** Nenhuma task de implementação começa antes desses comandos passarem.

---

### Fase 5: Criação dos Agents Especializados (20-30 min)

**Ação:** Crie os sub-agents que vão executar as tasks do PLAN.md.

**Onde criar:**
```
# Claude Code
.claude/agents/[nome-do-agent].md

# OpenCode
.opencode/agents/[nome-do-agent].md
```

**Estrutura de cada agent:**
```markdown
---
name: backend-agent
description: Implementa endpoints FastAPI, modelos SQLAlchemy e lógica de serviço. 
  Use para tasks de backend como criar rotas, models e services.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
skills:
  - api-conventions
  - tdd-backend
---

## Papel
Você é um engineer especializado em backend Python.

## Responsabilidades
- Implementar endpoints seguindo o SPEC.md
- Escrever testes antes do código (TDD)
- Seguir convenções do CLAUDE.md

## Restrições
- Nunca modificar o SPEC.md, CLAUDE.md ou PLAN.md
- Nunca implementar algo que não esteja no PLAN.md
- Sempre rodar testes antes de marcar task como concluída
```

**Tipos de agent recomendados para projeto do zero:**
| Tipo | Tools | Função |
|------|-------|--------|
| backend-agent | Read, Write, Edit, Bash | Implementa API e lógica |
| frontend-agent | Read, Write, Edit, Bash | Implementa UI e componentes |
| parser-agent | Read, Write, Bash | Processa dados e transformações |
| code-reviewer | Read, Grep, Glob | Revisa código (somente leitura) |
| qa-agent | Read, Bash (testes apenas) | Executa testes e reporta |

**Princípio do menor privilégio:**
- Revisor/Auditor: apenas Read, Grep, Glob
- Implementador: Read, Write, Edit, Bash
- QA: Read, Bash restrito a comandos de teste

---

### Fase 6: Criação das Skills (20-30 min)

**Ação:** Crie workflows especializados que eliminam repetição de instruções.

**Onde criar:**
```
.claude/skills/[nome-da-skill]/SKILL.md
```

**Estrutura do SKILL.md:**
```markdown
---
name: api-conventions
description: >
  Gera endpoints FastAPI seguindo o padrão do projeto: 
  rota em snake_case, tipagem Pydantic obrigatória, 
  teste pytest correspondente. 
  Use sempre que o usuário pedir para criar um endpoint, 
  rota ou serviço de API.
---

# API Conventions

## Quando usar
- Criar novo endpoint
- Adicionar rota
- Criar serviço de API

## Quando NÃO usar
- Scripts de migração de banco
- Tarefas de infraestrutura

## Passo a passo
### 1. Criar o teste primeiro
```python
def test_create_user(client):
    response = client.post("/users", json={"name": "Alice"})
    assert response.status_code == 201
```

### 2. Implementar o endpoint
```python
@router.post("/users", response_model=UserResponse)
async def create_user(data: UserCreate):
    ...
```

## Exemplos
### Input esperado
"Crie um endpoint para criar usuários"

### Output esperado
- Arquivo de teste passando
- Endpoint com tipagem Pydantic
- Retorno no formato { data, error }
```

**Regras de qualidade:**
- Description deve mencionar triggers específicos (não ser genérica)
- Corpo abaixo de 500 linhas (use `references/` para conteúdo extra)
- Uma skill por classe de tarefa (não uma skill monolítica)
- Sempre definir quando NÃO usar

---

### Fase 7: Criação das Rules (15-20 min)

**Ação:** Crie regras escopadas por path para guiar o comportamento do agent em contextos específicos.

**Onde criar:**
```
.claude/rules/
├── seguranca.md          ← incondicional (sem frontmatter)
├── convencoes-gerais.md  ← incondicional
├── backend/
│   ├── api.md            ← paths: backend/app/api/**
│   ├── models.md         ← paths: backend/app/models/**
│   └── services.md       ← paths: backend/app/services/**
└── frontend/
    ├── components.md     ← paths: frontend/src/components/**
    └── hooks.md          ← paths: frontend/src/hooks/**
```

**Exemplo de rule escopada (`backend/api.md`):**
```markdown
---
paths:
  - "backend/app/api/**/*.py"
  - "backend/app/routes/**/*.py"
---

# Regras de API — Backend

- Toda rota deve ter tipagem Pydantic no request e response
- Retornar sempre { data, error } — nunca status HTTP isolado
- Incluir comentários OpenAPI em toda rota pública
- Nunca expor IDs numéricos do banco — usar UUIDs públicos
- Validar input antes de qualquer operação de banco
```

**Diferença crucial: Rule vs Hook**
- **Hook:** enforcement determinístico (código externo, o agent não tem escolha)
- **Rule:** orientação contextual (o agent lê e interpreta, pode julgar se aplica)

> Se precisa ser garantido, use **Hook**. Se é uma orientação de domínio, use **Rule**.

---

### Fase 8: Configuração dos Hooks (20-30 min)

**Ação:** Configure guardrails que disparam automaticamente independente do que o agent decidiu.

**Onde criar:**
```
.claude/hooks/
├── global/
│   ├── format-on-save.sh       ← PostToolUse Edit|Write
│   └── block-env-read.sh       ← PreToolUse Read
├── backend/
│   ├── run-module-tests.sh     ← PostToolUse Edit|Write
│   ├── validate-scope.sh       ← PreToolUse Bash
│   └── verify-before-return.sh ← Stop
└── qa/
    └── allow-only-tests.sh     ← PreToolUse Bash
```

**Tipos de hook:**
- **PreToolUse:** Dispara ANTES de uma tool ser usada (bloqueia ou valida)
- **PostToolUse:** Dispara DEPOIS de uma tool ser usada (roda testes, formata)
- **Stop:** Dispara quando o sub-agent encerra (verificação final)

**Exemplo: Hook para agent somente leitura**
```yaml
# No frontmatter do agent (.claude/agents/code-reviewer.md)
hooks:
  PreToolUse:
    - matcher: "Write|Edit|Bash"
      hooks:
        - type: command
          command: |
            echo 'Este agent é somente leitura.' >&2
            exit 2
```

**Exemplo: Hook para rodar testes após edição**
```yaml
# No frontmatter do agent de backend
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/hooks/backend/run-module-tests.sh"
```

**Checklist:**
- [ ] Scripts com `chmod +x` (permissão de execução)
- [ ] Todo script termina com `exit 0` (ou `exit 2` para bloquear)
- [ ] Stop hooks verificam `stop_hook_active` para evitar loop infinito

---

### Fase 9: Implementação com Multi-Agents (Execução)

**Ação:** Execute o PLAN.md usando orquestração de agents.

**Regras de execução:**
1. **Uma task, um agent** — nunca atribua a mesma task a dois agents
2. **Gate de fase não negociável** — nenhum agent da próxima fase começa antes do critério da fase atual passar
3. **Sem edição do mesmo arquivo em paralelo** — se duas tasks tocam o mesmo arquivo, são sequenciais
4. **Contexto isolado** — cada sub-agent começa com contexto limpo

**Padrão Builder-Validator (recomendado):**
```
FASE 1:
  ├─ @backend-agent → Implementa Task 1.1
  └─ @frontend-agent → Implementa Task 1.2 (paralelo)

GATE 1: Testes da Fase 1 passam?

FASE 2:
  ├─ @backend-agent → Implementa Task 2.1
  └─ @code-reviewer → Revisa Task 2.1 (após conclusão)

GATE 2: Review sem bloqueantes?
```

**Prompt de execução:**
```
Leia o PLAN.md e execute a [FASE N] completa seguindo estas regras:

1. ANTES DE COMEÇAR
   - Identifique tasks independentes que podem rodar em paralelo
   - Tasks com dependências devem rodar em sequência

2. PARA CADA TASK
   - Leia Input, Output e Testes críticos
   - Escreva os testes PRIMEIRO (fase red)
   - Confirme que testes falham antes de implementar
   - Implemente o mínimo necessário para passar (fase green)
   - Marque checkbox no PLAN.md como concluído

3. GATE DA FASE
   - Execute critério de conclusão definido no PLAN.md
   - Só avance para próxima fase após o gate passar

4. RESTRIÇÕES
   - Siga convenções do CLAUDE.md
   - Não implemente nada fora do PLAN.md
   - Se uma task bloquear, sinalize e aguarde
```

---

### Fase 10: Review Automático (Contínuo)

**Ação:** Configure o code-reviewer para validar cada entrega.

**Arquivo:** `.claude/agents/code-reviewer.md`
```markdown
---
name: code-reviewer
description: Revisa código gerado pelos agents de implementação 
  contra o SPEC.md e o PLAN.md.
tools: Read, Grep, Glob
model: sonnet
hooks:
  PreToolUse:
    - matcher: "Write|Edit|Bash"
      hooks:
        - type: command
          command: "echo 'code-reviewer é somente leitura' >&2 && exit 2"
---

Você é um engenheiro sênior especializado em code review.
Sua única responsabilidade é revisar — nunca modificar.

Ao ser invocado:
1. Leia o SPEC.md para entender o que deveria ter sido construído
2. Leia o PLAN.md para entender os critérios de cada task
3. Leia o CLAUDE.md para as convenções do projeto
4. Analise o código implementado contra esses três documentos

Classificação:
- BLOQUEANTE: impede o funcionamento do sistema
- IMPORTANTE: deve ser corrigido antes da entrega
- SUGESTÃO: melhoria desejável para o próximo ciclo

Nunca modifique arquivos. Nunca execute comandos.
```

**Como invocar:**
```bash
# Manual
@code-reviewer Faça o review do que foi implementado na Task 2.1

# Automático via Slash Command
/review
```

---

### Fase 11: Configuração do RAG (Memória Persistente) — Opcional mas Recomendado

**Ação:** Configure o sistema para capturar aprendizados entre sessões.

**Stack sugerida:**
- SQLite + sqlite-vec (banco vetorial embutido)
- @xenova/transformers com all-MiniLM-L6-v2 (embeddings locais)

**Estrutura:**
```
.claude/
├── knowledge/
│   ├── 2026-04-20-parser-rate-limit.md
│   └── 2026-04-20-backend-decisao-cache.md
├── rag.db
├── hooks/
│   ├── capture-agent-learning.sh    ← SubagentStop
│   ├── capture-session-learning.sh  ← Stop
│   └── inject-context.sh            ← UserPromptSubmit
└── scripts/
    ├── summarize.ts
    ├── embed.ts
    └── search.ts
```

**Categorias de conhecimento:**
- **bug:** bug resolvido com causa raiz, sintoma e solução
- **decision:** decisão de arquitetura com alternativas descartadas
- **pattern:** padrão adotado pelo time com exemplo de uso
- **failure:** o que não funcionou e por quê

**Funcionamento:**
1. Quando um agent termina, o hook captura o transcript
2. O script `summarize.ts` extrai aprendizados nas 4 categorias
3. O script `embed.ts` gera embeddings e salva no banco
4. Na próxima sessão, `inject-context.sh` busca conhecimento relevante e injeta no prompt

> **Tradeoff:** O aprendizado da sessão N fica disponível na sessão N+1 (intencional — evita loops e ruído).

---

### Fase 12: Slash Commands (Otimização Final)

**Ação:** Encapsule workflows completos em comandos de uma linha.

**Onde criar:**
```
# Claude Code (slash commands = skills)
.claude/skills/
├── review/SKILL.md
├── implementar/SKILL.md
└── entrega/SKILL.md

# OpenCode
.opencode/commands/
├── review.md
├── implementar.md
└── entrega.md
```

**Exemplo: `/implementar`**
```markdown
---
name: implementar
description: Executa uma task do PLAN.md com TDD e review automático ao final.
  Use quando o usuário quiser implementar uma task, executar uma fase ou 
  desenvolver qualquer item do PLAN.md.
---

Leia a task $ARGUMENTS no PLAN.md.

Execute na seguinte sequência obrigatória:
1. Identifique o agent responsável pela task
2. Leia Input, Output e Testes críticos
3. Despache agent para escrever testes primeiro (RED)
4. Confirme que testes falham antes de implementar
5. Despache agent para implementar o mínimo para passar (GREEN)
6. Confirme que testes passam
7. Marque checkbox da task no PLAN.md
8. Invoque @code-reviewer automaticamente
9. Reporte o veredicto
```

**Uso:**
```bash
/implementar task 2.1
/implementar fase 3 completa
/review
/entrega
```

---

## 3. PASSO A PASSO — INSERÇÃO DO HARNESS EM PROJETOS EM ANDAMENTO

Quando o projeto já existe e está em desenvolvimento, a abordagem é diferente: você não começa do zero, mas precisa **capturar o contexto acumulado** e estruturá-lo sem quebrar o que já funciona.

### Fase A: Análise e Mapeamento do Estado Atual (1-2 horas)

**Ação:** Entenda o que existe antes de criar qualquer artefato.

**Passo A.1 — Inventário do projeto**
```bash
# Liste a estrutura atual
find . -type f -not -path './node_modules/*' -not -path './.git/*' | sort

# Identifique a stack
ls package.json requirements.txt composer.json Gemfile 2>/dev/null

# Veja o que já está versionado
git log --oneline -20

# Identifique testes existentes
find . -name "*test*" -o -name "*spec*" | head -20
```

**Passo A.2 — Extraia as convenções implicitamente usadas**
```
Prompt para o agent (modo somente leitura):

"Analise este codebase existente. Identifique:
1. Stack e versões usadas
2. Estrutura de pastas e responsabilidade de cada uma
3. Padrões de nomenclatura (arquivos, funções, variáveis, classes)
4. Formato de retorno de APIs (se houver)
5. Como erros são tratados
6. Onde ficam os testes e como são organizados
7. Decisões arquiteturais aparentes (por que esta estrutura?)
8. O que parece ser padrão versus o que parece ser inconsistência

NÃO modifique nenhum arquivo. Apenas analise e reporte."
```

**Passo A.3 — Entrevista com o time (ou documentação existente)**
- Quais são as regras de ouro que todo dev segue?
- O que já tentaram e não funcionou?
- Quais bugs já foram resolvidos que voltam a aparecer?
- O que um dev novo precisa saber para não quebrar o sistema?

---

### Fase B: Criação dos Artefatos Base (1-2 horas)

**A ordem muda em projeto existente:**
```
Código existente
    ↓
Análise do código
    ↓
CLAUDE.md / AGENTS.md (captura convenções ATUAIS, não ideais)
    ↓
SPEC.md (documenta o que o sistema JÁ faz)
    ↓
PLAN.md (mapeia o que falta implementar)
    ↓
.claudeignore (protege arquivos sensíveis)
    ↓
Agents + Skills + Rules + Hooks
```

**Passo B.1 — Criar o CLAUDE.md / AGENTS.md primeiro**

Diferente do projeto do zero, aqui você **documenta o que já existe** em vez de definir o ideal.

```markdown
# AGENTS.md — Projeto [Nome]

## Stack Atual
# Baseado na análise do código existente
- Node.js 18 + Express 4.x
- PostgreSQL 14 + Sequelize 6.x
- Jest para testes
- ESlint + Prettier configurados

## Convenções Observadas no Código
- Controllers em /src/controllers/
- Models em /src/models/
- Rotas definidas em /src/routes/index.js
- Testes em /tests/ espelhando /src/
- Variáveis: camelCase
- Funções assíncronas: async/await (não callbacks)

## Decisões Arquiteturais
- Autenticação via JWT com refresh token
- Arquitetura em camadas (controller → service → repository)
- Variáveis de ambiente via dotenv

## O que NUNCA fazer neste projeto
- Não modificar a estrutura de pastas sem alinhar
- Não adicionar dependências sem atualizar o package.json
- Não ignorar testes existentes

## Comandos de Setup
```bash
npm install
npm test
npm run dev
```
```

**Passo B.2 — Criar o SPEC.md retrospectivo**

Documente o que o sistema JÁ faz, não o que deveria fazer.

```markdown
# SPEC.md — [Nome do Projeto]

## Estado Atual
### Funcionalidades Implementadas
- [x] Autenticação JWT
- [x] CRUD de usuários
- [x] Integração com API externa X

### Funcionalidades Pendentes
- [ ] Módulo de relatórios
- [ ] Notificações por email

## Stack Confirmada
[igual ao AGENTS.md]

## Módulos Existentes
- auth/ — autenticação e autorização
- users/ — gestão de usuários
- integrations/ — conectores externos

## Fora do Escopo (definido pelo time)
- Painel administrativo (será outro projeto)
- App mobile
```

**Passo B.3 — Criar o PLAN.md para o que falta**

O PLAN.md em projetos existentes foca no **restante do trabalho**, não em reescrever o passado.

```markdown
# PLAN.md

## Sprint 2 — [próxima entrega verificável]

### Fase 1 — Módulo de Relatórios
> Dependências: autenticação e CRUD de usuários (já existem)
> Paralelismo: Task 1.1 e 1.2 podem rodar em paralelo

#### Task 1.1 — Modelagem de dados de relatórios
- Agent: backend
- Input: schema do banco atual (arquivos em /src/models/)
- Output: Novos models em /src/models/report.js com assinatura exata
- Testes críticos:
  - [ ] Criação de relatório com dados válidos
  - [ ] Rejeita dados incompletos
```

---

### Fase C: Criação dos Agents Especializados (30 min)

Em projeto existente, crie agents que **respeitam a estrutura atual**.

```markdown
---
name: backend-legacy
description: Implementa features no backend existente seguindo 
  a arquitetura em camadas já estabelecida (controller → service → repository).
  Use para tasks que envolvem /src/controllers/, /src/services/ ou /src/models/.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

## Papel
Você é um engineer especializado em manutenção de sistemas Node.js/Express.

## Responsabilidades
- Implementar novas features seguindo a estrutura EXISTENTE
- Reutilizar padrões já estabelecidos no código
- Escrever testes em /tests/ espelhando /src/

## Restrições
- NUNCA alterar a estrutura de pastas existente
- NUNCA introduzir novas dependências sem aprovação
- SEMPRE seguir o padrão de controllers/services já usado
- SEMPRE rodar `npm test` antes de marcar como concluído
```

> **Dica:** Em projetos legados, o agent de manutenção precisa de mais restrições do que o agent de projeto novo. O código existente é a fonte da verdade.

---

### Fase D: Configuração das Rules Escopadas (20 min)

As rules em projetos existentes devem refletir **o que o código já faz**, não o que deveria fazer.

```markdown
---
paths:
  - "src/controllers/**/*.js"
---

# Regras de Controllers

- Todo controller deve usar o padrão: exports.nomeDaFuncao = async (req, res) => {}
- Sempre usar try/catch e delegar erro para next(error)
- Nunca acessar models diretamente — usar services
```

---

### Fase E: Configuração dos Hooks (20 min)

**Hooks essenciais para projeto em andamento:**

1. **PreToolUse Bash** — Bloquear comandos destrutivos:
```bash
# .claude/hooks/global/block-destructive.sh
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
FORBIDDEN="^(rm -rf|git reset --hard|git clean|drop database)"
if echo "$CMD" | grep -qiE "$FORBIDDEN"; then
  echo "Comando destrutivo bloqueado: $CMD" >&2
  exit 2
fi
exit 0
```

2. **PostToolUse Edit|Write** — Rodar testes relevantes:
```bash
# .claude/hooks/global/run-affected-tests.sh
# Identifica qual arquivo foi editado e roda apenas os testes relacionados
```

3. **PreToolUse Read** — Proteger .env:
```yaml
hooks:
  PreToolUse:
    - matcher: "Read"
      hooks:
        - type: command
          command: |
            FILE=$(echo "$INPUT" | jq -r '.tool_input.file // empty')
            if echo "$FILE" | grep -qE "\\.env"; then
              echo "Arquivo .env protegido — não pode ser lido" >&2
              exit 2
            fi
            exit 0
```

---

### Fase F: Captura de Conhecimento Histórico (RAG) — Opcional

Em projetos existentes, o RAG é **ainda mais valioso** porque há meses/anos de conhecimento acumulado.

**Passo F.1 — Extrair conhecimento do histórico**
```
Prompt para o agent:
"Analise o git log, issues resolvidas e PRs merged deste projeto.
Extraia:
1. Bugs recorrentes e como foram resolvidos
2. Decisões arquiteturais importantes
3. Padrões que o time adotou ao longo do tempo
4. O que foi tentado e descartado (com o motivo)

Gere arquivos markdown em .claude/knowledge/ com as 4 categorias:
- bug
- decision
- pattern
- failure"
```

**Passo F.2 — Indexar no banco vetorial**
```bash
# Rode o script de embed nos arquivos gerados
npx ts-node .claude/scripts/embed.ts .claude/knowledge/historico-bugs.md "legacy"
```

**Passo F.3 — Configurar hooks de captura futura**
Agora que o histórico está indexado, configure os hooks para capturar novas sessões automaticamente.

---

### Fase G: Adaptação Gradual (Transição Suave)

**Não tente implementar tudo de uma vez.** A transição para o Harness em projeto existente deve ser gradual:

**Semana 1:**
- [x] CLAUDE.md/AGENTS.md criado
- [x] .claudeignore configurado
- [x] code-reviewer agent criado

**Semana 2:**
- [x] PLAN.md para a próxima sprint
- [x] 1-2 skills criadas (problemas recorrentes)
- [x] Hooks básicos (proteção .env, testes pós-edição)

**Semana 3:**
- [x] Rules escopadas para os módulos mais ativos
- [x] RAG configurado para novas sessões

**Semana 4+:**
- [x] Slash commands criados
- [x] Multi-agents em uso para novas features
- [x] RAG populado com conhecimento histórico

**Regras para transição suave:**
1. **Não retroactive** — Não force o Harness em código que já funciona. Aplique apenas em novas features e refatorações.
2. **Respeite a estrutura existente** — Se o código usa `/lib/` em vez de `/app/`, as rules e agents devem refletir isso.
3. **Testes primeiro** — Antes de aplicar qualquer mudança via agent, garanta que os testes existentes passam.
4. **Documente o que descobrir** — Todo "ah, sabia que..." do time vira um arquivo em `.claude/knowledge/`.

---

### Fase H: Uso do Harness em Projeto Existente (Operação)

**Como usar o Harness no dia a dia de um projeto em andamento:**

**Cenário 1: Corrigir um bug**
```bash
# 1. O RAG injeta automaticamente: 
#    "Este módulo teve problema similar na sessão X, resolvido com Y"

# 2. Você invoca o agent especializado
@backend-legacy Corrija o bug de timeout no módulo de relatórios

# 3. O agent lê o AGENTS.md, as Rules do módulo e o contexto RAG
# 4. Implementa a correção seguindo os padrões existentes
# 5. Hook roda os testes automaticamente
# 6. @code-reviewer valida a correção
```

**Cenário 2: Implementar nova feature**
```bash
# 1. Verifique se a feature está no PLAN.md
# 2. Se não estiver, adicione em Plan Mode primeiro

# 3. Execute via slash command
/implementar task 3.2

# 4. O agent implementa seguindo:
#    - SPEC.md (escopo)
#    - AGENTS.md (convenções)
#    - Rules do módulo (padrões locais)
#    - RAG (histórico de decisões)
```

**Cenário 3: Onboarding de novo desenvolvedor**
```bash
# O novo dev clona o repositório e já tem:
# - AGENTS.md com todas as convenções
# - SPEC.md com o que o sistema faz
# - PLAN.md com o que falta fazer
# - Agents especializados prontos para usar
# - RAG com histórico de bugs e decisões
# 
# Ele não precisa perguntar "por que fizemos assim?" — 
# a resposta está nos artefatos do Harness.
```

---

## 4. CHECKLIST DE IMPLEMENTAÇÃO

### Para Projetos do Zero
- [ ] Repositório criado e `.claudeignore` configurado
- [ ] SPEC.md com exemplos concretos e critérios de aceitação
- [ ] CLAUDE.md / AGENTS.md com convenções, stack e regras de ouro
- [ ] PLAN.md com tasks atômicas, testes críticos e gates verificáveis
- [ ] Scaffold completo (pastas, config, /health, smoke test passando)
- [ ] Agents especializados criados em `.claude/agents/`
- [ ] Skills criadas para problemas recorrentes
- [ ] Rules escopadas por path em `.claude/rules/`
- [ ] Hooks configurados (PreToolUse, PostToolUse, Stop)
- [ ] RAG configurado (opcional mas recomendado)
- [ ] Slash commands criados (`/review`, `/implementar`, `/entrega`)
- [ ] Primeira fase do PLAN.md executada com sucesso

### Para Projetos em Andamento
- [ ] Análise completa do codebase existente (sem modificações)
- [ ] AGENTS.md documentando convenções ATUAIS do projeto
- [ ] SPEC.md retrospectivo (o que já existe + o que falta)
- [ ] PLAN.md para o trabalho restante
- [ ] `.claudeignore` protegendo arquivos sensíveis
- [ ] Agents especializados respeitando a estrutura legada
- [ ] Rules escopadas refletindo padrões existentes
- [ ] Hooks de proteção (.env, comandos destrutivos, testes)
- [ ] Conhecimento histórico extraído e indexado no RAG
- [ ] Transição gradual (não forçar em código que já funciona)
- [ ] Slash commands adaptados ao workflow existente

---

## 5. ERROS MAIS COMUNS A EVITAR

### Em Projetos do Zero
1. **Pular o scaffold** — Vai direto para implementação. Resultado: cada agent cria uma estrutura diferente.
2. **PLAN.md vago** — Outputs como "implementar o módulo" sem especificar arquivo/função/assinatura.
3. **Tasks de integração na mesma fase das bases** — O agent tenta conectar coisas que ainda não existem.
4. **Agent com tools muito permissivas** — Dar Write a um revisor elimina o propósito do review.
5. **Review apenas no final** — Revisar só no final do sprint significa que erros da Fase 1 se propagaram por todo o projeto.
6. **Não versionar os artefatos** — `.claude/` deve estar no git. São parte da arquitetura.

### Em Projetos em Andamento
1. **Impor estrutura nova no legado** — Forçar `/app/` quando o projeto usa `/lib/` gera inconsistências.
2. **Ignorar o código existente** — O agent precisa ler e entender o que já foi feito antes de propor mudanças.
3. **Substituir o workflow do time de uma vez** — Introduzir multi-agents sem preparação gera resistência e erros.
4. **Esquecer o RAG histórico** — Perder meses de aprendizados porque "vamos começar do zero com a IA".
5. **Não proteger o que já funciona** — Hooks devem garantir que testes existentes continuam passando.
6. **Mixar planejamento e execução na mesma sessão** — Contamina o contexto e gera inconsistências.

---

## 6. CONCLUSÃO

O **Harness de IA** não é uma ferramenta — é uma **arquitetura de governança**. Ele transforma a relação entre humanos e IA de "automação de tarefas" para "orquestração de conhecimento".

**Para projetos do zero**, o Harness garante que a IA constrói certo desde o primeiro commit, com contexto completo, testes definidos antes do código e revisão automática.

**Para projetos em andamento**, o Harness captura o conhecimento acumulado, protege o que já funciona e permite que a IA mantenha o código sem introduzir inconsistências.

A diferença entre um projeto com Harness e um sem Harness não é a inteligência do modelo. É a **qualidade do contexto** que o modelo recebe — e a consistência com que esse contexto é aplicado em cada sessão, por cada agent, em cada task.

> **"A IA não ficou mais inteligente. O contexto ficou mais rico."**

---

*Relatório gerado com base na documentação completa da Imersão ExponencIA 2026 — Arquitetura de Agentes Inteligentes.*
*Fontes: 13 documentos técnicos cobrindo SPEC, PLAN, Scaffold, Agents, Skills, Rules, Hooks, RAG, Multi-Agents, Review, Slash Commands, Fine-tuning e Garantia de Cumprimento de SPEC.*