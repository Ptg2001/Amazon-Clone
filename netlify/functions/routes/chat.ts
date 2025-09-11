// @ts-nocheck
export {}
const express = require('express')
const { body } = require('express-validator')
const { handleValidationErrors } = require('../middleware/validation')
const Product = require('../models/Product')

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

async function fetchTrendingSmartphoneDeals(limit = 8) {
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
      const chatModel = genAI.getGenerativeModel({ model: usedModel })

      let historyForGemini = Array.isArray(history)
        ? history
            .filter((h: any) => h && h.role && h.content)
            .map((h: any) => ({ role: h.role, parts: [{ text: String(h.content) }] }))
        : []
      while (historyForGemini.length && historyForGemini[0].role !== 'user') {
        historyForGemini.shift()
      }

      let contextIntro = ''
      if (isDealsSmartphoneQuery(String(message))) {
        const deals = await fetchTrendingSmartphoneDeals(10)
        if (deals.length) {
          const bullets = deals
            .map((p: any, idx: number) => {
              const price = typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : String(p.price)
              const original = typeof p.originalPrice === 'number' ? `$${p.originalPrice.toFixed(2)}` : (p.originalPrice || '')
              const discount = typeof p.discount === 'number' ? `${p.discount}% off` : ''
              const brand = p.brand ? ` - ${p.brand}` : ''
              return `${idx + 1}. ${p.title}${brand} — ${price}${original ? ` (was ${original})` : ''}${discount ? ` • ${discount}` : ''}`
            })
            .join('\n')
          contextIntro = `You are a helpful shopping assistant. Use ONLY the following live deals from our database to answer succinctly and help the user decide.\n\nLive smartphone deals:\n${bullets}\n\nWhen asked for trending smartphone deals, summarize top options and suggest how to choose.`
        }
      }

      if (contextIntro) {
        historyForGemini.unshift({ role: 'user', parts: [{ text: contextIntro }] })
      }

      const chat = chatModel.startChat({ history: historyForGemini })
      const result = await chat.sendMessage(String(message))
      const response = await result.response
      const text = response.text()

      return res.json({ success: true, data: { reply: text } })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Gemini chat error (Netlify):', {
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

module.exports = router


