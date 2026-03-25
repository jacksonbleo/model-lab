const express = require('express')
const router = express.Router()
const { runInsert } = require('../db/database')

// ─────────────────────────────────────────────
//  POST /api/generate
//  Body: { prompt, refinedPrompt, models: [{ id, name, costPerImage }] }
//
//  Leonardo image generation is async — we kick off a generation job,
//  then poll until it's complete. This teaches a real pattern: many AI
//  APIs are async with webhooks or polling, not instant responses.
// ─────────────────────────────────────────────

const LEONARDO_BASE = 'https://cloud.leonardo.ai/api/rest/v1'
const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30 // ~60 seconds timeout

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateForModel(prompt, model, apiKey) {
  const startTime = Date.now()

  // 1. Kick off the generation job
  const initRes = await fetch(`${LEONARDO_BASE}/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      modelId: model.id,
      width: 512,
      height: 512,
      num_images: 1,
    }),
  })

  if (!initRes.ok) {
    const err = await initRes.text()
    throw new Error(`Leonardo API error (${initRes.status}): ${err}`)
  }

  const initData = await initRes.json()
  const generationId = initData.sdGenerationJob?.generationId
  if (!generationId) throw new Error('No generation ID returned')

  // 2. Poll until complete
  let imageUrl = null
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS)

    const pollRes = await fetch(`${LEONARDO_BASE}/generations/${generationId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!pollRes.ok) continue

    const pollData = await pollRes.json()
    const gen = pollData.generations_by_pk

    if (gen?.status === 'COMPLETE' && gen.generated_images?.length > 0) {
      imageUrl = gen.generated_images[0].url
      break
    }

    if (gen?.status === 'FAILED') {
      throw new Error('Generation failed on Leonardo\'s side')
    }
  }

  if (!imageUrl) throw new Error('Generation timed out')

  return {
    imageUrl,
    latencyMs: Date.now() - startTime,
  }
}

router.post('/', async (req, res) => {
  const { prompt, refinedPrompt, models } = req.body

  if (!prompt || !models?.length) {
    return res.status(400).json({ error: 'prompt and models are required' })
  }

  if (!process.env.LEONARDO_API_KEY) {
    return res.status(500).json({ error: 'LEONARDO_API_KEY is not set' })
  }

  const activePrompt = refinedPrompt || prompt
  const results = []

  // Generate for each model (sequentially to avoid rate limits)
  for (const model of models) {
    try {
      const { imageUrl, latencyMs } = await generateForModel(
        activePrompt,
        model,
        process.env.LEONARDO_API_KEY
      )

      // Save to database
      const info = runInsert(
        `INSERT INTO generations (prompt, refined_prompt, model, image_url, latency_ms, cost_usd)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [prompt, refinedPrompt || null, model.name, imageUrl, latencyMs, model.costPerImage]
      )

      results.push({
        id: info.lastInsertRowid,
        model: model.name,
        imageUrl,
        latencyMs,
        costUsd: model.costPerImage,
      })
    } catch (err) {
      // Don't fail the whole request if one model errors
      results.push({ model: model.name, error: err.message })
    }
  }

  res.json({ results })
})

module.exports = router
