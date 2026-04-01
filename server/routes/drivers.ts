/**
 * Driver Management API Routes
 * REST API for JDBC driver management
 */

import { Router, Request, Response } from 'express'
import { getDriverManager, KNOWN_DRIVERS, DriverMetadata } from '../drivers/DriverManager'

const router = Router()

/**
 * GET /api/drivers
 * Get all known drivers
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const driverManager = getDriverManager()
    const installedDrivers = driverManager.getInstalledDrivers()
    const installedMap = new Map(installedDrivers.map(d => [d.id, d]))

    const drivers = KNOWN_DRIVERS.map(config => {
      const installed = installedMap.get(config.id)
      const latestVersion = config.versions[0]?.version
      const hasUpdate = installed && latestVersion && installed.version !== latestVersion

      return {
        id: config.id,
        name: config.name,
        versions: config.versions.map(v => ({
          version: v.version,
          releaseDate: v.releaseDate,
          releaseNotes: v.releaseNotes
        })),
        defaultVersion: config.defaultVersion,
        installed: !!installed,
        installedVersion: installed?.version,
        hasUpdate,
        metadata: {
          className: installed?.className || config.versions[0]?.version,
          urlPattern: installed?.urlPattern || ''
        }
      }
    })

    res.json({
      success: true,
      data: drivers
    })
  } catch (error) {
    console.error('Failed to get drivers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get drivers list'
    })
  }
})

/**
 * GET /api/drivers/installed
 * Get installed drivers
 */
router.get('/installed', async (req: Request, res: Response) => {
  try {
    const driverManager = getDriverManager()
    const drivers = driverManager.getInstalledDrivers()

    res.json({
      success: true,
      data: drivers
    })
  } catch (error) {
    console.error('Failed to get installed drivers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get installed drivers'
    })
  }
})

/**
 * GET /api/drivers/:id
 * Get driver details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const driverManager = getDriverManager()
    const metadata = driverManager.getDriverMetadata(id)

    if (!metadata) {
      res.status(404).json({
        success: false,
        error: 'Driver not found'
      })
      return
    }

    const config = KNOWN_DRIVERS.find(d => d.id === id)
    const installed = driverManager.isDriverInstalled(id)
    const storageUsage = driverManager.getStorageUsage()

    res.json({
      success: true,
      data: {
        ...metadata,
        installed,
        versions: config?.versions || [],
        storage: {
          totalUsed: storageUsage.used,
          driverCount: storageUsage.count
        }
      }
    })
  } catch (error) {
    console.error(`Failed to get driver ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to get driver details'
    })
  }
})

/**
 * POST /api/drivers/:id/download
 * Download and install a driver
 */
router.post('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { version } = req.body

    const driverManager = getDriverManager()
    const config = KNOWN_DRIVERS.find(d => d.id === id)

    if (!config) {
      res.status(404).json({
        success: false,
        error: 'Driver not found'
      })
      return
    }

    // Start download (async, progress will be emitted via events)
    const result = await driverManager.downloadDriver(id, version)

    res.json({
      success: result.success,
      data: {
        driverId: result.driverId,
        version: result.version,
        message: result.message,
        error: result.error
      }
    })
  } catch (error) {
    console.error(`Failed to download driver ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to download driver'
    })
  }
})

/**
 * DELETE /api/drivers/:id
 * Remove an installed driver
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const driverManager = getDriverManager()

    const success = await driverManager.removeDriver(id)

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Driver not installed or removal failed'
      })
      return
    }

    res.json({
      success: true,
      message: 'Driver removed successfully'
    })
  } catch (error) {
    console.error(`Failed to remove driver ${req.params.id}:`, error)
    res.status(500).json({
      success: false,
      error: 'Failed to remove driver'
    })
  }
})

/**
 * GET /api/drivers/updates/check
 * Check for driver updates
 */
router.get('/updates/check', async (req: Request, res: Response) => {
  try {
    const driverManager = getDriverManager()
    const updates = await driverManager.checkForUpdates()

    const updatesArray = Array.from(updates.entries()).map(([id, info]) => ({
      id,
      currentVersion: info.current,
      latestVersion: info.latest
    }))

    res.json({
      success: true,
      data: {
        hasUpdates: updatesArray.length > 0,
        updates: updatesArray
      }
    })
  } catch (error) {
    console.error('Failed to check for updates:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check for updates'
    })
  }
})

/**
 * POST /api/drivers/updates/apply
 * Update all drivers with new versions
 */
router.post('/updates/apply', async (req: Request, res: Response) => {
  try {
    const driverManager = getDriverManager()
    const updates = await driverManager.checkForUpdates()

    const results = []
    for (const [driverId, info] of updates.entries()) {
      const result = await driverManager.downloadDriver(driverId, info.latest)
      results.push({
        driverId,
        fromVersion: info.current,
        toVersion: info.latest,
        success: result.success,
        message: result.message,
        error: result.error
      })
    }

    res.json({
      success: true,
      data: {
        total: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    })
  } catch (error) {
    console.error('Failed to apply updates:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to apply updates'
    })
  }
})

/**
 * GET /api/drivers/storage
 * Get driver storage usage
 */
router.get('/storage', async (req: Request, res: Response) => {
  try {
    const driverManager = getDriverManager()
    const usage = driverManager.getStorageUsage()
    const drivers = driverManager.getInstalledDrivers()

    const details = drivers.map(d => ({
      id: d.id,
      name: d.name,
      version: d.version,
      size: d.fileSize,
      installedAt: d.installedAt
    }))

    res.json({
      success: true,
      data: {
        totalUsed: usage.used,
        driverCount: usage.count,
        formattedSize: formatBytes(usage.used),
        drivers: details
      }
    })
  } catch (error) {
    console.error('Failed to get storage usage:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get storage usage'
    })
  }
})

/**
 * POST /api/drivers/validate
 * Validate a JDBC driver JAR file
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { jarPath } = req.body

    if (!jarPath) {
      res.status(400).json({
        success: false,
        error: 'JAR path is required'
      })
      return
    }

    // Basic validation - check if file exists and is a valid JAR
    const fs = require('fs')
    const path = require('path')

    if (!fs.existsSync(jarPath)) {
      res.status(404).json({
        success: false,
        error: 'JAR file not found'
      })
      return
    }

    const stats = fs.statSync(jarPath)
    const ext = path.extname(jarPath).toLowerCase()

    if (ext !== '.jar') {
      res.status(400).json({
        success: false,
        error: 'File is not a JAR'
      })
      return
    }

    // TODO: Validate JAR contents (check for META-INF, manifest, etc.)

    res.json({
      success: true,
      data: {
        valid: true,
        size: stats.size,
        formattedSize: formatBytes(stats.size),
        path: jarPath
      }
    })
  } catch (error) {
    console.error('Failed to validate JAR:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to validate JAR file'
    })
  }
})

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default router
