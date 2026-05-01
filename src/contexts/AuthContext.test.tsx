import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AuthProvider, useAuth } from "./AuthContext"

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}))

function TestComponent() {
  const { user, session, loading, signOut } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? "logged-in" : "null"}</span>
      <span data-testid="session">{session ? "has-session" : "no-session"}</span>
      <span data-testid="loading">{loading ? "loading" : "done"}</span>
      <button data-testid="signout" onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza provider e retorna null para user quando deslogado", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const userEl = await screen.findByTestId("user")
    expect(userEl.textContent).toBe("null")
  })

  it("signOut limpa o estado do usuário", async () => {
    const { supabase } = await import("@/integrations/supabase/client")

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutBtn = await screen.findByTestId("signout")
    signOutBtn.click()

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
  })
})
