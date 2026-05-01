// .opencode/rag/scripts/capture-learning.js
// Captura aprendizado da sessão atual e salva no RAG + knowledge/
// Uso: node .opencode/rag/scripts/capture-learning.js <category> <title> <content>

import Database from "better-sqlite3"
import { existsSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, "..", "rag.db")
const knowledgeDir = join(__dirname, "..", "..", "knowledge")

const category = process.argv[2]
const title = process.argv[3]
const content = process.argv[4]

if (!category || !title || !content) {
  console.log("Uso: capture-learning.js <category> <title> <content>")
  process.exit(1)
}

// Cria diretório knowledge se não existir
if (!existsSync(knowledgeDir)) {
  mkdirSync(knowledgeDir, { recursive: true })
}

// Salva como arquivo markdown (versionado no git)
const date = new Date().toISOString().split("T")[0]
const safeTitle = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
const filename = `${date}-${safeTitle}.md`
const filepath = join(knowledgeDir, filename)

const mdContent = `# ${category.charAt(0).toUpperCase() + category.slice(1)}: ${title}

## Data
${new Date().toLocaleString("pt-BR")}

## Categoria
${category}

## Descrição
${content}
`

writeFileSync(filepath, mdContent, "utf-8")
console.log(`Conhecimento salvo em: ${filepath}`)

// Salva no SQLite
if (!existsSync(dbPath)) {
  console.log("Aviso: Banco RAG não encontrado. Apenas arquivo markdown foi salvo.")
  process.exit(0)
}

const db = new Database(dbPath)
const stmt = db.prepare(
  "INSERT INTO knowledge_entries (category, title, content, source_file) VALUES (?, ?, ?, ?)"
)
stmt.run(category, title, content, filename)
db.close()

console.log(`Conhecimento salvo no RAG (SQLite + markdown).`)
