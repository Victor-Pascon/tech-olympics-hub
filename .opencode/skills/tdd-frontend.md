---
name: tdd-frontend
description: >
  Workflow de TDD para frontend React: escrever teste com @testing-library/react,
  ver falhar, implementar componente, ver passar.
  Use sempre que for criar componentes ou páginas.
---

# TDD — Frontend

## Quando usar
- Criar novo componente ou página
- Adicionar nova funcionalidade na UI
- Corrigir bug na interface

## Configuração
```ts
// src/test/setup.ts já configura jsdom + @testing-library/jest-dom
```

## Fluxo
### RED: Escreva o teste primeiro
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Cadastro from "./Cadastro"

describe("Cadastro", () => {
  it("deve exibir campos obrigatórios", () => {
    render(<Cadastro />)
    expect(screen.getByLabelText("Nome")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("CPF")).toBeInTheDocument()
  })

  it("deve mostrar erro ao submeter CPF inválido", async () => {
    const user = userEvent.setup()
    render(<Cadastro />)
    await user.type(screen.getByLabelText("CPF"), "00000000000")
    await user.click(screen.getByRole("button", { name: /cadastrar/i }))
    expect(screen.getByText(/CPF inválido/i)).toBeInTheDocument()
  })
})
```

### GREEN: Implemente o componente
```tsx
export default function Cadastro() {
  // implementação mínima para passar o teste
}
```
