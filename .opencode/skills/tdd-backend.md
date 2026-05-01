---
name: tdd-backend
description: >
  Workflow de TDD para backend: escrever teste → ver falhar → implementar → ver passar.
  Use sempre que for implementar lógica de backend ou criar novos testes.
---

# TDD — Backend

## Quando usar
- Toda implementação de backend
- Correção de bugs no backend
- Refatoração de código existente

## Fluxo
### RED: Escreva o teste primeiro
```ts
import { describe, it, expect } from "vitest"

describe("createProfile", () => {
  it("deve criar perfil com dados válidos", async () => {
    const result = await createProfile({ nome: "João", email: "joao@teste.com" })
    expect(result.data).toBeDefined()
    expect(result.error).toBeNull()
  })

  it("deve rejeitar email inválido", async () => {
    const result = await createProfile({ nome: "João", email: "invalido" })
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
  })
})
```

### GREEN: Implemente o mínimo para passar
```ts
export async function createProfile(data: { nome: string; email: string }) {
  if (!data.email.includes("@")) {
    return { data: null, error: "Email inválido" }
  }
  // implementação real...
  return { data: result, error: null }
}
```

### REFACTOR: Melhore sem quebrar testes
- Extraia validações
- Adicione tipos
- Otimize queries
