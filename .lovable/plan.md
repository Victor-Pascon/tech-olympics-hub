

## Validações no Cadastro

### 1. Validação de CPF
- Implementar algoritmo de validação de CPF brasileiro (verificação dos dois dígitos verificadores)
- Rejeitar CPFs com todos os dígitos iguais (ex: 111.111.111-11)
- Mostrar erro inline abaixo do campo se CPF for inválido

### 2. Validação de CEP
- Consultar a API ViaCEP (`viacep.com.br/ws/{cep}/json/`) ao digitar 8 dígitos
- Se o CEP for válido, preencher automaticamente Estado, Cidade e Rua
- Se inválido, mostrar erro inline abaixo do campo

### 3. Validação de Senha com requisitos visuais
- Requisitos: mínimo 6 caracteres, letra minúscula, letra maiúscula, número, caractere especial
- Abaixo do campo de senha, exibir uma lista de requisitos com indicadores visuais (check verde quando atendido, X vermelho quando não)
- Validar no submit e também em tempo real conforme o usuário digita

### Mudanças em `Cadastro.tsx`
- Adicionar função `validateCPF` com algoritmo de dígitos verificadores
- Adicionar `fetchCEP` que consulta ViaCEP e auto-preenche endereço
- Adicionar componente de indicadores de requisitos de senha abaixo do campo
- Atualizar `handleSubmit` para validar todos os campos antes de enviar

