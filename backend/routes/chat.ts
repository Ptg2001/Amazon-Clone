// @ts-nocheck
export {}
const express = require('express')
const { body } = require('express-validator')
const { handleValidationErrors } = require('../middleware/validation')
const Product = require('../models/Product')
const Category = require('../models/Category')

// Lazy import to reduce cold start
let GoogleGenerativeAI: any

function getGeminiClient(apiKeyFromRequest?: string) {
  const key = (process.env.GEMINI_API_KEY || apiKeyFromRequest || '').trim()
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY')
  }
  if (!GoogleGenerativeAI) {
    GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI
  }
  return new GoogleGenerativeAI(key)
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

const router = require('express').Router()

function isDealsSmartphoneQuery(text: string): boolean {
  if (!text) return false
  const t = text.toLowerCase()
  return (
    (t.includes('deal') || t.includes('discount') || t.includes('offer') || t.includes('trending')) &&
    (t.includes('smartphone') || t.includes('phone') || t.includes('mobile'))
  )
}

function isDealsQuery(text: string): boolean {
  if (!text) return false
  const t = text.toLowerCase()
  return t.includes('today') && (t.includes('deal') || t.includes('discount') || t.includes('offer'))
}

function isCategoriesQuery(text: string): boolean {
  if (!text) return false
  const t = text.toLowerCase()
  return t.includes('category') || t.includes('categories') || t.includes('shop by category')
}

function isProductSearchQuery(text: string): boolean {
  if (!text) return false
  const t = text.toLowerCase()
  return t.startsWith('find ') || t.startsWith('search ') || t.includes('looking for') || t.includes('show me')
}

async function fetchTrendingSmartphoneDeals(limit = 8) {
  // Prefer highest discount, then rating count, then newest
  // Match by title/brand/tags containing phone keywords
  const keywordRegex = /(smart ?phone|smartphone|phone|mobile)/i
  const filter: any = {
    isActive: true,
    $or: [
      { title: { $regex: keywordRegex } },
      { brand: { $regex: keywordRegex } },
      { tags: { $elemMatch: { $regex: keywordRegex } } },
      { features: { $elemMatch: { $regex: keywordRegex } } },
    ],
  }
  const items = await Product.find(filter)
    .select('title price originalPrice discount images ratings brand category slug')
    .sort({ discount: -1, 'ratings.count': -1, createdAt: -1 })
    .limit(limit)
    .lean()
  return items || []
}

async function fetchTopDeals(limit = 10) {
  // Highest absolute or percentage discount first
  const items = await Product.find({ isActive: true })
    .select('title price originalPrice discount images ratings brand category slug')
    .sort({ discount: -1, 'ratings.count': -1, createdAt: -1 })
    .limit(limit)
    .lean()
  return items || []
}

async function fetchTopCategories(limit = 12) {
  const cats = await Category.find({ isActive: true })
    .select('name slug image')
    .sort({ level: 1, sortOrder: 1 })
    .limit(limit)
    .lean()
  return cats || []
}

async function searchProductsByText(query: string, limit = 10) {
  if (!query) return []
  const regex = new RegExp(query.replace(/^find\s+|^search\s+/i, ''), 'i')
  const items = await Product.find({ isActive: true, $or: [{ title: { $regex: regex } }, { brand: { $regex: regex } }] })
    .select('title price originalPrice discount images ratings brand category slug')
    .sort({ 'ratings.count': -1, createdAt: -1 })
    .limit(limit)
    .lean()
  return items || []
}

// -------- Expanded helpers for richer live queries --------
function parsePriceRange(text: string): { min?: number; max?: number } | null {
  const t = text.toLowerCase()
  const money = (s: string) => Number(s.replace(/[^0-9.]/g, ''))
  let m = t.match(/between\s*\$?([0-9.,]+)\s*(and|to)\s*\$?([0-9.,]+)/i)
  if (m) return { min: money(m[1]), max: money(m[3]) }
  m = t.match(/(under|below)\s*\$?([0-9.,]+)/i)
  if (m) return { max: money(m[2]) }
  m = t.match(/(over|above)\s*\$?([0-9.,]+)/i)
  if (m) return { min: money(m[2]) }
  return null
}

async function findCategoryByText(text: string) {
  const str = String(text).slice(0, 200)
  const words = str.split(/[^a-z0-9+]+/i).filter((w) => w.length > 2)
  for (let i = words.length; i >= 1; i--) {
    const chunk = words.slice(0, i).join(' ')
    const cat = await Category.findOne({ name: { $regex: new RegExp(chunk, 'i') }, isActive: true })
      .select('name slug _id')
      .lean()
    if (cat) return cat
  }
  return null
}

function extractBrand(text: string): string | null {
  const quoted = text.match(/"([A-Za-z0-9\-\s]{2,})"/)
  if (quoted) return quoted[1]
  const afterBrand = text.match(/brand\s+([A-Za-z0-9\-\s]{2,})/i)
  if (afterBrand) return afterBrand[1]
  const byBrand = text.match(/by\s+([A-Za-z0-9\-]{2,})/i)
  if (byBrand) return byBrand[1]
  // Heuristic brand keywords in freeform text
  const brandKeywords = [
    'apple','samsung','sony','dell','hp','lenovo','asus','acer','xiaomi','oneplus','google','nokia','motorola','huawei','oppo','vivo','realme','nothing'
  ]
  const lower = text.toLowerCase()
  for (const b of brandKeywords) {
    if (lower.includes(b)) return b
  }
  return null
}

async function fetchProductsAdvanced(text: string, limit = 12) {
  const filter: any = { isActive: true }
  const sort: any = {}
  const t = text.toLowerCase()

  const pr = parsePriceRange(t)
  if (pr) {
    filter.price = {}
    if (pr.min != null) filter.price.$gte = pr.min
    if (pr.max != null) filter.price.$lte = pr.max
  }

  if (t.includes('in stock') || t.includes('available now')) {
    filter['inventory.quantity'] = { $gt: 0 }
  }

  const brand = extractBrand(text)
  if (brand) {
    filter.brand = { $regex: new RegExp(brand, 'i') }
  }

  const cat = await findCategoryByText(text)
  if (cat) {
    filter.$or = [{ category: cat._id }, { 'category.slug': cat.slug }]
  }

  const generic = text.replace(/\b(find|search|show|me|products|items|please|for)\b/gi, ' ').trim()
  if (generic.length > 1) {
    const regex = new RegExp(generic.split(/\s+/).slice(0, 6).join('.*'), 'i')
    filter.$or = (filter.$or || []).concat([{ title: { $regex: regex } }, { features: { $elemMatch: { $regex: regex } } }])
  }

  if (t.includes('cheapest') || t.includes('lowest')) {
    sort.price = 1
  } else if (t.includes('top rated') || t.includes('best rated') || t.includes('highest rated')) {
    sort['ratings.average'] = -1
    sort['ratings.count'] = -1
  } else if (t.includes('newest') || t.includes('latest') || t.includes('recent')) {
    sort.createdAt = -1
  } else if (t.includes('popular') || t.includes('trending')) {
    sort['ratings.count'] = -1
  } else if (t.includes('best deal') || t.includes('biggest discount') || t.includes('top deals')) {
    sort.discount = -1
  } else {
    sort.discount = -1
    sort['ratings.count'] = -1
    sort.createdAt = -1
  }

  const items = await Product.find(filter)
    .select('title price originalPrice discount images ratings brand category slug')
    .sort(sort)
    .limit(limit)
    .lean()
  return items || []
}

// @route   POST /api/chat
// @desc    Send a chat message to Gemini and get a response
// @access  Public (optionally authenticated)
router.post(
  '/',
  [
    body('message').trim().notEmpty().withMessage('message is required'),
    body('history').optional().isArray().withMessage('history must be an array'),
    body('model').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { message, history = [], model, apiKey } = req.body

      const genAI = getGeminiClient(apiKey)
      const usedModel = (model || DEFAULT_MODEL).trim()
      const modelCandidates = [usedModel, 'gemini-1.5-flash-latest', 'gemini-1.0-pro', 'gemini-pro']
      let chatModel = genAI.getGenerativeModel({ model: modelCandidates[0] })

      // Convert our history format [{role:'user'|'model', content:'...'}] to Gemini format
      // Map and sanitize history; Gemini requires first role to be 'user'
      let historyForGemini = Array.isArray(history)
        ? history
            .filter((h: any) => h && h.role && h.content)
            .map((h: any) => ({ role: h.role, parts: [{ text: String(h.content) }] }))
        : []
      // Drop leading non-user entries
      while (historyForGemini.length && historyForGemini[0].role !== 'user') {
        historyForGemini.shift()
      }

      // Realtime DB context injection
      let contextIntro = ''
      let fallbackHeader = ''
      let fallbackLines: string[] = []
      let fallbackItems: { title: string; link: string }[] = []
      const userText = String(message)
      if (isDealsSmartphoneQuery(userText)) {
        const deals = await fetchTrendingSmartphoneDeals(10)
        if (deals.length) {
          const bullets = deals
            .map((p: any, idx: number) => formatProductBullet(p, idx))
            .join('\n')
          contextIntro = `You are a helpful shopping assistant. Use ONLY the following live deals from our database to answer succinctly and help the user decide.\n\nLive smartphone deals:\n${bullets}\n\nWhen asked for trending smartphone deals, list 3-6 good picks with brand, price and discount, and suggest visiting the product pages.`
          fallbackHeader = 'Trending smartphone deals:'
          fallbackLines = deals.map((p: any, idx: number) => `${idx + 1}) ${p.title} — ${typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}${typeof p.discount === 'number' && p.discount > 0 ? ` (${p.discount}% off)` : ''} → /product/${p.slug || p._id}`)
          fallbackItems = deals.map((p: any) => ({ title: p.title, link: `/product/${p.slug || p._id}` }))
        }
      } else if (isDealsQuery(userText)) {
        const deals = await fetchTopDeals(12)
        if (deals.length) {
          const bullets = deals.map((p: any, idx: number) => formatProductBullet(p, idx)).join('\n')
          contextIntro = `Today’s top deals from our store (live data):\n${bullets}\n\nAnswer briefly with a few highlights and invite the user to explore more deals.`
          fallbackHeader = `Today's top deals:`
          fallbackLines = deals.map((p: any, idx: number) => `${idx + 1}) ${p.title} — ${typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}${typeof p.discount === 'number' && p.discount > 0 ? ` (${p.discount}% off)` : ''} → /product/${p.slug || p._id}`)
          fallbackItems = deals.map((p: any) => ({ title: p.title, link: `/product/${p.slug || p._id}` }))
        }
      } else if (isCategoriesQuery(userText)) {
        const cats = await fetchTopCategories(18)
        if (cats.length) {
          const bullets = cats
            .map((c: any, idx: number) => `${idx + 1}. ${c.name} — /category/${c.slug}`)
            .join('\n')
          contextIntro = `Store categories (live):\n${bullets}\n\nWhen the user asks about categories, list several with the route links.`
          fallbackHeader = 'Available categories:'
          fallbackLines = cats.map((c: any, idx: number) => `${idx + 1}) ${c.name} → /category/${c.slug}`)
          fallbackItems = cats.map((c: any) => ({ title: c.name, link: `/category/${c.slug}` }))
        }
      } else if (isProductSearchQuery(userText)) {
        const q = userText.replace(/^(find|search)\s+/i, '').trim()
        const items = await fetchProductsAdvanced(q, 12)
        if (items.length) {
          const bullets = items.map((p: any, idx: number) => formatProductBullet(p, idx)).join('\n')
          contextIntro = `Search results for "${q}" (live):\n${bullets}\n\nReturn 3-6 options tailored to the request (brand/category/price filters applied) and provide quick guidance.`
          fallbackHeader = `Search results for "${q}":`
          fallbackLines = items.map((p: any, idx: number) => `${idx + 1}) ${p.title} — ${typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price} → /product/${p.slug || p._id}`)
          fallbackItems = items.map((p: any) => ({ title: p.title, link: `/product/${p.slug || p._id}` }))
        }
      } else {
        // Fallback attempt: advanced match on freeform query
        const items = await fetchProductsAdvanced(userText, 10)
        if (items.length) {
          const bullets = items.map((p: any, idx: number) => formatProductBullet(p, idx)).join('\n')
          contextIntro = `Relevant items (live):\n${bullets}\n\nAnswer briefly and offer a few recommendations with links.`
          fallbackHeader = 'Relevant items:'
          fallbackLines = items.map((p: any, idx: number) => `${idx + 1}) ${p.title} — ${typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price} → /product/${p.slug || p._id}`)
          fallbackItems = items.map((p: any) => ({ title: p.title, link: `/product/${p.slug || p._id}` }))
        }
      }

      if (contextIntro) {
        historyForGemini.unshift({ role: 'user', parts: [{ text: contextIntro }] })
      }

      // Call LLM with retries across model candidates to avoid 503 overloads
      let replyText: string | null = null
      for (let i = 0; i < modelCandidates.length; i++) {
        try {
          chatModel = genAI.getGenerativeModel({ model: modelCandidates[i] })
          const chat = chatModel.startChat({ history: historyForGemini })
          const result = await chat.sendMessage(String(message))
          const response = await result.response
          replyText = response.text()
          break
        } catch (err) {
          const emsg = String((err as any)?.message || '')
          const overloaded = emsg.toLowerCase().includes('overloaded') || emsg.includes('503')
          if (!overloaded) {
            break
          }
          await new Promise((r) => setTimeout(r, 300))
        }
      }

      if (!replyText) {
        if (fallbackLines.length) {
          const fallbackText = `${fallbackHeader}\n${fallbackLines.join('\n')}`
          return res.json({ success: true, data: { reply: fallbackText, results: fallbackItems } })
        }
        return res.status(503).json({ success: false, message: 'Assistant temporarily unavailable. Please try again.' })
      }

      return res.json({ success: true, data: { reply: replyText, results: fallbackItems } })
    } catch (error) {
      // Log rich error for debugging
      // eslint-disable-next-line no-console
      console.error('Gemini chat error:', {
        message: error?.message,
        code: (error as any)?.code,
        name: (error as any)?.name,
        stack: (error as any)?.stack,
      })
      const status = error?.message?.toLowerCase?.().includes('api key') || error?.message?.toLowerCase?.().includes('missing') ? 400 : 500
      return res.status(status).json({ success: false, message: error?.message || 'Chat error' })
    }
  }
)

function formatProductBullet(p: any, idx: number): string {
  const price = typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : String(p.price)
  const original = typeof p.originalPrice === 'number' ? `$${p.originalPrice.toFixed(2)}` : (p.originalPrice || '')
  const discount = typeof p.discount === 'number' && p.discount > 0 ? `${p.discount}% off` : ''
  const brand = p.brand ? ` - ${p.brand}` : ''
  const slug = p.slug || p._id
  const link = `/product/${slug}`
  return `${idx + 1}. ${p.title}${brand} — ${price}${original ? ` (was ${original})` : ''}${discount ? ` • ${discount}` : ''} — ${link}`
}

module.exports = router


