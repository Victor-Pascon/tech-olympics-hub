-- SQLite RAG Database Schema — Tech Olympics Hub
-- Categorias: bug, decision, pattern, failure

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('bug', 'decision', 'pattern', 'failure')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT DEFAULT '',
  source_file TEXT DEFAULT '',
  session_id TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  embedding BLOB,
  model TEXT DEFAULT 'all-MiniLM-L6-v2',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  summary TEXT DEFAULT '',
  agent_name TEXT DEFAULT '',
  task_ref TEXT DEFAULT '',
  status TEXT DEFAULT 'completed' CHECK(status IN ('active', 'completed', 'failed')),
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge_entries(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_created ON knowledge_entries(created_at);
