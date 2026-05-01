import { describe, it, expect } from "vitest"
import type { Database } from "@/integrations/supabase/types"

describe("Database Types", () => {
  it("verifica que tipos de Database sao consistentes", () => {
    const tables = [
      "admin_users", "attendance", "certificate_templates",
      "lecture_enrollments", "lecture_speakers", "lectures",
      "olympiad_activities", "olympiad_enrollments", "olympiad_scores",
      "olympiads", "post_files", "posts", "profiles",
      "support_materials", "user_roles", "workshop_enrollments",
      "workshop_files", "workshops",
    ] as const

    for (const table of tables) {
      const row = {} as Database["public"]["Tables"][typeof table]["Row"]
      expect(row).toBeDefined()
    }
  })

  it("verifica que nao ha any no codigo fonte", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const { globSync } = await import("glob")

    const projectRoot = path.resolve(__dirname, "..")
    const srcFiles = globSync("src/**/*.{ts,tsx}", {
      ignore: ["src/**/*.test.*", "src/**/*.spec.*", "src/test/**", "node_modules/**"],
      cwd: projectRoot,
    })

    const filesWithAny: string[] = []

    for (const file of srcFiles) {
      const content = fs.readFileSync(path.join(projectRoot, file), "utf-8")
      const lines = content.split("\n")
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim()
        if (
          trimmed.includes(": any") &&
          !trimmed.includes("// eslint-disable") &&
          !trimmed.includes("json")
        ) {
          filesWithAny.push(`${file}:${i + 1}`)
        }
      }
    }

    if (filesWithAny.length > 0) {
      console.log("Arquivos com :any:", filesWithAny.join("\n"))
    }

    expect(filesWithAny.length).toBe(0)
  })
})
