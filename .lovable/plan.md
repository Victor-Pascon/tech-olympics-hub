## Plano: Corrigir exibição de participantes inscritos na olimpíada

### Diagnóstico

Investiguei o banco e o código:

1. **Banco está vazio de inscrições**: `SELECT count(*) FROM olympiad_enrollments` → `0`. Nenhum participante chegou de fato a se inscrever — provavelmente porque o admin abriu o diálogo "Participantes" antes de qualquer aluno completar a inscrição. As modalidades existem (2 em `olympiad_activities`), as RLS policies estão corretas (INSERT permite `auth.uid() = user_id`, SELECT permite admin).

2. **Bug real no `OlympiadsTab.loadParticipants` (linha 215)**: ao montar a coluna "Modalidades" do filtro "all", o código faz:
   ```ts
   (e.olympiad_activities as any)?.[0]?.nome
   ```
   Como `activity_id` é FK simples (1:1), o Supabase retorna **objeto**, não array. Logo `[0]` é sempre `undefined` → todos os participantes aparecem como "Inscrição Geral", mesmo inscritos em modalidade. Quando uma inscrição real existir, o nome da modalidade não aparece corretamente.

3. **Possível inscrição "fantasma"**: o participante hoje **só pode** se inscrever escolhendo uma modalidade (`handleEnrollModality` sempre passa `activityId`). Não existe inscrição "geral" sem `activity_id`. A label "Inscrição Geral" no admin é enganosa.

### Correções

**Arquivo: `src/components/admin/OlympiadsTab.tsx`**

1. Corrigir o acesso ao join: trocar `(e.olympiad_activities as any)?.[0]?.nome` por `(e.olympiad_activities as any)?.nome`.

2. Trocar fallback `"Inscrição Geral"` por `"—"` quando não houver `activity_id` (não existe mais "geral").

3. No filtro "Todas Modalidades" (`all`), garantir que **todos** os inscritos apareçam — incluindo os com `activity_id` definido. A lógica atual já faz isso, mas vou consolidar e adicionar logs claros.

4. Adicionar mensagem mais útil quando não há inscritos: distinguir "nenhuma inscrição existe" de "ninguém inscrito nessa modalidade específica".

### Validação

- O banco estará pronto para receber inscrições corretamente.
- Após o usuário se inscrever de fato (via ParticipantDashboard → "Ver Modalidades / Inscrever-se" → "Realizar Inscrição nesta Modalidade"), o admin abrindo Participantes verá:
  - Em "Todas Modalidades": todos os inscritos com a modalidade correta na coluna
  - Em modalidade específica: apenas os inscritos naquela modalidade

### Observação importante

A tabela `olympiad_enrollments` está atualmente **vazia**. Se após a correção o admin ainda não ver ninguém, é porque ninguém completou inscrição. Peça a um aluno teste para clicar em "Realizar Inscrição nesta Modalidade" no painel do participante e depois confira novamente.

### Arquivos alterados
- `src/components/admin/OlympiadsTab.tsx` (somente a função `loadParticipants` e mensagem vazia)

Sem alterações de banco, RLS ou edge functions.
