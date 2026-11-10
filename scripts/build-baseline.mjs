#!/usr/bin/env node
/**
 * Build `data/baseline.json` for the model-price-radar plugin.
 *
 * Sources:
 *  - https://models.dev/api.json          official per-provider prices and metadata
 *  - https://openrouter.ai/api/v1/models  comparison price for the detail view
 *  - arena-ai-leaderboards (GitHub)       LMArena score snapshots
 *  - data/capability-ratings.json         researched model notes and scenario grades
 *  - data/price-notes.json                peak/off-peak and promotion caveats
 *
 * The output is the *bundled* baseline: the plugin ships it so the panel shows
 * real numbers before the first network call, and replaces it at runtime when
 * a refresh succeeds. Run this to refresh the bundled copy:
 *
 *   node scripts/build-baseline.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  MODELS_DEV_URL,
  OPENROUTER_URL,
  attachPriceNotes,
  attachReferencePrices,
  attachDescriptionsZh,
  catalogFromModelsDev,
  fetchLiveFx,
  findArenaSnapshot,
  getJson,
  groupProviders,
  markFlagships,
  routerIndex,
} from '../lib/sources.js'
import { hasCjk } from '../lib/translate.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(HERE, '..', 'data', 'baseline.json')
const RATINGS = path.resolve(HERE, '..', 'data', 'capability-ratings.json')
const NOTES = path.resolve(HERE, '..', 'data', 'price-notes.json')
const DESCRIPTIONS = path.resolve(HERE, '..', 'data', 'descriptions-zh.json')
const FLAGSHIPS = path.resolve(HERE, '..', 'data', 'flagships.json')

/** Attach researched notes by exact model name. */
function withResearch(models, entries) {
  const byName = new Map(entries.map((entry) => [String(entry.name || '').toLowerCase(), entry]))
  return models.map((model) => {
    const entry = byName.get(String(model.name || '').toLowerCase())
    return entry ? { ...model, research: entry } : model
  })
}

async function main() {
  const started = Date.now()
  const [modelsDev, openRouter, ratingsRaw, notesRaw, descriptionsRaw, flagshipsRaw] = await Promise.all([
    getJson(MODELS_DEV_URL, { timeoutMs: 40_000 }),
    getJson(OPENROUTER_URL, { timeoutMs: 40_000 }),
    readFile(RATINGS, 'utf8').then((text) => JSON.parse(text)).catch(() => ({ entries: [] })),
    readFile(NOTES, 'utf8').then((text) => JSON.parse(text)).catch(() => ({ notes: [] })),
    readFile(DESCRIPTIONS, 'utf8').then((text) => JSON.parse(text)).catch(() => ({ entries: {} })),
    readFile(FLAGSHIPS, 'utf8').then((text) => JSON.parse(text)).catch(() => ({ flagships: {} })),
  ])

  const ratingEntries = Array.isArray(ratingsRaw) ? ratingsRaw : (ratingsRaw.entries || [])
  const now = Date.now()
  const { providers, models: officialModels } = catalogFromModelsDev(modelsDev, { now })

  // OpenRouter is not a provider row: it only contributes the comparison price
  // shown beside the official one, so a miss here is a missing column, not a
  // missing model.
  let models = attachReferencePrices(officialModels, routerIndex(openRouter))
  models = attachPriceNotes(models, notesRaw)
  models = attachDescriptionsZh(models, descriptionsRaw)
  models = markFlagships(models, flagshipsRaw)
  models = models.map((model) => (model.description && hasCjk(model.description)
    ? { ...model, descriptionZh: model.description }
    : model))
  models = withResearch(models, ratingEntries)

  const matched = models.filter((model) => model.research).length
  const unmatched = ratingEntries.filter((entry) => !models.some((model) => model.name === entry.name))
  if (unmatched.length) {
    console.warn(`ratings without a catalogue row: ${unmatched.map((entry) => entry.name).join(', ')}`)
  }
  const compared = models.filter((model) => model.referencePrice).length
  const noted = models.filter((model) => model.priceNotes).length

  let fx
  try {
    fx = await fetchLiveFx()
  } catch (error) {
    console.warn(`fx: ${error.message}; using the reference rate`)
    fx = { usdToCny: 6.6713, reference: 7.1, asOf: undefined, source: '参考值' }
  }

  const arena = await findArenaSnapshot()

  const payload = {
    version: 5,
    generatedAt: new Date(now).toISOString(),
    refreshedAt: new Date(now).toISOString(),
    status: 'baseline',
    fx,
    sources: {
      prices: MODELS_DEV_URL,
      reference: OPENROUTER_URL,
      arena: 'https://github.com/oolong-tea-2026/arena-ai-leaderboards',
      arenaDate: arena.date,
    },
    groups: groupProviders(providers),
    providers,
    models,
    research: { entries: ratingEntries, updatedAt: ratingsRaw.updatedAt || null },
    arena: { date: arena.date, boards: arena.boards || {} },
    warnings: [],
  }

  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, `${JSON.stringify(payload)}\n`, 'utf8')
  const bytes = Buffer.byteLength(JSON.stringify(payload))
  console.log(`wrote ${OUT}`)
  console.log(
    `providers=${providers.length} models=${models.length} research=${matched}/${ratingEntries.length} `
    + `compared=${compared} noted=${noted} arena=${arena.date} fx=${fx.usdToCny} `
    + `size=${(bytes / 1024).toFixed(0)}KiB in ${Date.now() - started}ms`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
