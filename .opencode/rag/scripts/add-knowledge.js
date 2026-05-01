// .opencode/rag/scripts/add-knowledge.js
// Adiciona entrada de conhecimento ao banco RAG
// Uso: node .opencode/rag/scripts/add-knowledge.js <category> <title> <content> [tags]

import Database from "better-sqlite3"
import { existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, "..", "rag.db")

const category = process.argv[2]
const title = process.argv[3]
const content = process.argv[4]
const tags = process.argv[5] || ""

if (!category || !title || !content) {
  console.log("Uso: add-knowledge.js <category> <title> <content> [tags]")
  console.log("Categorias: bug, decision, pattern, failure")
  process.exit(1)
}

if (!["bug", "decision", "pattern", "failure"].includes(category)) {
  console.log(`Categoria inválida: ${category}. Use: bug, decision, pattern, failure`)
  process.exit(1)
}

if (!existsSync(dbPath)) {
  console.log("Banco RAG não encontrado. Execute init-db.js primeiro.")
  process.exit(1)
}

const db = new Database(dbPath)
const stmt = db.prepare(
  "INSERT INTO knowledge_entries (category, title, content, tags) VALUES (?, ?, ?, ?)"
)
const result = stmt.run(category, title, content, tags)
db.close()

console.log(`Conhecimento adicionado com sucesso (ID: ${result.lastInsertRowid}) na categoria '${category}'.`)
