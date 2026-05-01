import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import Cadastro from "./Cadastro"

const mockMaybeSingle = vi.fn()
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockUpdate = vi.fn(() => Promise.resolve({ error: null }))

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  },
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

function renderCadastro() {
  return render(
    <BrowserRouter>
      <Cadastro />
    </BrowserRouter>
  )
}

describe("Cadastro", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMaybeSingle.mockReturnValue(Promise.resolve({ data: null }))
  })

  it("renderiza formulário com campos obrigatórios (nome, email, CPF, senha)", () => {
    renderCadastro()

    expect(screen.getByLabelText("Nome Completo *")).toBeInTheDocument()
    expect(screen.getByLabelText("E-mail *")).toBeInTheDocument()
    expect(screen.getByLabelText("CPF *")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha *")).toBeInTheDocument()
  })

  it("validação de CPF inválido exibe mensagem de erro", async () => {
    const user = userEvent.setup()
    renderCadastro()

    const cpfInput = screen.getByLabelText("CPF *")
    await user.type(cpfInput, "00000000000")
    cpfInput.blur()

    const errorMsg = await screen.findByText("CPF inválido.")
    expect(errorMsg).toBeInTheDocument()
  })

  it("exibe erro CPF ja cadastrado ao tentar cadastrar CPF existente", async () => {
    mockMaybeSingle.mockReturnValue(Promise.resolve({ data: { id: "existing-id" } }))

    const user = userEvent.setup()
    renderCadastro()

    await user.type(screen.getByLabelText("Nome Completo *"), "João")
    await user.type(screen.getByLabelText("E-mail *"), "joao@teste.com")
    await user.type(screen.getByLabelText("CPF *"), "52998224725")
    await user.type(screen.getByLabelText("Senha *"), "Teste@123")
    await user.type(screen.getByLabelText("Confirmar Senha *"), "Teste@123")
    await user.type(screen.getByPlaceholderText("49500-000"), "49500000")
    await user.type(screen.getByPlaceholderText("Itabaiana"), "Itabaiana")
    await user.type(screen.getByPlaceholderText(/Rua/), "Rua A")
    await user.type(screen.getByPlaceholderText("123"), "123")

    await user.click(screen.getByRole("button", { name: /criar conta/i }))

    const errorMsg = await screen.findByText("CPF já cadastrado.")
    expect(errorMsg).toBeInTheDocument()
  })
})
