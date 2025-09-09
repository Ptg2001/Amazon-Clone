import express, { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { initEmail } = require('./middleware/email')

export const app = express()

app.use(helmet())
app.use(compression())
app.set('trust proxy', true)

const isProduction = (process.env.NODE_ENV || 'development') === 'production'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 2000,
})
if (isProduction) {
  app.use(limiter)
}

// CORS: allow live URL, optional additional origins, and Netlify previews
const allowedOriginsEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const defaultAllowed = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
]

const netlifyPreviewRegex = /^(https?:\/\/)?[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/i

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (defaultAllowed.includes(origin)) return callback(null, true)
      if (allowedOriginsEnv.includes(origin)) return callback(null, true)
      if (netlifyPreviewRegex.test(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Initialize email transport (non-blocking)
initEmail?.()

// Use CommonJS-style requires to interop with converted route files
// eslint-disable-next-line @typescript-eslint/no-var-requires
const authRoutes = require('./routes/auth')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const userRoutes = require('./routes/users')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const productRoutes = require('./routes/products')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const categoryRoutes = require('./routes/categories')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const orderRoutes = require('./routes/orders')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paymentRoutes = require('./routes/payments')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const adminRoutes = require('./routes/admin')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cartRoutes = require('./routes/cart')

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/cart', cartRoutes)

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err.stack)
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  })
})

app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' })
})

let cachedConnection: Promise<typeof mongoose> | null = null

export function connectToDatabase(): Promise<typeof mongoose> {
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon-clone')
  }
  return cachedConnection
}


