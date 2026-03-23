const Database = require('better-sqlite3')
const path = require('path')

// Database file lives at the project root (gitignored)
const db = new Database(path.resolve(__dirname, '../../model-lab.db'))

// Create table on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt      TEXT    NOT NULL,
    refined_prompt TEXT,
    model       TEXT    NOT NULL,
    image_url   TEXT,
    latency_ms  INTEGER,
    cost_usd    REAL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

module.exports = db
