/**
 * Host half of the model price radar.
 *
 * One same-origin JSON API under `/price-radar` serves the price catalogue the
 * left-sidebar panel and the composer dock render:
 *
 *   GET  /price-radar/catalog      cached catalogue, refreshed in the background
 *   POST /price-radar/refresh      force a live fetch and answer with the result
 *   POST /price-radar/translate    translate new English descriptions to Chinese
 *   GET  /price-radar/health       version, cache age and source state
 *
 * Prices come from public sources (models.dev for the official list, OpenRouter
 * for a comparison price, an arena snapshot mirror for leaderboards) and never
 * from guesswork: a source that fails is reported in `warnings` and the previous
 * values stay visible with their own timestamp. Model notes and scenario grades
 * come from `data/capability-ratings.json`, a researched file with sources and a
 * confidence level per entry.
 */
import { readFileSync } from 'node:fs'
import {
  OPENROUTER_URL,
  MODELS_DEV_URL,
  EXCLUDED_MODEL,
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
} from './lib/sources.js'
import {
  descriptionKey,
  hasCjk,
  translateDescriptions,
  translationTarget,
} from './lib/translate.js'

function readJson(relative) {
  return JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'))
}

// Read bundled files without JSON import attributes so the Host half loads on
// every Node version the harness ships with.
const baseline = readJson('./data/baseline.json')
const capability = readJson('./data/capability-ratings.json')
const priceNotes = readJson('./data/price-notes.json')
const descriptionsZh = readJson('./data/descriptions-zh.json')
const flagships = readJson('./data/flagships.json')

const PREFIX = '/price-radar'
const FRESH_MS = 30 * 60 * 1000
const ARENA_FRESH_MS = 12 * 60 * 60 * 1000
const TRANSLATE_PER_REFRESH = 24

/** Mutable cache owned by one activation. */
function createCache(seed) {
  const initial = {
    ...seed,
    models: markFlagships(
      attachDescriptionsZh(attachPriceNotes(seed.models || [], priceNotes), descriptionsZh),
      flagships,
    ),
  }
  const age = Date.now() - (Date.parse(seed.refreshedAt || seed.generatedAt || '') || 0)
  return {
    payload: initial,
    // A bundled baseline is fresh enough to render immediately, but it should
    // not be presented as live: the panel labels `status: 'baseline'` until a
    // network refresh succeeds.
    fetchedAt: age < FRESH_MS ? Date.now() : 0,
    arenaCheckedAt: 0,
    inflight: null,
    translations: new Map(),
  }
}

function researchEntries() {
  const entries = Array.isArray(capability.entries)
    ? capability.entries
    : Array.isArray(capability)
      ? capability
      : []
  return { entries, updatedAt: capability.updatedAt || null }
}

/** Attach the researched study to a row by exact name. */
function withResearch(models, research) {
  const byName = new Map()
  for (const entry of research.entries) {
    if (entry && entry.name) byName.set(entry.name.toLowerCase(), entry)
  }
  return models.map((model) => {
    const entry = byName.get(String(model.name || '').toLowerCase())
    return entry ? { ...model, research: entry } : model
  })
}

/** Attach cached translations; descriptions never leave English unlabelled. */
function withTranslations(models, translations) {
  return models.map((model) => {
    // A hand-checked Chinese blurb always wins over a machine translation.
    if (model.descriptionZh) return model
    const text = model.description
    if (!text) return model
    if (hasCjk(text)) return { ...model, descriptionZh: text }
    const hit = translations.get(descriptionKey(text))
    return hit ? { ...model, descriptionZh: hit.zh } : model
  })
}

/** Merge fresh sources onto the previous payload, keeping old values on failure. */
function mergePayloads(previous, { modelsDev, openRouter, fx, arena, warnings, research, translations }) {
  let providers = previous.providers
  let models = previous.models
  if (modelsDev) {
    const official = catalogFromModelsDev(modelsDev)
    providers = official.providers
    models = official.models
  }

  // OpenRouter only supplies a comparison price. When its fetch fails, carry the
  // previous comparison forward by model id instead of dropping the column.
  const index = openRouter ? routerIndex(openRouter) : null
  if (index) {
    models = attachReferencePrices(models, index)
  } else if (previous.models.some((row) => row.referencePrice)) {
    const carried = new Map(previous.models.map((row) => [row.id, row.referencePrice]))
    models = models.map((row) => (carried.has(row.id) ? { ...row, referencePrice: carried.get(row.id) } : row))
  }
  models = attachPriceNotes(models, priceNotes)
  models = attachDescriptionsZh(models, descriptionsZh)
  models = markFlagships(models, flagships)

  const boards = arena && arena.boards ? arena.boards : (previous.arena && previous.arena.boards) || {}
  const arenaDate = arena && arena.date ? arena.date : (previous.arena && previous.arena.date) || null

  return {
    ...previous,
    version: Math.max(5, previous.version || 0),
    refreshedAt: new Date().toISOString(),
    status: modelsDev ? (openRouter ? 'live' : 'partial') : 'partial',
    fx: fx || previous.fx,
    sources: {
      ...previous.sources,
      prices: MODELS_DEV_URL,
      reference: OPENROUTER_URL,
      arena: 'https://github.com/oolong-tea-2026/arena-ai-leaderboards',
      arenaDate,
    },
    groups: groupProviders(providers),
    providers,
    models: withTranslations(withResearch(models, research), translations),
    research,
    arena: { date: arenaDate, boards },
    warnings,
  }
}

function sendJson(res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8')
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': body.length,
    'cache-control': 'no-store',
  })
  res.end(body)
}

function originAllowed(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 64 * 1024) return
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim()
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export const inject = ['webServer', 'llm']

export function apply(ctx) {
  const cache = createCache(baseline)
  const logger = ctx.logger
  const research = researchEntries()
  cache.payload = {
    ...cache.payload,
    research,
    models: withTranslations(withResearch(cache.payload.models || [], research), cache.translations),
  }

  async function runTranslations(signal, limit) {
    const llm = ctx.get('llm')
    if (!llm) return 0
    const target = translationTarget(ctx)
    // Curated models first: they are the ones a user opens.
    const curated = new Set(research.entries.map((entry) => String(entry.name || '').toLowerCase()))
    const ordered = [...cache.payload.models].sort((a, b) => {
      const aHit = curated.has(String(a.name || '').toLowerCase()) ? 0 : 1
      const bHit = curated.has(String(b.name || '').toLowerCase()) ? 0 : 1
      return aHit - bHit
    })
    const descriptions = ordered
      .map((model) => model.description)
      .filter((text) => text && !EXCLUDED_MODEL.test(text))
      .slice(0, limit)
    return translateDescriptions({
      llm,
      request: target,
      descriptions,
      cache: cache.translations,
      signal,
      logger,
    })
  }

  async function refresh({ force = true } = {}) {
    if (cache.inflight && !force) return cache.inflight
    const run = (async () => {
      const warnings = []
      const signal = AbortSignal.timeout(120_000)
      const [modelsDevResult, openRouterResult] = await Promise.allSettled([
        getJson(MODELS_DEV_URL, { signal, timeoutMs: 30_000 }),
        getJson(OPENROUTER_URL, { signal, timeoutMs: 30_000 }),
      ])
      if (modelsDevResult.status === 'rejected') {
        warnings.push(`models.dev 刷新失败：${String(modelsDevResult.reason && modelsDevResult.reason.message)}`)
      }
      if (openRouterResult.status === 'rejected') {
        warnings.push(`OpenRouter 刷新失败：${String(openRouterResult.reason && openRouterResult.reason.message)}`)
      }

      const wantArena = force
        || Date.now() - cache.arenaCheckedAt > ARENA_FRESH_MS
        || !cache.payload.arena
      let arena = null
      if (wantArena) {
        try {
          const knownDate = cache.payload.arena && cache.payload.arena.date
          const found = await findArenaSnapshot({ knownDate, signal })
          if (!found.unchanged) arena = found
          cache.arenaCheckedAt = Date.now()
          if (!found.date) warnings.push('榜单快照暂时没有可用的数据行')
        } catch (error) {
          warnings.push(`榜单快照刷新失败：${String(error && error.message)}`)
        }
      }

      let fx = null
      try {
        fx = await fetchLiveFx({ signal })
      } catch (error) {
        warnings.push(`汇率刷新失败：${String(error && error.message)}`)
      }

      if (modelsDevResult.status === 'rejected' && openRouterResult.status === 'rejected') {
        const failed = {
          ...cache.payload,
          status: 'error',
          warnings,
          lastErrorAt: new Date().toISOString(),
        }
        cache.payload = failed
        return failed
      }

      const next = mergePayloads(cache.payload, {
        modelsDev: modelsDevResult.status === 'fulfilled' ? modelsDevResult.value : null,
        openRouter: openRouterResult.status === 'fulfilled' ? openRouterResult.value : null,
        fx,
        arena,
        warnings,
        research,
        translations: cache.translations,
      })
      cache.payload = next
      cache.fetchedAt = Date.now()

      // Translate after publishing so the panel never waits on the model.
      runTranslations(signal, TRANSLATE_PER_REFRESH)
        .then((count) => {
          if (count > 0) {
            cache.payload = {
              ...cache.payload,
              models: withTranslations(cache.payload.models, cache.translations),
            }
          }
        })
        .catch((error) => {
          logger?.warn?.('[model-price-radar] translation failed: %s', String(error && error.message))
        })

      return next
    })()

    cache.inflight = run
    try {
      return await run
    } finally {
      if (cache.inflight === run) cache.inflight = null
    }
  }

  async function serveCatalog(res) {
    const stale = Date.now() - cache.fetchedAt > FRESH_MS
    if (stale && !cache.inflight) {
      refresh({ force: false }).catch((error) => {
        logger?.warn?.('[model-price-radar] background refresh failed: %s', String(error && error.message))
      })
    }
    sendJson(res, 200, cache.payload)
  }

  async function handle(req, res) {
    if (!originAllowed(req)) return sendJson(res, 403, { ok: false, message: 'cross-origin request refused' })
    const url = new URL(req.url || PREFIX, 'http://127.0.0.1')
    const op = url.pathname.slice(PREFIX.length).replace(/^\/+/, '').replace(/\/+$/, '')

    if (op === '' || op === 'health') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendJson(res, 405, { ok: false, message: 'use GET' })
      }
      return sendJson(res, 200, {
        ok: true,
        version: cache.payload.version,
        status: cache.payload.status,
        refreshedAt: cache.payload.refreshedAt,
        models: cache.payload.models ? cache.payload.models.length : 0,
        providers: cache.payload.providers ? cache.payload.providers.length : 0,
        referencePrices: (cache.payload.models || []).filter((row) => row.referencePrice).length,
        notes: priceNotes.notes ? priceNotes.notes.length : 0,
        arenaDate: cache.payload.arena ? cache.payload.arena.date : null,
        research: research.entries.length,
        translated: cache.translations.size,
        cacheAgeMs: cache.fetchedAt ? Date.now() - cache.fetchedAt : null,
      })
    }

    if (op === 'catalog') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendJson(res, 405, { ok: false, message: 'use GET' })
      }
      return serveCatalog(res)
    }

    if (op === 'refresh') {
      if (req.method !== 'POST') {
        return sendJson(res, 405, { ok: false, message: 'use POST' })
      }
      try {
        const next = await refresh({ force: true })
        return sendJson(res, 200, next)
      } catch (error) {
        logger?.warn?.('[model-price-radar] refresh failed: %s', String(error && error.message))
        return sendJson(res, 502, {
          ok: false,
          message: String(error && error.message ? error.message : error),
        })
      }
    }

    if (op === 'translate') {
      if (req.method !== 'POST') {
        return sendJson(res, 405, { ok: false, message: 'use POST' })
      }
      try {
        const body = await readBody(req)
        const limit = Number.isFinite(Number(body.limit)) ? Math.min(48, Math.max(1, Number(body.limit))) : 24
        const signal = AbortSignal.timeout(120_000)
        const count = await runTranslations(signal, limit)
        cache.payload = {
          ...cache.payload,
          models: withTranslations(cache.payload.models, cache.translations),
        }
        return sendJson(res, 200, { ok: true, translated: count, total: cache.translations.size })
      } catch (error) {
        return sendJson(res, 500, { ok: false, message: String(error && error.message ? error.message : error) })
      }
    }

    return sendJson(res, 404, { ok: false, message: `unknown operation: ${op}` })
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: PREFIX, handler: handle }))
}
