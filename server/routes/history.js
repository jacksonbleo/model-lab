const express = require('express')
const router = express.Router()
const db = require('../db/database')

// ─────────────────────────────────────────────
//  GET /api/history
//  Returns all past generations, newest first
// ─────────────────────────────────────────────

router.get('/', (req, res) => {
  try {
    const generations = db.prepare(`
      SELECT * FROM generations
      ORDER BY created_at DESC
      LIMIT 100
    `).all()

    res.json({ generations })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
