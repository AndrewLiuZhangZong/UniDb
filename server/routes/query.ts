import { Router } from 'express'
import { DatabaseAdapterFactory } from '../adapters/factory'

const router = Router()

router.post('/execute', async (req, res) => {
  let adapter: any = null
  try {
    const { connectionId, query } = req.body
    adapter = await DatabaseAdapterFactory.createAdapter(connectionId)
    await adapter.connect()
    const startTime = Date.now()
    const result = await adapter.query(query)
    const executionTime = Date.now() - startTime
    await adapter.disconnect()
    adapter = null
    const rows = Array.isArray(result) ? result : (result?.rows || [])
    res.json({
      success: true,
      data: result,
      executionTime,
      rowCount: Array.isArray(rows) ? rows.length : (result?.affectedRows ?? 0)
    })
  } catch (error) {
    if (adapter) { try { await adapter.disconnect() } catch { /* ignore */ } }
    res.status(200).json({
      success: false,
      error: (error as Error).message,
      data: null,
      executionTime: 0,
      rowCount: 0
    })
  }
})

router.post('/test', async (req, res) => {
  try {
    const { type, mode, config } = req.body
    
    const adapter = DatabaseAdapterFactory.createAdapterFromConfig(type, mode, config)
    const isConnected = await adapter.testConnection()
    
    res.json({
      success: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    })
  }
})

export default router
