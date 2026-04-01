import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// Get API base URL dynamically
const getApiBase = async () => {
  // In development, use a different port to avoid conflicts
  // The backend server runs on 3001 in dev mode
  const isDev = import.meta.env.DEV
  if (isDev && window.electronAPI?.getServerPort) {
    const port = await window.electronAPI.getServerPort()
    return `http://localhost:${port}/api`
  }
  return 'http://localhost:3000/api'
}

let apiBase = 'http://localhost:3000/api'

// Initialize API base on first store access
const initApiBase = async () => {
  if (apiBase === 'http://localhost:3000/api') {
    apiBase = await getApiBase()
  }
}

export const useConnectionStore = defineStore('connection', () => {
  const connections = ref<any[]>([])
  const loading = ref(false)

  const fetchConnections = async () => {
    loading.value = true
    try {
      await initApiBase()
      const response = await axios.get(`${apiBase}/connections`)
      connections.value = response.data
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      loading.value = false
    }
  }

  const createConnection = async (data: any) => {
    try {
      await initApiBase()
      const response = await axios.post(`${apiBase}/connections`, data)
      connections.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create connection:', error)
      throw error
    }
  }

  const updateConnection = async (id: string, data: any) => {
    try {
      await initApiBase()
      const response = await axios.put(`${apiBase}/connections/${id}`, data)
      const index = connections.value.findIndex(c => c.id === id)
      if (index !== -1) {
        connections.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to update connection:', error)
      throw error
    }
  }

  const deleteConnection = async (id: string) => {
    try {
      await initApiBase()
      await axios.delete(`${apiBase}/connections/${id}`)
      connections.value = connections.value.filter(c => c.id !== id)
    } catch (error) {
      console.error('Failed to delete connection:', error)
      throw error
    }
  }

  const testConnection = async (data: any) => {
    try {
      await initApiBase()
      const response = await axios.post(`${apiBase}/query/test`, data)
      return response.data
    } catch (error) {
      console.error('Connection test failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    connections,
    loading,
    fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection
  }
})
