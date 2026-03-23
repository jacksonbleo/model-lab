// ─────────────────────────────────────────────
//  Leonardo AI Models
//
//  Model IDs can be found in the Leonardo API docs or by calling:
//  GET https://cloud.leonardo.ai/api/rest/v1/platformModels
//
//  costPerImage is approximate — actual cost depends on your plan.
//  Speed: Fast = <10s, Medium = 10–30s, Slow = 30s+
// ─────────────────────────────────────────────

export const MODELS = [
  {
    id: 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3',
    name: 'Phoenix 1.0',
    description: "Leonardo's flagship. Best quality, most versatile.",
    costPerImage: 0.022,
    speed: 'Medium',
    badge: 'Flagship',
  },
  {
    id: 'aa77f04e-3eec-4034-9c07-d0f619684628',
    name: 'Kino XL',
    description: 'Cinematic, filmic outputs. Great for narrative scenes.',
    costPerImage: 0.018,
    speed: 'Medium',
    badge: null,
  },
  {
    id: '5c232a9e-9061-4777-980a-ddc8e65647c6',
    name: 'Diffusion XL',
    description: 'Balanced quality and speed. Good for rapid iteration.',
    costPerImage: 0.010,
    speed: 'Fast',
    badge: null,
  },
  {
    id: 'b24e16ff-06e3-43eb-8d33-4416c2d75876',
    name: 'Lightning XL',
    description: 'Fastest generation. Ideal for exploring ideas quickly.',
    costPerImage: 0.006,
    speed: 'Fast',
    badge: 'Cheapest',
  },
]
