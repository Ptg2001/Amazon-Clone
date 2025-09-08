import serverless from 'serverless-http'
import express from 'express'
import { app as expressApp, connectToDatabase } from '../backend/app'

let handler: any

export default async function vercelHandler(req: any, res: any) {
  if (!handler) {
    await connectToDatabase()
    const server = express()
    server.use((req_, _res, next) => {
      if (req_.url?.startsWith('/api')) {
        req_.url = req_.url.replace(/^\/api/, '')
      }
      next()
    })
    server.use(expressApp)
    handler = serverless(server)
  }
  return handler(req, res)
}


