// .opencode/rag/scripts/search-knowledge.js
// Busca conhecimento no banco RAG
// Uso: node .opencode/rag/scripts/search-knowledge.js [termo] [categoria]

import Database from "better-sqlite3"
import { existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, "..", "rag.db")

const termo = process.argv[2] || ""
const categoria = process.argv[3] || ""

if (!existsSync(dbPath)) {
  console.log("Banco RAG não encontrado. Execute init-db.js primeiro.")
  process.exit(1)
}

const db = new Database(dbPath)

let query = "SELECT id, category, title, substr(content, 1, 200) as snippet, created_at FROM knowledge_entries WHERE 1=1"
const params = []

if (termo) {
  query += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)"
  const like = `%${termo}%`
  params.push(like, like, like)
}

if (categoria) {
  query += " AND category = ?"
  params.push(categoria)
}

query += " ORDER BY created_at DESC LIMIT 20"

const rows = db.prepare(query).all(...params)
db.close()

console.log("\n=== Resultados da Busca RAG ===")
if (rows.length === 0) {
  console.log("Nenhum resultado encontrado.")
} else {
  for (const row of rows) {
    console.log(`\n[${row.category.toUpperCase()}] #${row.id} - ${row.title}`)
    console.log(`  ${row.snippet}...`)
    console.log(`  ${row.created_at}`)
  }
}
console.log()
