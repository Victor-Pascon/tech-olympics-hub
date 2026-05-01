---
paths:
  - "src/pages/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Regras de Frontend

- Componentes em PascalCase, arquivos em kebab-case (UI) ou PascalCase (páginas/componentes)
- Ícones exclusivamente de `lucide-react`
- Estilização via Tailwind CSS classes — sem CSS modules, sem styled-components
- Usar `cn()` de `@/lib/utils` para merge de classes condicionais
- shadcn/ui é a biblioteca de componentes base — não criar componentes do zero se existir equivalentes
- Formulários com `react-hook-form` + validação `zod`
- Rotas definidas em `src/App.tsx` com `react-router-dom`
- Toda página deve usar `Layout` como wrapper
