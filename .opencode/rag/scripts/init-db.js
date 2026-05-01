// .opencode/rag/scripts/init-db.js
// Inicializa o banco SQLite RAG
// Uso: node .opencode/rag/scripts/init-db.js

import Database from "better-sqlite3"
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, "..", "rag.db")
const schemaPath = join(__dirname, "..", "schema.sql")

if (existsSync(dbPath)) {
  console.log(`Banco RAG já existe em ${dbPath}`)
  process.exit(0)
}

const schema = readFileSync(schemaPath, "utf-8")
const db = new Database(dbPath)
db.exec(schema)
db.close()
console.log(`Banco RAG criado em ${dbPath}`)
