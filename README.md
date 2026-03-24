# Model Lab

A workshop project for comparing Leonardo AI models side by side. Enter a prompt, optionally refine it with Claude, generate images across multiple models, and see cost and latency data for each result.

Built as a learning tool for designers exploring AI-native product thinking, model-first design, cost/quality trade-offs, and how to build with AI APIs.

---

## What it does

- Enter an image generation prompt
- Optionally hit **Refine with Claude** to improve it before generating
- Select up to 3 Leonardo models to compare
- Generate images in parallel and see them side by side
- Track latency (seconds) and cost per generation
- Browse your full generation history

---

## Prerequisites

Before you start, you'll need:

- **Node.js v18 or higher**, download from [nodejs.org](https://nodejs.org)
- **A Leonardo AI API key**, sign in to [app.leonardo.ai](https://app.leonardo.ai), then go to API
- **An Anthropic API key**, get one at [console.anthropic.com](https://console.anthropic.com)

---

## Setup

**1. Install dependencies**

Open a terminal in this folder and run:

```bash
npm run install:all
```

This installs packages for the root, the client (React app), and the server (Express API). It takes a minute or two.

**2. Configure your API keys**

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` in any text editor and replace the placeholder values with your actual API keys:

```
LEONARDO_API_KEY=your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

**3. Check everything is working**

```bash
npm run setup-check
```

This validates your API keys and Node version. Fix anything it flags before moving on.

**4. Start the app**

```bash
npm run dev
```

This starts both the frontend and backend together. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Commands


| Command               | What it does                                       |
| --------------------- | -------------------------------------------------- |
| `npm run install:all` | Install all dependencies (run once on first setup) |
| `npm run setup-check` | Validate API keys and environment                  |
| `npm run dev`         | Start the app (frontend + backend together)        |


---

## Project structure

```
model-lab/
├── client/                   # React frontend (Vite + Shadcn + Tailwind)
│   └── src/
│       ├── components/       # UI components
│       │   ├── GenerateView  # Main generate + compare screen
│       │   ├── HistoryView   # Past generations browser
│       │   ├── ResultCard    # Individual result with image + metadata
│       │   └── ui/           # Shadcn base components (button, card, etc.)
│       └── lib/
│           ├── models.js     # Leonardo model definitions + cost data
│           └── utils.js      # Tailwind class utility (cn)
│
├── server/                   # Express backend (Node.js)
│   ├── index.js              # Server entry point
│   ├── db/
│   │   └── database.js       # SQLite setup (creates model-lab.db on first run)
│   └── routes/
│       ├── generate.js       # POST /api/generate, calls Leonardo API
│       ├── refinePrompt.js   # POST /api/refine-prompt, calls Claude API
│       └── history.js        # GET /api/history, reads generation history
│
├── .env.example              # Template for required environment variables
├── .env                      # Your actual keys, never commit this
├── setup-check.js            # Pre-flight check script
└── package.json              # Root config, runs client + server together
```

---

## How it works

The **client** is a React app served by Vite on port 5173. It makes API calls to `/api/`* which Vite proxies to the Express **server** running on port 3001.

The server keeps your API keys private (they never go to the browser) and handles:

- Calling the Leonardo API to kick off image generation jobs, then polling until they complete
- Calling the Claude API to refine prompts
- Saving each generation to a local SQLite database (`model-lab.db`)

The database file is created automatically in the project root on first run. It's gitignored, your generation history stays local.

---

## Extending it (your homework)

This is a starting point. Once you've got it running, try extending it, use Claude Code to help you build:

- Add a **notes field** to each generation so you can annotate results
- Build a **prompt library** to save and reuse prompts you like
- Add a **model cost calculator** that estimates total spend across a session
- Show a **token breakdown** or confidence score alongside each image
- Let users **rate results** (👍/👎) and filter history by rating
- Add **side-by-side diff view** to make model comparison easier to read

The goal is to get comfortable prompting Claude Code iteratively, describe what you want, see what it builds, refine the prompt, repeat.

---

## Tech stack


| Layer             | Technology              | Why                                         |
| ----------------- | ----------------------- | ------------------------------------------- |
| Frontend          | React + Vite            | Fast dev server, industry standard          |
| UI                | Shadcn + Tailwind v4    | Component library used at Leonardo          |
| Backend           | Express (Node.js)       | Simple, well-documented API server          |
| Database          | SQLite (better-sqlite3) | Local, zero-config, no account needed       |
| Image gen         | Leonardo AI API         | Multi-model image generation with cost data |
| Prompt refinement | Anthropic Claude API    | LLM-assisted prompt improvement             |
| Dev tooling       | concurrently            | Run client + server with one command        |


