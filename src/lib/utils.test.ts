import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("mescla classes corretamente", () => {
    const result = cn("px-4", "py-2", "bg-red-500")
    expect(result).toContain("px-4")
    expect(result).toContain("py-2")
    expect(result).toContain("bg-red-500")
  })

  it("trata valores undefined sem quebrar", () => {
    const result = cn("px-4", undefined, "py-2")
    expect(result).toContain("px-4")
    expect(result).toContain("py-2")
    expect(result).not.toContain("undefined")
  })

  it("resolve conflitos de Tailwind (ultima classe vence)", () => {
    const result = cn("px-4", "px-6")
    expect(result).toBe("px-6")
  })

  it("aceita arrays de classes", () => {
    const result = cn(["px-4", "py-2"])
    expect(result).toContain("px-4")
    expect(result).toContain("py-2")
  })

  it("retorna string vazia para nenhum argumento", () => {
    const result = cn()
    expect(result).toBe("")
  })
})
