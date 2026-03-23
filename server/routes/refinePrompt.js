const express = require('express')
const router = express.Router()
const Anthropic = require('@anthropic-ai/sdk')

// ─────────────────────────────────────────────
//  POST /api/refine-prompt
//  Body: { prompt }
//
//  Uses Claude to improve the user's prompt before it goes to Leonardo.
//  This teaches: using an LLM to pre-process inputs before another AI call.
//  A real "model-first" pattern — considering what the model needs.
// ─────────────────────────────────────────────

router.post('/', async (req, res) => {
  const { prompt } = req.body

  if (!prompt?.trim()) {
    return res.status(400).json({ error: 'prompt is required' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are an expert at writing prompts for AI image generation models like Leonardo AI.

Improve the following prompt to produce a higher quality, more detailed image. Consider:
- Visual style, lighting, and mood
- Composition and framing
- Level of detail and texture
- Art direction cues that guide the model

Keep the refined prompt under 200 words. Return only the improved prompt — no explanations.

Original prompt: ${prompt}`,
        },
      ],
    })

    res.json({ refinedPrompt: message.content[0].text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
