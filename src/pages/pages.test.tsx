import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

function mockChain() {
  const chain: any = {}
  const methods = ["select", "eq", "order", "in", "limit", "single", "maybeSingle"]
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  chain.then = (resolve: any) => resolve({ data: [], error: null })
  chain.limit = vi.fn(() => Promise.resolve({ data: [], error: null }))
  return chain
}

const chain = mockChain()

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => chain),
    auth: {
      signInWithPassword: vi.fn(() => Promise.resolve({ error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ error: null })),
      updateUser: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "" } })),
      })),
    },
    rpc: vi.fn(() => Promise.resolve({ data: true, error: null })),
  },
}))

vi.mock("@uiw/react-md-editor", () => ({ default: () => null }))

const mocks = vi.hoisted(() => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
  useAuth: vi.fn(() => ({ user: null, session: null, loading: false, signOut: vi.fn() })),
}))

vi.mock("@/hooks/use-toast", () => ({ useToast: mocks.useToast }))
vi.mock("@/contexts/AuthContext", () => ({ useAuth: mocks.useAuth }))

async function renderPage(path: string) {
  window.history.pushState({}, "", path)
  const mod = await import(`./${path.replace("/", "") === "not-found" ? "NotFound" : path === "/" ? "Index" : path.charAt(0).toUpperCase() + path.slice(1)}`)
  const Component = mod.default
  return render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  )
}

describe("Page smoke tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rota / renderiza sem erro", async () => {
    const Index = (await import("./Index")).default
    const { container } = render(<BrowserRouter><Index /></BrowserRouter>)
    expect(container.textContent).toContain("Olimpíada")
  })

  it("rota /login renderiza formulário", async () => {
    const Login = (await import("./Login")).default
    render(<BrowserRouter><Login /></BrowserRouter>)
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
  })

  it("rota * renderiza NotFound", async () => {
    window.history.pushState({}, "", "/rota-inexistente")
    const NotFound = (await import("./NotFound")).default
    render(<BrowserRouter><NotFound /></BrowserRouter>)
    expect(screen.getByText("404")).toBeInTheDocument()
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it("rota /admin-login renderiza título Admin", async () => {
    const AdminLogin = (await import("./AdminLogin")).default
    render(<BrowserRouter><AdminLogin /></BrowserRouter>)
    expect(screen.getByText("Acesso Administrativo")).toBeInTheDocument()
  })

  it("rota /validar renderiza validação de certificado", async () => {
    const CertValidation = (await import("./CertificateValidation")).default
    const { container } = render(<BrowserRouter><CertValidation /></BrowserRouter>)
    expect(container.textContent).toContain("Validar")
  })
})
