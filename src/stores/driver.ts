import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

export interface DriverVersion {
  version: string
  releaseDate: string
  releaseNotes?: string
}

export interface DriverInfo {
  id: string
  name: string
  versions: DriverVersion[]
  defaultVersion?: string
  installed: boolean
  installedVersion?: string
  hasUpdate: boolean
  metadata: {
    className: string
    urlPattern: string
  }
}

export interface DriverUpdate {
  id: string
  currentVersion: string
  latestVersion: string
}

export interface DownloadProgress {
  driverId: string
  version: string
  percentage: number
  speed: string
}

export const useDriverStore = defineStore('driver', () => {
  // State
  const drivers = ref<DriverInfo[]>([])
  const loading = ref(false)
  const downloadingDrivers = ref<Map<string, DownloadProgress>>(new Map())
  const pendingUpdates = ref<DriverUpdate[]>([])

  // Getters
  const installedDrivers = computed(() => drivers.value.filter(d => d.installed))
  const availableDrivers = computed(() => drivers.value.filter(d => !d.installed))
  const driversWithUpdates = computed(() => drivers.value.filter(d => d.hasUpdate))

  // Actions
  const fetchDrivers = async () => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE}/drivers`)
      if (response.data.success) {
        drivers.value = response.data.data
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchInstalledDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/drivers/installed`)
      return response.data.data || []
    } catch (error) {
      console.error('Failed to fetch installed drivers:', error)
      return []
    }
  }

  const getDriverDetails = async (driverId: string) => {
    try {
      const response = await axios.get(`${API_BASE}/drivers/${driverId}`)
      return response.data.data
    } catch (error) {
      console.error(`Failed to get driver ${driverId}:`, error)
      return null
    }
  }

  const downloadDriver = async (driverId: string, version?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    downloadingDrivers.value.set(driverId, {
      driverId,
      version: version || 'latest',
      percentage: 0,
      speed: '0 KB/s'
    })

    try {
      const response = await axios.post(`${API_BASE}/drivers/${driverId}/download`, { version })
      const result = response.data

      // Update local state
      await fetchDrivers()

      // Simulate progress updates (in real app, use WebSocket or Server-Sent Events)
      if (result.success) {
        downloadingDrivers.value.delete(driverId)
      }

      return {
        success: result.success,
        message: result.data?.message,
        error: result.data?.error
      }
    } catch (error) {
      console.error(`Failed to download driver ${driverId}:`, error)
      downloadingDrivers.value.delete(driverId)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  const removeDriver = async (driverId: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`${API_BASE}/drivers/${driverId}`)
      if (response.data.success) {
        await fetchDrivers()
        return true
      }
      return false
    } catch (error) {
      console.error(`Failed to remove driver ${driverId}:`, error)
      return false
    }
  }

  const checkForUpdates = async (): Promise<DriverUpdate[]> => {
    try {
      const response = await axios.get(`${API_BASE}/drivers/updates/check`)
      if (response.data.success) {
        pendingUpdates.value = response.data.data.updates || []
        return pendingUpdates.value
      }
      return []
    } catch (error) {
      console.error('Failed to check for updates:', error)
      return []
    }
  }

  const applyUpdates = async (): Promise<{ total: number; succeeded: number; failed: number }> => {
    try {
      const response = await axios.post(`${API_BASE}/drivers/updates/apply`)
      if (response.data.success) {
        await fetchDrivers()
        pendingUpdates.value = []
        return response.data.data
      }
      return { total: 0, succeeded: 0, failed: 0 }
    } catch (error) {
      console.error('Failed to apply updates:', error)
      return { total: 0, succeeded: 0, failed: 0 }
    }
  }

  const getStorageUsage = async () => {
    try {
      const response = await axios.get(`${API_BASE}/drivers/storage`)
      return response.data.data
    } catch (error) {
      console.error('Failed to get storage usage:', error)
      return null
    }
  }

  const isDownloading = (driverId: string) => {
    return downloadingDrivers.value.has(driverId)
  }

  const getDownloadProgress = (driverId: string) => {
    return downloadingDrivers.value.get(driverId)
  }

  return {
    // State
    drivers,
    loading,
    downloadingDrivers,
    pendingUpdates,

    // Getters
    installedDrivers,
    availableDrivers,
    driversWithUpdates,

    // Actions
    fetchDrivers,
    fetchInstalledDrivers,
    getDriverDetails,
    downloadDriver,
    removeDriver,
    checkForUpdates,
    applyUpdates,
    getStorageUsage,
    isDownloading,
    getDownloadProgress
  }
})
