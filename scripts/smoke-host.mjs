/**
 * Local smoke test for the Host half: load the plugin, simulate a webServer
 * registration, and exercise the real HTTP handler with mock request objects.
 *
 *   node scripts/smoke-host.mjs
 */
import { apply, inject } from '../index.js'

const routes = []
const logs = []
// Minimal streaming LLM: echoes one numbered Chinese line per input line.
const llm = {
  stream(request) {
    const userText = request.messages
      .flatMap((message) => (message.content || []))
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n')
    const count = (userText.match(/^\d+\.\s/gm) || []).length || 1
    const lines = Array.from({ length: count }, (_, index) => `${index + 1}. 中文译文第${index + 1}条`)
    return (async function* stream() {
      yield { type: 'text-delta', index: 0, text: lines.join('\n') }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })()
  },
}
const ctx = {
  // The translation path resolves the default model through ctx.get().
  get(name) {
    if (name === 'agentDefaultModel') {
      return { currentSelection: () => ({ provider: 'deepseek-account', model: 'deepseek-flash' }) }
    }
    if (name === 'llm') return llm
    return undefined
  },
  logger: {
    info: (...args) => logs.push(['info', ...args]),
    warn: (...args) => logs.push(['warn', ...args]),
  },
  effect(fn) {
    const dispose = fn()
    return () => { if (typeof dispose === 'function') dispose() }
  },
  webServer: {
    register(route) {
      routes.push(route)
      return () => {}
    },
  },
}

if (!Array.isArray(inject) || !inject.includes('webServer')) {
  throw new Error('host plugin must inject webServer')
}

apply(ctx)
if (routes.length !== 1 || routes[0].kind !== 'prefix') {
  throw new Error(`expected one prefix route, got ${JSON.stringify(routes.map((r) => r.kind))}`)
}

const handler = routes[0].handler

function call(method, path, body) {
  return new Promise((resolve, reject) => {
    const headers = {}
    let status = 0
    let body = ''
    const res = {
      writeHead(code, nextHeaders) {
        status = code
        Object.assign(headers, nextHeaders || {})
      },
      end(chunk) {
        body += chunk ? String(chunk) : ''
        try {
          resolve({ status, headers, body: JSON.parse(body) })
        } catch (error) {
          reject(new Error(`non-JSON response: ${body.slice(0, 200)}`))
        }
      },
      on() {},
    }
    const req = {
      method,
      url: path,
      headers: { host: '127.0.0.1:1' },
      on(event, handler) {
        if (event === 'data' && body !== undefined) handler(Buffer.from(JSON.stringify(body), 'utf8'))
        if (event === 'end') handler()
      },
      once(event, handler) {
        this.on(event, handler)
      },
    }
    Promise.resolve(handler(req, res)).catch(reject)
  })
}

const health = await call('GET', '/price-radar/health')
console.log('health:', JSON.stringify(health.body))

const catalog = await call('GET', '/price-radar/catalog')
const payload = catalog.body
console.log('catalog:', catalog.status, 'models=', payload.models.length, 'providers=', payload.providers.length,
  'status=', payload.status, 'arena=', payload.arena && payload.arena.date, 'fx=', payload.fx && payload.fx.usdToCny)

const required = ['models', 'providers', 'groups', 'arena', 'fx', 'sources', 'status', 'refreshedAt']
for (const key of required) {
  if (!(key in payload)) throw new Error(`catalog is missing ${key}`)
}
for (const model of payload.models.slice(0, 50)) {
  if (typeof model.id !== 'string' || !model.price || typeof model.price.input !== 'number') {
    throw new Error(`malformed model row: ${JSON.stringify(model).slice(0, 160)}`)
  }
}
const boards = payload.arena && payload.arena.boards ? Object.keys(payload.arena.boards) : []
console.log('arena boards:', boards.join(',') || '(none)')

// A forced refresh hits the real network; it must either succeed or degrade
// with a warning while still returning a usable payload.
const refreshed = await call('POST', '/price-radar/refresh')
console.log('refresh:', refreshed.status, 'models=', refreshed.body.models ? refreshed.body.models.length : 0,
  'status=', refreshed.body.status, 'warnings=', JSON.stringify(refreshed.body.warnings || []))
if (refreshed.status !== 200) throw new Error(`refresh failed: ${JSON.stringify(refreshed.body).slice(0, 300)}`)

const missing = await call('GET', '/price-radar/nope')
console.log('missing route:', missing.status, missing.body.message)

// Translation path: the mock LLM answers numbered Chinese lines, and the
// endpoint must report what it translated without failing the request.
const translated = await call('POST', '/price-radar/translate')
console.log('translate:', translated.status, JSON.stringify(translated.body))
if (translated.status !== 200 || !translated.body.ok) throw new Error('translate endpoint failed')
if (translated.body.translated < 1) throw new Error('translate endpoint translated nothing')
const afterTranslate = await call('GET', '/price-radar/catalog')
const withZh = afterTranslate.body.models.filter((model) => model.descriptionZh).length
console.log('models with Chinese description:', withZh)
if (withZh < 1) throw new Error('catalog carries no descriptionZh after translation')

console.log('logs:', JSON.stringify(logs))
console.log('SMOKE OK')
