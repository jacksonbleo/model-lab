const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.resolve(__dirname, '../../model-lab.db')

let db

async function getDb() {
  if (db) return db

  const SQL = await initSqlJs()

  // Load existing database file if it exists, otherwise create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // Create table on first run
  db.run(`
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
  save()

  return db
}

function save() {
  if (!db) return
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// Helper: run a SELECT and return an array of objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

// Helper: run an INSERT/UPDATE and return lastInsertRowid
function runInsert(sql, params = []) {
  db.run(sql, params)
  const result = db.exec('SELECT last_insert_rowid() as id')
  save()
  return { lastInsertRowid: result[0].values[0][0] }
}

module.exports = { getDb, queryAll, runInsert }
