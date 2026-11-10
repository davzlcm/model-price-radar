/**
 * Price sources shared by the Host plugin and the baseline builder.
 *
 * Everything here is plain-data transformation: fetch a payload, map it into
 * the catalog row shape, or find the newest arena leaderboard snapshot. The
 * Host reuses it on every refresh; `scripts/build-baseline.mjs` reuses it to
 * regenerate the copy bundled with the package.
 */

export const MODELS_DEV_URL = 'https://models.dev/api.json'
export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/models'
export const FX_URL = 'https://open.er-api.com/v6/latest/USD'
export const ARENA_REPO = 'oolong-tea-2026/arena-ai-leaderboards'
export const ARENA_BOARDS = ['text', 'code', 'document', 'vision', 'search', 'agent']
export const ARENA_LOOKBACK_DAYS = 60

/** Reference CNY/USD rate used only for a derived ¥ figure on USD-native prices. */
export const REFERENCE_CNY_PER_USD = 7.1

/**
 * Provider rows shown in the panel, in display order.
 *
 * Scope is deliberately narrow: four domestic vendors and four international
 * vendors. The Chinese console providers also resell each other's models, so
 * `families` keeps each row to its own models. OpenRouter is not a catalogue
 * row any more: it only supplies a reference price shown next to the official
 * one in the detail view.
 */
export const PROVIDERS = [
  { key: 'deepseek', name: 'DeepSeek', region: 'cn', group: '国内', official: true,
    modelsDev: ['deepseek'], families: ['deepseek'], vendor: 'deepseek' },
  { key: 'qwen', name: '通义千问', region: 'cn', group: '国内', official: true,
    modelsDev: ['alibaba-cn'], families: ['qwen'], vendor: 'qwen' },
  { key: 'kimi', name: 'Kimi', region: 'cn', group: '国内', official: true,
    modelsDev: ['moonshotai-cn'], families: ['kimi'], vendor: 'kimi' },
  { key: 'glm', name: '智谱 GLM', region: 'cn', group: '国内', official: true,
    modelsDev: ['zhipuai'], families: ['glm'], vendor: 'glm' },
  { key: 'openai', name: 'ChatGPT (OpenAI)', region: 'intl', group: '国外', official: true,
    modelsDev: ['openai'], families: ['gpt'], vendor: 'openai' },
  { key: 'anthropic', name: 'Claude (Anthropic)', region: 'intl', group: '国外', official: true,
    modelsDev: ['anthropic'], families: ['claude'], vendor: 'anthropic' },
  { key: 'google', name: 'Gemini (Google)', region: 'intl', group: '国外', official: true,
    modelsDev: ['google'], families: ['gemini'], vendor: 'google' },
  { key: 'meta', name: 'Meta', region: 'intl', group: '国外', official: false,
    modelsDev: ['meta'], families: ['llama', 'muse'], vendor: 'meta' },
]

/** Families we always keep even when brand new, so the panel never looks stale. */
export const KEEP_FAMILY = /(^|[-/])(gpt|claude|gemini|grok|deepseek|qwen|kimi|glm|doubao|seed|hy|hunyuan|minimax|step|muse|mistral|llama)([-.0-9]|$)/i

/** Modalities a text-price comparison cannot represent (images, audio, embeddings). */
export const EXCLUDED_MODEL = /image|tts|speech|audio|embedding|realtime|ocr|intent|math|character|computer-use|live-translate|lyria|nano-banana|daybreak/i

export const SIX_MONTHS_MS = 200 * 24 * 3600 * 1000

/**
 * Tier slots per vendor. A row's *slot* is its product line (flash/pro,
 * opus/haiku, max/plus/flash); its *version* is the newest generation in that
 * line. Curation keeps the newest version of every slot and drops older
 * generations, so the panel lists e.g. Opus 5.5 but not Opus 5.
 *
 * `version` returns a comparable number (0 when no generation is encoded).
 */
const SLOT_RULES = {
  deepseek: [
    { slot: 'flash-vision', test: /vision/i, version: (n) => versionOf(n, /v(\d+(?:\.\d+)?)/i) },
    { slot: 'pro', test: /pro/i, version: (n) => versionOf(n, /v(\d+(?:\.\d+)?)/i) },
    { slot: 'flash', test: /flash/i, version: (n) => versionOf(n, /v(\d+(?:\.\d+)?)/i) },
  ],
  qwen: [
    { slot: 'omni-flash', test: /omni[\s.-]*flash/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'omni', test: /omni/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'vl', test: /\bvl\b|-vl-/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'coder', test: /coder/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'max', test: /\bmax\b/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'plus', test: /\bplus\b/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'flash', test: /flash/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
    { slot: 'open-weights', test: /next|\d+b[-a]/i, version: (n) => versionOf(n, /qwen(\d+(?:\.\d+)?)/i) },
  ],
  kimi: [
    { slot: 'k3.1-pro-highspeed', test: /k3[.\s-]*1[\s-]*pro[\s-]*highspeed/i, version: (n) => versionOf(n, /k(\d+(?:\.\d+)?)/i) },
    { slot: 'k3.1-pro', test: /k3[.\s-]*1[\s-]*pro/i, version: (n) => versionOf(n, /k(\d+(?:\.\d+)?)/i) },
    { slot: 'k3', test: /\bk3\b/i, version: (n) => versionOf(n, /\bk(\d+(?:\.\d+)?)/i) },
    { slot: 'k2.7-code-highspeed', test: /k2[.\s-]*7[\s-]*code[\s-]*highspeed/i, version: (n) => versionOf(n, /k(\d+(?:\.\d+)?)/i) },
    { slot: 'k2.7-code', test: /k2[.\s-]*7[\s-]*code/i, version: (n) => versionOf(n, /k(\d+(?:\.\d+)?)/i) },
    { slot: 'k2.6', test: /k2[.\s-]*6/i, version: (n) => versionOf(n, /k(\d+(?:\.\d+)?)/i) },
  ],
  glm: [
    { slot: 'flashx', test: /flashx/i, version: (n) => versionOf(n, /glm-(\d+(?:\.\d+)?)/i) },
    { slot: 'flash', test: /flash/i, version: (n) => versionOf(n, /glm-(\d+(?:\.\d+)?)/i) },
    { slot: 'v-turbo', test: /v-turbo/i, version: (n) => versionOf(n, /glm-(\d+(?:\.\d+)?)/i) },
    { slot: 'air', test: /\bair\b/i, version: (n) => versionOf(n, /glm-(\d+(?:\.\d+)?)/i) },
    { slot: 'v', test: /v(?:$|[\s-])/i, version: (n) => versionOf(n, /glm-(\d+(?:\.\d+)?)/i) },
    { slot: 'main', test: /glm(?:$|[\s-])/i, version: (n) => versionOf(n, /glm[\s-]*(\d+(?:\.\d+)?)/i) },
  ],
  openai: [
    { slot: 'o-pro', test: /^o\d+-pro/i, version: (n) => versionOf(n, /^o(\d+)/i) },
    { slot: 'o-mini', test: /^o\d+-mini/i, version: (n) => versionOf(n, /^o(\d+)/i) },
    { slot: 'o-main', test: /^o\d+/i, version: (n) => versionOf(n, /^o(\d+)/i) },
    { slot: 'nano', test: /nano/i, version: (n) => versionOf(n, /gpt-(\d+(?:\.\d+)?)/i) },
    { slot: 'mini', test: /mini/i, version: (n) => versionOf(n, /gpt-(\d+(?:\.\d+)?)/i) },
    { slot: 'pro', test: /pro/i, version: (n) => versionOf(n, /gpt-(\d+(?:\.\d+)?)/i) },
    { slot: 'astra', test: /astra/i, version: (n) => versionOf(n, /(?:gpt|astra)[-\s]*(\d+(?:\.\d+)?)/i) },
    { slot: 'luna', test: /luna/i, version: (n) => versionOf(n, /(?:gpt|luna)[-\s]*(\d+(?:\.\d+)?)/i) },
    { slot: 'sol', test: /sol/i, version: (n) => versionOf(n, /(?:gpt|sol)[-\s]*(\d+(?:\.\d+)?)/i) },
    { slot: 'terra', test: /terra/i, version: (n) => versionOf(n, /(?:gpt|terra)[-\s]*(\d+(?:\.\d+)?)/i) },
    { slot: 'daybreak', test: /daybreak/i, version: (n) => versionOf(n, /(?:gpt|daybreak)[-\s]*(\d+(?:\.\d+)?)/i) },
    { slot: 'codex', test: /codex/i, version: (n) => versionOf(n, /(?:gpt|codex)[-\s]*(\d+(?:\.\d+)?)/i) },
    { slot: 'main', test: /gpt/i, version: (n) => versionOf(n, /gpt-(\d+(?:\.\d+)?)/i) },
  ],
  anthropic: [
    { slot: 'fable', test: /fable/i, version: (n) => versionOf(n, /fable[\s.-]*(\d+(?:[\s.-]\d+)?)/i) },
    { slot: 'opus', test: /opus/i, version: (n) => versionOf(n, /opus[\s.-]*(\d+(?:[\s.-]\d+)?)/i) },
    { slot: 'sonnet', test: /sonnet/i, version: (n) => versionOf(n, /sonnet[\s.-]*(\d+(?:[\s.-]\d+)?)/i) },
    { slot: 'haiku', test: /haiku/i, version: (n) => versionOf(n, /haiku[\s.-]*(\d+(?:[\s.-]\d+)?)/i) },
  ],
  google: [
    { slot: 'flash-lite', test: /flash[\s-]*lite/i, version: (n) => versionOf(n, /gemini[\s-]*(\d+(?:\.\d+)?)/i) },
    { slot: 'pro-custom', test: /custom[\s-]*tools/i, version: (n) => versionOf(n, /gemini[\s-]*(\d+(?:\.\d+)?)/i) },
    { slot: 'pro', test: /\bpro\b/i, version: (n) => versionOf(n, /gemini[\s-]*(\d+(?:\.\d+)?)/i) },
    { slot: 'flash', test: /flash/i, version: (n) => versionOf(n, /gemini[\s-]*(\d+(?:\.\d+)?)/i) },
    { slot: 'named', test: /argon|lumen|nova/i, version: (n) => versionOf(n, /gemini[\s-]*(\d+(?:\.\d+)?)/i) },
    { slot: 'main', test: /gemini/i, version: (n) => versionOf(n, /gemini[\s-]*(\d+(?:\.\d+)?)/i) },
  ],
  grok: [
    { slot: 'multi-agent', test: /multi[\s-]*agent/i, version: (n) => versionOf(n, /grok[\s-]*([\d.]+)/i) },
    { slot: 'build', test: /\bbuild\b/i, version: (n) => versionOf(n, /build[\s-]*([\d.]+)/i) },
    { slot: 'main', test: /grok/i, version: (n) => versionOf(n, /grok[\s-]*([\d.]+)/i) },
  ],
  meta: [
    { slot: 'wonder', test: /wonder/i, version: (n) => versionOf(n, /wonder[\s.-]*(\d+(?:\.\d+)?)/i) },
    { slot: 'spark', test: /spark/i, version: (n) => versionOf(n, /spark[\s.-]*(\d+(?:\.\d+)?)/i) || versionOf(n, /spark/i, /(\d+(?:\.\d+)?)/) },
    { slot: 'llama', test: /llama/i, version: (n) => versionOf(n, /llama-?(\d+(?:\.\d+)?)/i) },
    { slot: 'main', test: /./, version: (n) => versionOf(n, /(\d+(?:\.\d+)?)/) },
  ],
}

function versionOf(text, match, fallback) {
  const hit = String(text || '').match(match) || (fallback ? String(text || '').match(fallback) : null)
  if (!hit) return 0
  const parts = (hit[1] || '').split(/[-.\s]+/).map((part) => Number(part) || 0)
  return parts.length > 1 ? parts[0] + parts[1] / 100 : parts[0] || 0
}

/** Resolve a model's tier slot and generation for its vendor. */
export function slotOf(vendor, name) {
  const rules = SLOT_RULES[vendor]
  if (!rules) return { slot: 'main', version: 0 }
  for (const rule of rules) {
    if (!rule.test.test(name)) continue
    const version = rule.version(name)
    if (version > 0) return { slot: rule.slot, version }
  }
  return { slot: 'main', version: 0 }
}

/** Label for a slot, shown as a small badge. */
export function slotLabel(vendor, slot) {
  const labels = {
    deepseek: { 'flash-vision': 'Flash Vision', flash: 'Flash', pro: 'Pro', main: '主力' },
    qwen: { 'omni-flash': 'Omni Flash', omni: 'Omni', max: 'Max', plus: 'Plus', flash: 'Flash', coder: 'Coder', vl: 'VL' },
    kimi: { 'k3.1-pro-highspeed': 'K3.1 Pro 高速', 'k3.1-pro': 'K3.1 Pro', k3: 'K3', 'k2.7-code-highspeed': 'K2.7 Code 高速', 'k2.7-code': 'K2.7 Code', 'k2.6': 'K2.6' },
    glm: { flashx: 'FlashX', flash: 'Flash', 'v-turbo': 'V Turbo', air: 'Air', v: 'V', main: '主力' },
    openai: { nano: 'Nano', mini: 'Mini', pro: 'Pro', astra: 'Astra', luna: 'Luna', sol: 'Sol', terra: 'Terra', daybreak: 'Daybreak', codex: 'Codex', main: '主力' },
    anthropic: { fable: 'Fable', opus: 'Opus', sonnet: 'Sonnet', haiku: 'Haiku' },
    google: { pro: 'Pro', 'flash-lite': 'Flash Lite', flash: 'Flash', named: '新档', main: '主力' },
    meta: { wonder: 'Wonder', spark: 'Spark', llama: 'Llama', main: '主力' },
  }
  return (labels[vendor] && labels[vendor][slot]) || slot
}

/**
 * Keep only the newest generation of each tier slot.
 *
 * A slot whose newest generation is older than the recency window is dropped
 * entirely, so retired lines (Claude Opus 4.x, GPT-5.5, Qwen3.5) disappear
 * instead of lingering beside the current generation.
 */
export function curateBySlot(rows) {
  const best = new Map()
  for (const row of rows) {
    // A version-less row without a real tier keeps its own key so distinct
    // products (Gemini 4 Argon, Muse Wonder) do not collapse into one another.
    const key = row.slot === 'main' && !row.version
      ? `${row.vendor}/main/${row.id}`
      : `${row.vendor}/${row.slot}/${row.version ? 'gen' : 'single'}`
    const current = best.get(key)
    if (!current) {
      best.set(key, row)
      continue
    }
    if (row.version > current.version) best.set(key, row)
    else if (row.version === current.version) {
      const rowDate = Date.parse(row.releaseDate || row.updatedAt || '') || 0
      const currentDate = Date.parse(current.releaseDate || current.updatedAt || '') || 0
      if (rowDate > currentDate) best.set(key, row)
    }
  }
  return [...best.values()]
}

/** GET a JSON document with a bounded retry and an abortable timeout. */
export async function getJson(url, { timeoutMs = 25_000, attempts = 3, signal } = {}) {
  let lastError
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const budget = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined
      const combined = signal && budget ? AbortSignal.any([signal, budget]) : budget || signal
      const response = await fetch(url, {
        headers: { 'user-agent': 'dsh-model-price-radar/1.0', accept: 'application/json' },
        signal: combined,
      })
      if (response.ok) return await response.json()
      lastError = new Error(`${url} -> HTTP ${response.status}`)
      if (response.status === 404) break
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)))
  }
  throw lastError || new Error(`${url} failed`)
}

/** Per-million-token price from a models.dev cost object. */
export function priceFromModelsDev(cost) {
  if (!cost || typeof cost.input !== 'number' || typeof cost.output !== 'number') return null
  const price = {
    input: cost.input,
    output: cost.output,
    cacheRead: typeof cost.cache_read === 'number' ? cost.cache_read : undefined,
    cacheWrite: typeof cost.cache_write === 'number' ? cost.cache_write : undefined,
    tiers: [],
    note: undefined,
  }
  if (Array.isArray(cost.tiers)) {
    for (const tier of cost.tiers) {
      const size = tier && tier.tier && typeof tier.tier.size === 'number' ? tier.tier.size : null
      if (size === null) continue
      if (typeof tier.input !== 'number' || typeof tier.output !== 'number') continue
      price.tiers.push({ over: size, input: tier.input, output: tier.output })
    }
  }
  if (cost.context_over_200k) {
    price.note = '超过 200K token 后涨价'
    price.over200k = { input: cost.context_over_200k.input, output: cost.context_over_200k.output }
  }
  if (price.input === 0 && price.output === 0) price.note = '免费'
  return price
}

/** Per-million-token price from an OpenRouter pricing object (USD per token strings). */
export function priceFromRouter(pricing) {
  if (!pricing) return null
  const num = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed * 1e6 : undefined
  }
  const input = num(pricing.prompt)
  const output = num(pricing.completion)
  if (input === undefined || output === undefined) return null
  return {
    input,
    output,
    cacheRead: num(pricing.input_cache_read),
    cacheWrite: num(pricing.input_cache_write),
    tiers: [],
    note: input === 0 && output === 0 ? '免费' : undefined,
  }
}

export function familyOf(name) {
  const value = String(name || '').toLowerCase()
  if (/claude|opus|sonnet|haiku|fable/.test(value)) return 'claude'
  if (/\bgpt|^o[0-9]/.test(value)) return 'gpt'
  if (/gemini/.test(value)) return 'gemini'
  if (/grok/.test(value)) return 'grok'
  if (/deepseek/.test(value)) return 'deepseek'
  if (/qwen|tongyi|通义/.test(value)) return 'qwen'
  if (/kimi|moonshot/.test(value)) return 'kimi'
  if (/glm|zhipu/.test(value)) return 'glm'
  if (/doubao|seed/.test(value)) return 'doubao'
  if (/hunyuan|^hy[0-9]/.test(value)) return 'hunyuan'
  if (/minimax/.test(value)) return 'minimax'
  if (/step/.test(value)) return 'stepfun'
  if (/muse/.test(value)) return 'muse'
  if (/mistral|magistral|codestral|mixtral/.test(value)) return 'mistral'
  if (/llama/.test(value)) return 'llama'
  return 'other'
}

export function cleanDescription(text, limit = 200) {
  if (typeof text !== 'string') return undefined
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length === 0) return undefined
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat
}

export function isoDay(value) {
  if (!value) return undefined
  // Numbers arrive as Unix seconds (provider `created`/`updated`) or as
  // milliseconds from `Date`-style sources; treat anything past 1e12 as ms.
  const parsed = typeof value === 'number'
    ? new Date(value > 1e12 ? value : value * 1000)
    : new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10)
}

function capabilitiesFromModelsDev(model) {
  const inputs = (model.modalities && model.modalities.input) || ['text']
  return {
    reasoning: Boolean(model.reasoning),
    tool: Boolean(model.tool_call),
    vision: inputs.includes('image'),
    audio: inputs.includes('audio'),
    structured: Boolean(model.structured_output),
    openWeights: Boolean(model.open_weights),
  }
}

/**
 * Map a models.dev payload into catalog rows.
 *
 * `now` decides the recency window so a long-lived Host process and the
 * baseline builder agree on which models count as current.
 */
export function catalogFromModelsDev(payload, { now = Date.now() } = {}) {
  const providers = []
  const models = []

  for (const provider of PROVIDERS) {
    const listed = []
    for (const providerKey of provider.modelsDev || []) {
      const block = payload && payload[providerKey]
      if (!block || !block.models) continue
      for (const [rawId, model] of Object.entries(block.models)) {
        const price = priceFromModelsDev(model.cost)
        if (!price) continue
        const family = familyOf(`${model.name || ''} ${rawId}`)
        if (provider.families && !provider.families.includes(family)) continue
        if (family === 'other') continue
        const name = model.name || rawId
        if (EXCLUDED_MODEL.test(name + ' ' + rawId)) continue
        // "-latest" ids are moving aliases of another row in the same list.
        if (/-latest\b/i.test(rawId + ' ' + name)) continue
        const { slot, version } = slotOf(provider.vendor, name)
        // A name without a readable generation (bare "GPT-5.6") still carries
        // one in its name or id; use it so the older generation is dropped.
        const resolvedVersion = version > 0 ? version : (() => {
          const fromName = String(name).match(/(\d+(?:\.\d+)?)/)
          if (fromName) return Number(fromName[1])
          const fromId = String(rawId).match(/(\d+(?:\.\d+)?)/)
          return fromId ? Number(fromId[1]) : 0
        })()
        listed.push({
          id: `${provider.key}/${rawId}`,
          name,
          provider: provider.key,
          vendor: provider.vendor,
          family,
          slot,
          version: resolvedVersion,
          slotLabel: slotLabel(provider.vendor, slot),
          price,
          priceSource: 'models.dev',
          context: model.limit && typeof model.limit.context === 'number' ? model.limit.context : undefined,
          maxOutput: model.limit && typeof model.limit.output === 'number' ? model.limit.output : undefined,
          capabilities: capabilitiesFromModelsDev(model),
          releaseDate: isoDay(model.release_date),
          updatedAt: isoDay(model.last_updated || model.release_date),
          description: cleanDescription(model.description),
          sourceUrl: `${MODELS_DEV_URL}#${providerKey}`,
          official: Boolean(provider.official),
          hosted: Boolean(provider.hosted),
          openRouterId: model.canonical_model_id,
        })
      }
    }

    // models.dev also lists community-contributed mirrors such as
    // "Muse Spark 1.3 Contributor" beside the canonical row. Keep the
    // canonical entry and drop the mirror, otherwise the pair ties on release
    // date and the mirror can win the slot.
    const canonicalNames = new Set(
      listed
        .filter((row) => !/\bcontributor$/i.test(row.name))
        .map((row) => row.name.toLowerCase()),
    )
    const deduped = listed.filter((row) => {
      if (!/\bcontributor$/i.test(row.name)) return true
      const stripped = row.name.replace(/\s+contributor$/i, '').toLowerCase()
      return !canonicalNames.has(stripped)
    })

    const curated = curateBySlot(deduped)
    if (curated.length === 0) continue
    // A row with a generation is a real tier; a row without one is either a
    // standalone product (Muse Wonder, Gemini 4 Argon) or an older bare release
    // (GPT-5.6 beside GPT-6.1). Drop a bare release only when the vendor has a
    // versioned row in the same main slot; keep standalone products otherwise.
    const cutoff = now - SIX_MONTHS_MS
    // A slot survives only when its newest entry is recent, so retired lines
    // (Claude Opus 4.x, GPT-5.5) disappear instead of lingering beside today's
    // models. Within a surviving slot, only the current generation is kept.
    const bySlot = new Map()
    for (const row of curated) {
      const key = `${row.family}/${row.slot}`
      const list = bySlot.get(key) || []
      list.push(row)
      bySlot.set(key, list)
    }
    const latest = (row) => Date.parse(row.releaseDate || row.updatedAt || '') || 0
    const finalRows = []
    for (const list of bySlot.values()) {
      list.sort((a, b) => latest(b) - latest(a))
      if (latest(list[0]) < cutoff) continue
      // A bare product name with no generation keeps only its newest row:
      // "Gemini Flash Latest", "Gemini Omni Flash" and "Daybreak" are aliases
      // or distinct products, not a tier ladder.
      if (list[0].slot === 'main' && list[0].version === 0) {
        finalRows.push(list[0])
        continue
      }
      // The newest entry anchors the slot; same-generation variants (a highspeed
      // twin, an open-weights sibling) stay, older generations do not.
      const anchor = latest(list[0])
      for (const row of list) {
        if (latest(row) >= anchor - 45 * 24 * 3600 * 1000) finalRows.push(row)
      }
    }
    const familyTop = new Map()
    for (const row of finalRows) {
      const current = familyTop.get(row.family) || 0
      if (row.version > current) familyTop.set(row.family, row.version)
    }
    // A bare release from an older generation (GPT-5.6 beside GPT-6.1, Gemini 3.1
    // beside Gemini 4) is not a tier; it is last generation's main model.
    const rowsOut = finalRows.filter((row) => {
      const top = familyTop.get(row.family) || 0
      if (!top || !row.version) return true
      return row.version >= top - 0.99
    })
    if (rowsOut.length === 0) continue
    rowsOut.sort((a, b) => (b.version || 0) - (a.version || 0)
      || (Date.parse(b.releaseDate || '') || 0) - (Date.parse(a.releaseDate || '') || 0))
    providers.push(providerRow(provider, rowsOut.length))
    models.push(...rowsOut)
  }
  return { providers, models }
}

/** Normalized key for matching a catalogue name against OpenRouter's names. */
export function routerNameKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^[^:]+:\s*/, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Index the OpenRouter payload by canonical id and by normalized name.
 *
 * The Host only needs this to attach a comparison price: the router is no
 * longer a catalogue row, so a model that is missing here simply has no second
 * price to show.
 */
export function routerIndex(payload) {
  const byId = new Map()
  const byName = new Map()
  for (const model of (payload && payload.data) || []) {
    const id = String(model.id || '')
    if (!id || id.includes(':batch') || id.startsWith('~')) continue
    const price = priceFromRouter(model.pricing)
    if (!price) continue
    const entry = { ...price, routerId: id, url: `https://openrouter.ai/${id}` }
    byId.set(id, entry)
    const short = id.slice(id.indexOf('/') + 1)
    const nameKey = routerNameKey(model.name || short)
    if (!byName.has(nameKey)) byName.set(nameKey, entry)
    const shortKey = routerNameKey(short)
    if (!byName.has(shortKey)) byName.set(shortKey, entry)
  }
  return { byId, byName }
}

/** Attach the OpenRouter price (if any) as `referencePrice` on each model. */
export function attachReferencePrices(models, index) {
  if (!index) return models
  return models.map((model) => {
    // Prefer the exact name over models.dev's openRouterId: the pointer is
    // sometimes inherited by a faster sibling (Highspeed used to resolve to
    // the plain Pro listing and quote half the real price).
    const named = index.byName.get(routerNameKey(model.name))
    const direct = model.openRouterId ? index.byId.get(model.openRouterId) : undefined
    const hit = named || direct
    if (!hit) return model
    // A Highspeed SKU must never borrow the base model's listing.
    if (/highspeed|high-speed/i.test(model.name) && !/highspeed|high-speed/i.test(hit.routerId || '')) return model
    return {
      ...model,
      referencePrice: {
        input: hit.input,
        output: hit.output,
        cacheRead: hit.cacheRead,
        cacheWrite: hit.cacheWrite,
        provider: 'OpenRouter',
        id: hit.routerId,
        url: hit.url,
      },
    }
  })
}

/**
 * Attach pricing caveats (peak/off-peak, promotions) from data/price-notes.json.
 *
 * Each note lists the exact model names it applies to; matching is literal so a
 * note can never silently spill onto a neighbouring model.
 */
export function attachPriceNotes(models, config) {
  const notes = (config && config.notes) || []
  if (notes.length === 0) return models
  return models.map((model) => {
    const hit = notes.filter((note) =>
      (note.match || []).some((name) => routerNameKey(name) === routerNameKey(model.name)))
    if (hit.length === 0) return model
    // models.dev lists DeepSeek's idle (off-peak) price as the model price.
    // The official table quotes the peak price, so lift the USD base to peak
    // with the published ratio: off-peak = peak * 0.5. Without this every
    // DeepSeek estimate came out at half the real ceiling.
    let price = model.price
    for (const note of hit) {
      if (!note || !note.peakCny || !price) continue
      const ratio = Number.isFinite(note.offPeakRatio) ? note.offPeakRatio : 0.5
      if (ratio > 0 && !price.peakApplied) {
        price = { ...price }
        price.input = Number(price.input) / ratio
        price.output = Number(price.output) / ratio
        if (Number.isFinite(price.cacheRead)) price.cacheRead = price.cacheRead / ratio
        price.peakApplied = true
      }
      price = { ...price, cny: note.peakCny, cnyOffPeak: note.offPeakCny }
    }
    return {
      ...model,
      price,
      priceNotes: hit.map(({ match, ...rest }) => rest),
    }
  })
}

/**
 * Attach the hand-checked Chinese blurb by model id.
 *
 * The UI only ever renders `descriptionZh`; keeping the English source in the
 * payload is for auditing, never for display.
 */
export function attachDescriptionsZh(models, config) {
  const entries = (config && config.entries) || {}
  return models.map((model) => {
    const zh = entries[model.id]
    return zh ? { ...model, descriptionZh: zh } : model
  })
}

/**
 * Mark each vendor's flagship. The curated map is name-exact because price is a
 * poor proxy (Kimi K3 costs more per output token than the newer K3.1 Pro).
 * A vendor whose listed names all disappeared falls back to its priciest row so
 * the flagship shelf never goes empty, and says so in the payload warnings.
 */
export function markFlagships(models, config) {
  const map = (config && config.flagships) || {}
  const vendors = new Set(models.map((model) => model.provider).filter(Boolean))
  const chosen = new Set()
  for (const vendor of vendors) {
    const names = map[vendor] || []
    const rows = models.filter((model) => model.provider === vendor)
    const hits = rows.filter((model) => names.includes(model.name))
    if (hits.length > 0) {
      for (const model of hits) chosen.add(model.id)
      continue
    }
    const richest = [...rows].sort((a, b) => {
      const cost = (model) => ((model.price && model.price.input) || 0) + ((model.price && model.price.output) || 0)
      return cost(b) - cost(a)
    })[0]
    if (richest) chosen.add(richest.id)
  }
  return models.map((model) => ({ ...model, tier: chosen.has(model.id) ? 'flagship' : 'standard' }))
}

function providerRow(provider, count) {
  return {
    key: provider.key,
    name: provider.name,
    region: provider.region,
    group: provider.group,
    official: Boolean(provider.official),
    hosted: Boolean(provider.hosted),
    models: count,
  }
}

/** Drop reasoning-effort suffixes so arena rows match catalogue names. */
export function arenaKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\((x?high|max|medium|low|search|grounding|thinking|reasoning)\)/g, ' ')
    .replace(/[-_\s]+(x?high|max|medium|low)$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchLiveFx({ signal, timeoutMs = 15_000 } = {}) {
  const payload = await getJson(FX_URL, { signal, timeoutMs, attempts: 3 })
  const rate = payload && payload.rates && Number(payload.rates.CNY)
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('FX payload has no CNY rate')
  return {
    usdToCny: rate,
    reference: REFERENCE_CNY_PER_USD,
    asOf: isoDay(Number.isFinite(Number(payload.time_last_update_unix))
      ? Number(payload.time_last_update_unix) * 1000
      : Date.now()),
    source: FX_URL,
  }
}

/**
 * Find the newest snapshot that actually carries leaderboards.
 *
 * The upstream collector records empty days when its scrape fails, so a plain
 * "latest" read reports a date with no rows. Walk back day by day with a
 * bounded budget and report the date we actually used.
 */
export async function findArenaSnapshot({
  knownDate,
  signal,
  lookbackDays = ARENA_LOOKBACK_DAYS,
  timeoutMs = 12_000,
  maxProbes = 40,
  budgetMs = 20_000,
} = {}) {
  const base = `https://raw.githubusercontent.com/${ARENA_REPO}/main/data`
  const deadline = Date.now() + budgetMs
  let start = Date.now()
  try {
    const latest = await getJson(`${base}/latest.json`, { signal, timeoutMs, attempts: 2 })
    if (latest && latest.date) start = Date.parse(`${latest.date}T00:00:00Z`)
  } catch {
    /* fall back to today */
  }

  let probes = 0
  for (let offset = 0; offset <= lookbackDays; offset += 1) {
    const date = new Date(start - offset * 86400000).toISOString().slice(0, 10)
    if (knownDate && date === knownDate) return { date: knownDate, boards: null, unchanged: true }
    if (probes >= maxProbes || Date.now() > deadline) break
    probes += 1
    let index
    try {
      index = await getJson(`${base}/${date}/_index.json`, { signal, timeoutMs, attempts: 1 })
    } catch {
      continue
    }
    const present = index && index.leaderboards ? Object.keys(index.leaderboards) : []
    if (present.length === 0) continue
    const boards = {}
    for (const board of ARENA_BOARDS) {
      if (!present.includes(board)) continue
      try {
        const payload = await getJson(`${base}/${date}/${board}.json`, { signal, timeoutMs, attempts: 1 })
        const rows = Array.isArray(payload.models) ? payload.models : []
        const usable = rows.filter((row) => row && typeof row.model === 'string' && typeof row.rank === 'number')
        if (usable.length === 0) continue
        boards[board] = {
          updated: payload.meta && payload.meta.last_updated ? payload.meta.last_updated : undefined,
          sourceUrl: `${base}/${date}/${board}.json`,
          models: usable.map((row) => ({
            model: row.model,
            key: arenaKey(row.model),
            vendor: row.vendor,
            rank: row.rank,
            score: typeof row.score === 'number' ? row.score : undefined,
            votes: typeof row.votes === 'number' ? row.votes : undefined,
          })),
        }
      } catch {
        continue
      }
    }
    if (Object.values(boards).some((entry) => entry.models.length > 0)) return { date, boards }
  }
  // Nothing newer panned out: keep the snapshot we already publish rather than
  // downgrading the catalogue to "no leaderboard" for a transient upstream gap.
  return knownDate
    ? { date: knownDate, boards: null, unchanged: true }
    : { date: null, boards: null }
}

/** Group providers into the order the panel shows them. */
export function groupProviders(providers) {
  const groups = []
  for (const provider of providers) {
    if (!groups.includes(provider.group)) groups.push(provider.group)
  }
  return groups
}
