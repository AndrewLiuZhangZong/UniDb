import express from 'express'
import cors from 'cors'
import { initDatabase } from './database/init'
import connectionRoutes from './routes/connection'
import queryRoutes from './routes/query'
import driverRoutes from './routes/drivers'

export async function startServer(): Promise<number> {
  const app = express()

  // Enable verbose logging in development
  const isDev = process.env.NODE_ENV !== 'production'
  const port = isDev ? 3001 : 3000

  app.use(cors())
  app.use(express.json())

  // Request logging middleware for debugging
  if (isDev) {
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
      next()
    })
  }

  await initDatabase()

  app.use('/api/connections', connectionRoutes)
  app.use('/api/query', queryRoutes)
  app.use('/api/drivers', driverRoutes)

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`[Server] Backend server running on http://localhost:${port}`)
      console.log(`[Server] Environment: ${isDev ? 'development' : 'production'}`)
      resolve(port)
    })
  })
}
