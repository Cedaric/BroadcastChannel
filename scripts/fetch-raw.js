import fs from 'node:fs/promises'
import path from 'node:path'
import { fetchTelegramPosts } from './telegram-parser.js'

try {
  const dotenv = await import('dotenv')
  dotenv.default.config()
}
catch (e) {
  // optionally ignore in CI environments
}

const CHUNK_SIZE = 500
const DATA_DIR = path.resolve(process.cwd(), 'data')
const RAW_DIR = path.resolve(DATA_DIR, 'raw')

async function ensureDirs() {
  await fs.mkdir(RAW_DIR, { recursive: true })
}

/**
 * Finds the max ID downloaded so far by looking at the raw chunk files.
 */
async function getMaxScrapedId() {
  const files = await fs.readdir(RAW_DIR)
  const jsonFiles = files.filter(f => f.startsWith('raw-') && f.endsWith('.json'))
  if (jsonFiles.length === 0)
    return 0

  let maxId = 0
  for (const file of jsonFiles) {
    try {
      const content = await fs.readFile(path.join(RAW_DIR, file), 'utf-8')
      const posts = JSON.parse(content)
      for (const post of posts) {
        const id = Number.parseInt(post.id, 10)
        if (id > maxId)
          maxId = id
      }
    }
    catch (err) {
      console.error(`Error reading ${file}`, err)
    }
  }
  return maxId
}

/**
 * Calculates which raw chunk file a given ID belongs to.
 */
function getChunkFilename(id) {
  // e.g., sizes 1-500 goes to raw-500.json, 501-1000 goes to raw-1000.json
  const chunkBoundary = Math.ceil(id / CHUNK_SIZE) * CHUNK_SIZE
  return `raw-${chunkBoundary}.json`
}

/**
 * Loads a chunk, appends posts, sorts them descending, and saves.
 */
async function appendToChunk(chunkId, incrementalPosts) {
  const filename = `raw-${chunkId}.json`
  const filepath = path.join(RAW_DIR, filename)

  let existingPosts = []
  try {
    const data = await fs.readFile(filepath, 'utf-8')
    existingPosts = JSON.parse(data)
  }
  catch (err) {
    // File might not exist yet
  }

  // Merge and deduplicate by ID
  const postsMap = new Map()
  for (const p of existingPosts) postsMap.set(p.id, p)
  for (const p of incrementalPosts) postsMap.set(p.id, p)

  const merged = Array.from(postsMap.values())
  // Sort descending: newest first
  merged.sort((a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10))

  await fs.writeFile(filepath, JSON.stringify(merged, null, 2))
  console.info(`[Chunker] Wrote ${merged.length} posts to ${filename}`)
}

async function main() {
  await ensureDirs()

  const channel = process.env.CHANNEL
  if (!channel) {
    throw new Error('CHANNEL environment variable is missing!')
  }
  const staticProxy = process.env.STATIC_PROXY || '/static/'
  const reactionsEnabled = process.env.REACTIONS === 'true'

  const maxId = await getMaxScrapedId()
  console.info(`[Stage 1] Max ID found locally: ${maxId}`)

  let latestBoundary = ''
  const allNewPosts = []

  // Backwards pagination loop
  while (true) {
    const posts = await fetchTelegramPosts({
      channel,
      staticProxy,
      reactionsEnabled,
      before: latestBoundary,
    })

    if (posts.length === 0) {
      console.info('No more posts returned from Telegram.')
      break
    }

    let hitOverlap = false
    let minIdInFetch = Infinity

    for (const p of posts) {
      const pId = Number.parseInt(p.id, 10)
      if (pId < minIdInFetch)
        minIdInFetch = pId

      if (pId <= maxId) {
        hitOverlap = true
      }
      else {
        allNewPosts.push(p)
      }
    }

    if (hitOverlap) {
      console.info(`Reached overlap at ID <= ${maxId}. Stopping fetch.`)
      break
    }
    else {
      // Telegram pagination: The smallest ID in this page becomes the `before` parameter for the next page
      latestBoundary = minIdInFetch.toString()
      console.info(`Paginating backwards before ID ${latestBoundary}...`)

      // Safety limit for totally fresh runs (max ~2000 posts in one go to prevent infinite loops)
      if (allNewPosts.length > 2000 && maxId === 0) {
        console.info('Safety limit reached: fetched 2000 posts.')
        break
      }
    }
  }

  if (allNewPosts.length === 0) {
    console.info('[Stage 1] No new posts to save. Exiting.')
    return
  }

  console.info(`[Stage 1] Found ${allNewPosts.length} new posts. saving to chunks...`)

  // Group new posts by chunk ID
  const chunkMap = new Map()
  for (const p of allNewPosts) {
    const id = Number.parseInt(p.id, 10)
    const chunkId = Math.ceil(id / CHUNK_SIZE) * CHUNK_SIZE
    if (!chunkMap.has(chunkId))
      chunkMap.set(chunkId, [])
    chunkMap.get(chunkId).push(p)
  }

  // Save to individual chunks
  for (const [chunkId, chunkPosts] of chunkMap.entries()) {
    await appendToChunk(chunkId, chunkPosts)
  }

  console.info('[Stage 1] Incremental sync complete.')
}

main().catch((err) => {
  console.error('[Stage 1] Error:', err)
  process.exit(1)
})
