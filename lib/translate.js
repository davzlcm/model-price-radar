/**
 * Chinese translation for model descriptions.
 *
 * The Web UI is Chinese-first, while the price sources publish English prose.
 * The Host translates each description once with the profile's current model
 * and keeps the result in memory; a description whose text is unchanged is
 * never sent again, and a failed batch keeps the English original.
 */
import { createHash } from 'node:crypto'

const BATCH_SIZE = 12
const MAX_CHARS = 1500
const REQUEST_TIMEOUT_MS = 90_000

/** Stable cache key for one English description. */
export function descriptionKey(text) {
  return createHash('sha1').update(String(text || '')).digest('hex').slice(0, 16)
}

/** True when text already contains CJK characters. */
export function hasCjk(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ''))
}

function cleanTranslation(raw) {
  let value = String(raw || '').trim()
  value = value.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?```$/, '').trim()
  return value.replace(/^\[?\d+[.、)]\s*/, '').trim()
}

function buildPrompt(items) {
  return [
    '你是模型资料的中文翻译。把下面每条英文模型介绍翻译成简体中文。',
    '规则：',
    '- 只输出译文，每条一行，行首用 "序号. " 标出对应编号，不要输出英文原文。',
    '- 模型名、厂商名、参数规模、上下文长度、价格、数字、API 名称保持原样。',
    '- 术语按国内常见译法：reasoning→推理、tool calling→工具调用、context→上下文、MoE 保留、agent→智能体。',
    '- 不增删信息，不写评论，不合并行。',
    '',
    ...items.map((item, index) => `${index + 1}. ${item.text}`),
  ].join('\n')
}

/** Translate one batch; returns an array aligned with the input order. */
async function translateBatch(llm, request, items, signal) {
  if (items.length === 0) return []
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('translation timed out')), REQUEST_TIMEOUT_MS)
  const combined = AbortSignal.any([signal, controller.signal])
  let output = ''
  try {
    const stream = llm.stream({
      provider: request.provider,
      model: request.model,
      system: buildPrompt(items),
      messages: [{ role: 'user', content: [{ type: 'text', text: items.map((item, index) => `${index + 1}. ${item.text}`).join('\n\n') }] }],
      temperature: 0.1,
      maxTokens: 2400,
      signal: combined,
    })
    for await (const chunk of stream) {
      if (chunk.type === 'text-delta') output += chunk.text
    }
  } finally {
    clearTimeout(timer)
  }
  const lines = output.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  const byIndex = new Map()
  for (const line of lines) {
    const match = line.match(/^(\d+)[.、)]\s*(.+)$/)
    if (!match) continue
    const index = Number(match[1]) - 1
    if (index < 0 || index >= items.length) continue
    const text = cleanTranslation(match[2])
    if (text) byIndex.set(index, text)
  }
  return items.map((_, index) => byIndex.get(index))
}

/**
 * Translate missing descriptions and update the cache in place.
 *
 * `cache` maps descriptionKey -> { zh, at }. Returns the number translated.
 */
export async function translateDescriptions({
  llm,
  request,
  descriptions,
  cache,
  signal,
  logger,
}) {
  if (!llm || typeof llm.stream !== 'function' || !request || !request.model) return 0
  const pending = []
  const seen = new Set()
  for (const text of descriptions) {
    if (!text || typeof text !== 'string') continue
    if (hasCjk(text)) continue
    const key = descriptionKey(text)
    if (cache.has(key) || seen.has(key)) continue
    seen.add(key)
    pending.push({ key, text: text.slice(0, MAX_CHARS) })
  }
  let translated = 0
  for (let offset = 0; offset < pending.length; offset += BATCH_SIZE) {
    const batch = pending.slice(offset, offset + BATCH_SIZE)
    try {
      const results = await translateBatch(llm, request, batch, signal)
      for (let index = 0; index < batch.length; index += 1) {
        const zh = results[index]
        if (!zh) continue
        cache.set(batch[index].key, { zh, at: Date.now() })
        translated += 1
      }
    } catch (error) {
      logger?.warn?.('[model-price-radar] translation batch failed: %s', String(error && error.message))
      break
    }
  }
  return translated
}

/** Resolve the model used for translation, preferring the configured default. */
export function translationTarget(ctx) {
  try {
    if (ctx && typeof ctx.get === 'function') {
      const defaults = ctx.get('agentDefaultModel')
      const selection = defaults && typeof defaults.currentSelection === 'function'
        ? defaults.currentSelection()
        : undefined
      if (selection && typeof selection.provider === 'string' && typeof selection.model === 'string') {
        return { provider: selection.provider, model: selection.model }
      }
    }
  } catch {
    /* fall through to the account default */
  }
  return { provider: 'deepseek-account', model: 'deepseek-flash' }
}
