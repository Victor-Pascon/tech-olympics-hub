---
name: ui-conventions
description: >
  Gera componentes React seguindo o padrão do projeto: shadcn/ui + Tailwind,
  TypeScript estrito, lucide-react para ícones. Use sempre que for criar
  componente, página, layout ou tela no frontend.
---

# UI Conventions

## Quando usar
- Criar novo componente React
- Adicionar página ou rota
- Criar layout ou container

## Quando NÃO usar
- Scripts de migração de banco
- Edge Functions
- Testes (usar tdd-frontend)

## Passo a passo
### 1. Identificar o componente base shadcn/ui adequado
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

### 2. Usar Tailwind para estilização (não CSS modules)
```tsx
<div className="flex items-center gap-4 p-6">
```

### 3. Ícones via lucide-react
```tsx
import { User, Settings } from "lucide-react"
```

## Padrões do Projeto
- Tema escuro com `bg-background text-foreground`
- Cards com borda sutil: `border border-border rounded-lg`
- Botão primário: `variant="default"` do shadcn
- Formulários: `react-hook-form` + `zod`
- Notificações: `sonner` (toast)
- Data: `date-fns` para formatação

## Exemplos
### Input esperado
"Crie um card de estatísticas para o dashboard"

### Output esperado
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
```
