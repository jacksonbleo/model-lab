// ─────────────────────────────────────────────
//  Model Lab — Setup Check
//  Run this before the workshop: npm run setup-check
// ─────────────────────────────────────────────

import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '.env') })

const CHECK = '✅'
const FAIL = '❌'
const WARN = '⚠️ '

async function checkSetup() {
  console.log('\n🔬 Model Lab — Setup Check\n')
  console.log('─'.repeat(40))

  let allGood = true

  // 1. Check .env file exists and has required keys
  console.log('\n📋 Environment Variables\n')

  const required = ['LEONARDO_API_KEY', 'ANTHROPIC_API_KEY']
  for (const key of required) {
    if (process.env[key] && !process.env[key].includes('your_')) {
      console.log(`  ${CHECK} ${key} found`)
    } else {
      console.log(`  ${FAIL} ${key} missing or still set to placeholder`)
      console.log(`       → Copy .env.example to .env and fill in your key`)
      allGood = false
    }
  }

  // 2. Check Leonardo API
  console.log('\n🎨 Leonardo AI\n')
  if (process.env.LEONARDO_API_KEY && !process.env.LEONARDO_API_KEY.includes('your_')) {
    try {
      const res = await fetch('https://cloud.leonardo.ai/api/rest/v1/me', {
        headers: { Authorization: `Bearer ${process.env.LEONARDO_API_KEY}` },
      })
      if (res.ok) {
        const data = await res.json()
        const username = data.user_details?.[0]?.user?.username || 'authenticated'
        console.log(`  ${CHECK} Connected (${username})`)
      } else {
        console.log(`  ${FAIL} API key invalid — got status ${res.status}`)
        console.log(`       → Check your key at https://app.leonardo.ai/settings/api`)
        allGood = false
      }
    } catch (e) {
      console.log(`  ${FAIL} Could not reach Leonardo API: ${e.message}`)
      allGood = false
    }
  } else {
    console.log(`  ${WARN} Skipped (no key set)`)
  }

  // 3. Check Anthropic key format
  console.log('\n🤖 Anthropic (Claude)\n')
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_')) {
    if (process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
      console.log(`  ${CHECK} API key format looks correct`)
    } else {
      console.log(`  ${WARN} Key format looks unusual — double-check it`)
      console.log(`       → Keys should start with sk-ant-`)
    }
  } else {
    console.log(`  ${WARN} Skipped (no key set)`)
  }

  // 4. Node version check
  console.log('\n🟢 Node.js\n')
  const nodeVersion = parseInt(process.version.slice(1).split('.')[0])
  if (nodeVersion >= 18) {
    console.log(`  ${CHECK} Node ${process.version} (fetch built-in supported)`)
  } else {
    console.log(`  ${FAIL} Node ${process.version} — please upgrade to v18 or higher`)
    console.log(`       → Run: nvm install 18 && nvm use 18`)
    allGood = false
  }

  // Result
  console.log('\n' + '─'.repeat(40))
  if (allGood) {
    console.log('\n✨ All good! You\'re ready to go.\n')
    console.log('   Run: npm run dev\n')
  } else {
    console.log('\n⚠️  Fix the issues above before the workshop.\n')
    console.log('   Run this check again once you\'ve made changes.\n')
  }
}

checkSetup()
