import { Router } from 'express'
import { DatabaseAdapterFactory } from '../adapters/factory'

const router = Router()

router.post('/execute', async (req, res) => {
  try {
    const { connectionId, query } = req.body
    
    const adapter = await DatabaseAdapterFactory.createAdapter(connectionId)
    await adapter.connect()
    
    const startTime = Date.now()
    const result = await adapter.query(query)
    const executionTime = Date.now() - startTime
    
    await adapter.disconnect()
    
    res.json({
      success: true,
      data: result,
      executionTime,
      rowCount: Array.isArray(result) ? result.length : 0
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
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
