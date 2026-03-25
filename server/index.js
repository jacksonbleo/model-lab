const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const { getDb } = require('./db/database')
const generateRoute = require('./routes/generate')
const refinePromptRoute = require('./routes/refinePrompt')
const historyRoute = require('./routes/history')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/generate', generateRoute)
app.use('/api/refine-prompt', refinePromptRoute)
app.use('/api/history', historyRoute)

// Health check — useful for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    leonardo: !!process.env.LEONARDO_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  })
})

// Initialize database, then start server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Model Lab server running on http://localhost:${PORT}`)
    console.log(`   Leonardo key: ${process.env.LEONARDO_API_KEY ? '✅ set' : '❌ missing'}`)
    console.log(`   Anthropic key: ${process.env.ANTHROPIC_API_KEY ? '✅ set' : '❌ missing'}\n`)
  })
})
