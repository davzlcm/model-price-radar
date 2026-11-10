// Render smoke test for the client bundle.
//
// The plugin's client half is a Cordis module bundle that expects the harness
// React and DOM at runtime, so this test loads the real source into a vm with a
// tiny React stand-in. It is not a browser: the goal is to prove the surfaces
// mount, the three recommendation groups fill, the detail page renders every
// section, and no vendor label or USD figure leaks into the output.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'client.js'), 'utf8')

// Point MPR_CATALOG at a real payload (for example data/baseline.json) to run
// the same surfaces against live data instead of the fixture below.
const REAL_CATALOG = process.env.MPR_CATALOG
  ? JSON.parse(readFileSync(process.env.MPR_CATALOG, 'utf8'))
  : null

let failures = 0
function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok   ${label}`)
    return
  }
  failures += 1
  console.log(`  FAIL ${label}${detail === undefined ? '' : ` — ${detail}`}`)
}

function textOf(node) {
  if (!node) return ''
  if (node.text !== undefined) return node.text
  return (node.children || []).map(textOf).join(' ')
}

function findAll(node, predicate, out = []) {
  if (!node) return out
  if (predicate(node)) out.push(node)
  for (const child of node.children || []) findAll(child, predicate, out)
  return out
}

// ---------------------------------------------------------------- React stand-in

function makeReact() {
  const stores = new WeakMap()
  let passCounts = new WeakMap()
  let current = null
  let rootElement = null
  let lastTree = null
  let inCycle = false
  let needRerender = false
  let pendingEffects = []
  let cycles = 0

  function getInstance(fn) {
    const ordinal = passCounts.get(fn) || 0
    passCounts.set(fn, ordinal + 1)
    let list = stores.get(fn)
    if (!list) {
      list = []
      stores.set(fn, list)
    }
    if (!list[ordinal]) list[ordinal] = { hooks: [], cursor: 0 }
    const instance = list[ordinal]
    instance.cursor = 0
    return instance
  }

  function nextHook(init) {
    const instance = current
    const index = instance.cursor
    instance.cursor += 1
    if (!instance.hooks[index]) instance.hooks[index] = init ? init() : {}
    return instance.hooks[index]
  }

  function useState(initial) {
    const hook = nextHook(() => ({ value: typeof initial === 'function' ? initial() : initial }))
    const setState = (next) => {
      const value = typeof next === 'function' ? next(hook.value) : next
      if (Object.is(value, hook.value)) return
      hook.value = value
      queueRender()
    }
    return [hook.value, setState]
  }

  function useEffect(effect, deps) {
    const hook = nextHook(() => ({ deps: undefined, cleanup: undefined }))
    const previous = hook.deps
    const changed = !previous
      || !deps
      || deps.length !== previous.length
      || deps.some((value, index) => !Object.is(value, previous[index]))
    hook.deps = deps
    if (changed) pendingEffects.push({ hook, effect })
  }

  function useMemo(factory, deps) {
    const hook = nextHook(() => ({ deps: undefined, value: undefined }))
    const previous = hook.deps
    const changed = !previous
      || !deps
      || deps.length !== previous.length
      || deps.some((value, index) => !Object.is(value, previous[index]))
    if (changed) {
      hook.deps = deps
      hook.value = factory()
    }
    return hook.value
  }

  function useCallback(fn, deps) {
    return useMemo(() => fn, deps)
  }

  function useRef(initial) {
    const hook = nextHook(() => ({ current: initial }))
    return hook
  }

  function createElement(type, props, ...children) {
    const flattened = children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false)
    return {
      type,
      props: { ...(props || {}), children: flattened.length ? flattened : undefined },
    }
  }

  function renderElement(element) {
    if (element === null || element === undefined || element === false) return null
    if (typeof element === 'string' || typeof element === 'number') return { text: String(element), children: [] }
    if (typeof element === 'function') element = { type: element, props: {} }
    if (!element || typeof element !== 'object') return null
    const props = element.props || {}
    if (typeof element.type === 'function') {
      const previous = current
      current = getInstance(element.type)
      let output
      try {
        output = element.type(props)
      } finally {
        current = previous
      }
      return renderElement(output)
    }
    const children = (props.children || []).map(renderElement).filter(Boolean)
    return {
      type: element.type,
      props,
      children,
      className: props.className || '',
      text: undefined,
    }
  }

  function queueRender() {
    needRerender = true
    if (inCycle) return
    inCycle = true
    try {
      while (needRerender && cycles < 30) {
        needRerender = false
        cycles += 1
        passCounts = new WeakMap()
        const effects = []
        pendingEffects = effects
        lastTree = renderElement(rootElement)
        for (const entry of effects) {
          if (entry.hook.cleanup) entry.hook.cleanup()
          const cleanup = entry.effect()
          entry.hook.cleanup = typeof cleanup === 'function' ? cleanup : undefined
        }
      }
    } finally {
      inCycle = false
    }
  }

  return {
    React: { createElement, useState, useEffect, useMemo, useCallback, useRef },
    mount(element) {
      rootElement = element
      cycles = 0
      queueRender()
      return lastTree
    },
    tree() {
      return lastTree
    },
  }
}

// --------------------------------------------------------------- document stubs

function makeDocument() {
  const head = { children: [], appendChild(node) { head.children.push(node) } }
  const body = { children: [], appendChild() {} }
  const document = {
    head,
    body,
    createElement(tag) {
      return {
        tag,
        attributes: {},
        textContent: '',
        setAttribute(name, value) { this.attributes[name] = value },
        remove() {
          const at = head.children.indexOf(this)
          if (at >= 0) head.children.splice(at, 1)
        },
      }
    },
    querySelectorAll() { return [] },
    documentElement: { getAttribute() { return null }, className: '' },
    addEventListener() {},
    removeEventListener() {},
  }
  return document
}

// ------------------------------------------------------------------- the mock catalog

const PROVIDERS = [
  ['deepseek', 'DeepSeek', '国内'],
  ['qwen', '通义千问', '国内'],
  ['kimi', 'Kimi', '国内'],
  ['glm', '智谱 GLM', '国内'],
  ['openai', 'OpenAI', '国外'],
  ['claude', 'Claude', '国外'],
  ['gemini', 'Gemini', '国外'],
  ['meta', 'Meta', '国外'],
]

// provider, display, name, slot, input, output, caps, context, grade notes
const ROWS = [
  ['deepseek', '国内', 'DeepSeek V4.1 Flash 1017', 'V4.1 Flash', 0.15, 0.6, ['reasoning', 'tool', 'vision'], 1048576, 'A'],
  ['deepseek', '国内', 'DeepSeek V4 Pro', 'V4 Pro', 0.6, 2.4, ['reasoning', 'tool'], 1048576, 'B', 'flagship'],
  ['qwen', '国内', 'Qwen3.8 Flash', '3.8 Flash', 0.1, 0.3, ['reasoning', 'tool', 'vision'], 1000000, 'A'],
  ['qwen', '国内', 'Qwen3.8 Max', '3.8 Max', 1.2, 4.8, ['reasoning', 'tool'], 256000, 'B'],
  ['kimi', '国内', 'Kimi K3.1 Pro', 'K3.1 Pro', 2, 10, ['reasoning', 'tool'], 256000, 'B'],
  ['kimi', '国内', 'Kimi K2.7 Code', 'K2.7 Code', 0.6, 3.5, ['reasoning', 'tool'], 256000, 'A'],
  ['glm', '国内', 'GLM-5.3', '5.3', 0.07, 1.4, ['reasoning', 'tool'], 200000, 'C'],
  ['glm', '国内', 'GLM-5.3-Flash', '5.3 Flash', 0.15, 0.5, ['reasoning', 'tool', 'vision'], 200000, 'B'],
  ['openai', '国外', 'GPT-6.1 Terra', '6.1 Terra', 1, 5, ['reasoning', 'tool', 'vision'], 400000, 'A', 'flagship'],
  ['openai', '国外', 'GPT-6 Luna', '6 Luna', 0.1, 0.5, ['reasoning', 'tool'], 400000, 'B'],
  ['claude', '国外', 'Claude Sonnet 5.5', 'Sonnet 5.5', 2, 10, ['reasoning', 'tool', 'vision'], 1000000, 'A', 'flagship'],
  ['claude', '国外', 'Claude Haiku 5.5', 'Haiku 5.5', 0.1, 0.5, ['reasoning', 'tool', 'vision'], 200000, 'B'],
  ['gemini', '国外', 'Gemini 4 Argon', '4 Argon', 4, 20, ['reasoning', 'tool', 'vision'], 1000000, 'B', 'flagship'],
  ['gemini', '国外', 'Gemini 3.8 Flash', '3.8 Flash', 0.75, 3.75, ['reasoning', 'tool', 'vision'], 1000000, 'A'],
  ['meta', '国外', 'Muse Spark 1.3', 'Muse Spark', 1.25, 4.25, ['reasoning', 'tool'], 128000, 'C'],
  ['meta', '国外', 'Muse Wonder', 'Muse Wonder', 4, 20, ['reasoning', 'tool', 'vision'], 128000, 'B'],
]

const GRADES = { A: 0.95, B: 0.75, C: 0.5, D: 0.25 }
const SCENARIO_IDS = ['quick', 'writing', 'docs', 'code', 'ops', 'agent', 'talk']

function buildCatalog() {
  const counts = {}
  const research = []
  const models = ROWS.map(([provider, group, name, slot, input, output, caps, context, grade, tier]) => {
    counts[provider] = (counts[provider] || 0) + 1
    const capability = {}
    for (const key of caps) capability[key] = true
    const model = {
      id: `${provider}/${name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`,
      name,
      provider,
      providerName: PROVIDERS.find((entry) => entry[0] === provider)[1],
      slot: slot.toLowerCase().replace(/\s+/g, '-'),
      slotLabel: slot,
      context,
      maxOutput: Math.min(128000, context),
      releaseDate: '2026-09-01',
      updatedAt: '2026-11-01',
      capabilities: capability,
      price: { input, output, cacheRead: input / 10, cacheWrite: input / 5 },
      descriptionZh: `${name} 的中文介绍，用于冒烟测试。`,
      tier: tier || 'standard',
      sourceUrl: 'https://models.dev',
    }
    if (provider === 'deepseek' && /Flash/.test(name)) {
      model.priceNotes = [{
        kind: 'peak',
        text: '高峰时段按标价计费，其余时段五折。',
        offPeakRatio: 0.5,
        peakHours: '北京时间周一至周五 09:00–12:00、14:00–18:00',
        source: 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing',
      }]
    }
    if (provider === 'deepseek' || provider === 'claude') {
      model.referencePrice = { input, output, cacheRead: input / 10, cacheWrite: input / 5, provider: 'OpenRouter', id: `test/${provider}`, url: 'https://openrouter.ai/models' }
    }
    if (name === 'DeepSeek V4.1 Flash 1017' || name === 'Claude Sonnet 5.5' || name === 'Kimi K2.7 Code') {
      const ratings = {}
      for (const scenario of SCENARIO_IDS) ratings[scenario] = grade
      research.push({
        model: model.id,
        name,
        position: '主力',
        tagline: `${name} 的一句话定位。`,
        ratings,
        facts: ['事实一', '事实二', '事实三'],
        weaknesses: ['短板一'],
        sources: ['https://example.com/source'],
        confidence: 'high',
      })
    }
    return model
  })
  return {
    version: 5,
    status: 'live',
    refreshedAt: '2026-11-10T02:00:00.000Z',
    fx: { usdToCny: 6.68, asOf: '2026-11-09' },
    arena: { date: '2026-10-07', boards: { code: { models: [{ key: 'deepseek-v4.1-flash-1017', rank: 4 }] } } },
    providers: PROVIDERS.map(([key, name, group]) => ({ key, name, group, models: counts[key] || 0 })),
    models,
    research: { entries: research, updatedAt: '2026-11-09' },
    warnings: [],
  }
}

const CATALOG = buildCatalog()

// --------------------------------------------------------------------- the harness

function loadBundle() {
  let spec = null
  const document = makeDocument()
  const storage = new Map()
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load(value) { spec = value },
      },
    },
    document,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null },
      setItem(key, value) { storage.set(key, String(value)) },
      removeItem(key) { storage.delete(key) },
    },
    fetch: async () => ({ ok: true, json: async () => REAL_CATALOG || CATALOG }),
    console,
    setTimeout,
    clearTimeout,
    Date,
    JSON,
    Promise,
    Math,
    Object,
    Array,
    String,
    Number,
    Set,
    Map,
    WeakMap,
    Symbol,
    Intl,
    URL,
    encodeURIComponent,
    decodeURIComponent,
  }
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: 'client.js' })
  if (!spec) throw new Error('bundle did not call __ModuleLoader__.load')
  return spec
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
}

function byClass(tree, name) {
  return findAll(tree, (node) => String((node.props && node.props.className) || '').split(/\s+/).includes(name))
}

/** Exercise the same surfaces against a real payload instead of the fixture. */
async function realChecks(runtime, module) {
  const flagshipCount = (REAL_CATALOG.models || []).filter((model) => model.tier === 'flagship').length
  const expectedCards = 12 + flagshipCount
  const tabs = byClass(runtime.tree(), 'mpr-tab')
  check('live catalog: seven scenario tabs', tabs.length === 7, `got ${tabs.length}`)
  for (const tab of tabs) {
    const label = textOf(tab)
    tab.props.onClick()
    await settle()
    const tree = runtime.tree()
    const cards = byClass(tree, 'mpr-card')
    const text = textOf(tree)
    check(`live catalog: ${label} fills ${expectedCards} cards`, cards.length === expectedCards, `got ${cards.length}`)
    check(`live catalog: ${label} shows four groups`, byClass(tree, 'mpr-group').length === 4)
    check(`live catalog: ${label} has no blank values`, !/undefined|NaN/.test(text))
    check(`live catalog: ${label} keeps Chinese summaries only`, !/[A-Za-z]{24,}/.test(byClass(tree, 'mpr-card-summary').map((node) => textOf(node)).join(' ')))
  }
  tabs[0].props.onClick()
  await settle()
  const first = byClass(runtime.tree(), 'mpr-card')[0]
  check('live catalog: a card opens the detail page', Boolean(first))
  first.props.onClick()
  await settle()
  const detail = runtime.tree()
  const text = textOf(detail)
  check('live catalog: detail shows price comparison', text.includes('价格对照'))
  check('live catalog: detail names both channels', text.includes('官方 API') && text.includes('OpenRouter'))
  check('live catalog: detail lists four use cases', byClass(detail, 'mpr-case').length === 4)
  check('live catalog: detail explains best practice', text.includes('如何用得更好'))
  check('live catalog: detail lists pros and caveats', text.includes('优点') && text.includes('注意事项'))
  check('live catalog: detail stays CNY only', !text.includes('$'))
  check('live catalog: detail has no blank values', !/undefined|NaN/.test(text))
  const back = byClass(detail, 'mpr-back')[0]
  back.props.onClick()
  await settle()
  check('live catalog: back restores the list', byClass(runtime.tree(), 'mpr-card').length === expectedCards)
  const flash = byClass(runtime.tree(), 'mpr-card').find((card) => {
    const name = byClass(card, 'mpr-name')[0]
    return name && textOf(name) === 'DeepSeek V4.1 Flash 1017'
  })
  check('live catalog: DeepSeek card is listed', Boolean(flash))
  if (flash) {
    flash.props.onClick()
    await settle()
    const peakDetail = runtime.tree()
    const peakText = textOf(peakDetail)
    check('live catalog: DeepSeek peak price is ¥2 / ¥8', /¥2(\.00)?\b/.test(peakText) && /¥8(\.00)?\b/.test(peakText), peakText.slice(0, 400))
    check('live catalog: DeepSeek off-peak price is ¥1 / ¥4', peakText.includes('闲时') && /¥1(\.00)?\b/.test(peakText) && /¥4(\.00)?\b/.test(peakText))
    byClass(peakDetail, 'mpr-back')[0].props.onClick()
    await settle()
  }
}

function finish() {
  if (failures > 0) {
    console.error(`\n${failures} check(s) failed`)
    process.exitCode = 1
    return
  }
  console.log('\nall checks passed')
}

async function main() {
  console.log('model-price-radar client smoke test')
  const spec = loadBundle()
  const runtime = makeReact()

  const registrations = []
  const module = spec.factory((name) => {
    if (name === 'react') return runtime.React
    throw new Error(`unexpected require: ${name}`)
  })

  check('bundle exposes apply', typeof module.apply === 'function')
  check('bundle injects slots and locale', Array.isArray(module.inject) && module.inject.includes('slots') && module.inject.includes('locale'))

  const ctx = {
    effect(fn) { fn() },
    locale: {
      register() {},
      getLocale: () => ({ active: 'zh' }),
      subscribe: () => () => {},
    },
    slots: {
      inject(name, fn) { fn() },
      register(entry, component) {
        registrations.push({ entry, component })
        return () => {}
      },
    },
  }
  module.apply(ctx)

  const names = registrations.map((item) => item.entry.name)
  check('registers exactly two surfaces', registrations.length === 2, names.join(','))
  check('sidebar icon registered at order 40', registrations.some((item) => item.entry.name === 'sidebar.panellist' && item.entry.order === 40))
  check('main panel registered by key', registrations.some((item) => item.entry.name === 'main' && item.entry.key === 'model-price-radar'))
  check('composer dock is gone', !names.includes('conversation.composer.dock'))

  const panel = registrations.find((item) => item.entry.name === 'main').component
  runtime.mount(runtime.React.createElement(panel, {}))
  await settle()
  await settle()

  if (REAL_CATALOG) {
    await realChecks(runtime, module)
    finish()
    return
  }

  let text = textOf(runtime.tree())
  check('panel paints the Chinese title', text.includes('模型价格雷达'))
  check('no USD amount is rendered', !text.includes('$'))
  check('category tabs exist', findAll(runtime.tree(), (node) => String(node.className).split(/\s+/).includes('mpr-tab')).length === 7)

  const cards = findAll(runtime.tree(), (node) => node.props && node.props.className === 'mpr-card')
  check('sixteen cards fill the four shelves', cards.length === 16, `got ${cards.length}`)
  check('flagship shelf is labelled', text.includes('旗舰模型'))
  check('group one is labelled', text.includes('效果最好'))
  check('group two is labelled', text.includes('完美胜任 · 性价比高'))
  check('group three is labelled', text.includes('基本满足 · 价格最低'))
  check('cards never print a vendor label', findAll(runtime.tree(), (node) => String(node.className).includes('mpr-vendor')).length === 0)
  check('provider sidebar is gone', findAll(runtime.tree(), (node) => String(node.className).includes('mpr-side')).length === 0)
  check('grade badges are gone', findAll(runtime.tree(), (node) => String(node.className).includes('mpr-grade')).length === 0)
  check('peak/off-peak note appears on the card', text.includes('峰谷价') && text.includes('闲时'))
  check('every card shows one typical-task cost', findAll(runtime.tree(), (node) => String(node.className).includes('mpr-cost')).length === 16)

  // Open the DeepSeek card — it carries a peak note, an OpenRouter reference
  // price, and a researched rating, so the detail page renders every section.
  const deepseek = cards.find((node) => {
    const names = findAll(node, (x) => x.props && x.props.className === 'mpr-name')
    return names.length === 1 && textOf(names[0]) === 'DeepSeek V4.1 Flash 1017'
  })
  check('DeepSeek card is present', Boolean(deepseek))
  deepseek.props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))

  text = textOf(runtime.tree())
  const cases = findAll(runtime.tree(), (node) => node.props && node.props.className === 'mpr-case')
  check('detail page opens as a full view', Boolean(findAll(runtime.tree(), (node) => String(node.className).includes('mpr-detail')).length))
  check('detail shows the price comparison section', text.includes('价格对照'))
  check('detail shows both channels', text.includes('官方 API') && text.includes('OpenRouter'))
  check('detail drops the source sub-labels', findAll(runtime.tree(), (node) => node.props && node.props.className === 'tr-sub').length === 0 && !text.includes('test/deepseek'))
  check('detail explains peak pricing', text.includes('闲时') && text.includes('峰时'))
  check('detail lists four use cases', cases.length === 4, `got ${cases.length}`)
  check('detail explains best practice', text.includes('如何用得更好'))
  check('detail lists strengths and caveats', text.includes('优点') && text.includes('注意事项'))
  check('detail shows the researched tagline', text.includes('DeepSeek V4.1 Flash 1017 的一句话定位'), text.slice(0, 500))
  check('detail keeps the Chinese summary only', text.includes('DeepSeek V4.1 Flash 1017 的中文介绍'))
  check('detail keeps CNY only', !text.includes('$'))

  const back = findAll(runtime.tree(), (node) => node.props && String(node.props.className).includes('mpr-back'))[0]
  back.props.onClick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  check('back returns to the grouped list', findAll(runtime.tree(), (node) => node.props && node.props.className === 'mpr-card').length === 16)

  // Pure helpers: four shelves, no model repeated across them.
  const test = module.__test
  const scenario = test.SCENARIOS.find((entry) => entry.id === 'code')
  const ranked = test.rankScenario(CATALOG.models, scenario, CATALOG.arena.boards, CATALOG.research)
  const groups = test.recommendGroups(ranked)
  const ids = groups.flatMap((group) => group.rows.map((row) => row.model.id))
  check('groups ship four shelves', groups.length === 4)
  check('groups hold sixteen unique models', ids.length === 16 && new Set(ids).size === 16, `${ids.length} / ${new Set(ids).size}`)
  check('flagship shelf lists flagships only', groups[0].rows.every((row) => row.model.tier === 'flagship'))
  check('group one leaves flagships out', groups[1].rows.every((row) => row.model.tier !== 'flagship'))
  check('group one is sorted by capability', groups[1].rows.every((row, index, all) => index === 0 || all[index - 1].quality >= row.quality))
  check('group three is sorted by price', groups[3].rows.every((row, index, all) => index === 0 || all[index - 1].cost <= row.cost))

  finish()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
