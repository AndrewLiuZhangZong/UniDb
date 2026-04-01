import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const STORAGE_KEY = 'unidb-settings'
const THEME_KEY = 'unidb-theme'

export interface AppSettings {
  language: string
  theme: string
  autoUpdate: boolean
  logRetentionDays: number
  logLevel: string
  enableFileLogging: boolean
  autoCheckUpdate: boolean
  updateChannel: string
  useProxy: boolean
  proxyUrl: string
}

const defaultSettings: AppSettings = {
  language: 'zh-CN',
  theme: 'dark',
  autoUpdate: true,
  logRetentionDays: 30,
  logLevel: 'info',
  enableFileLogging: true,
  autoCheckUpdate: true,
  updateChannel: 'stable',
  useProxy: false,
  proxyUrl: ''
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(loadSettings())

  function loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
    return { ...defaultSettings }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
      // Also sync theme to separate key for CSS
      localStorage.setItem(THEME_KEY, settings.value.theme)
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    settings.value[key] = value
    saveSettings()
  }

  function resetSettings() {
    settings.value = { ...defaultSettings }
    saveSettings()
  }

  function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return settings.value[key]
  }

  return {
    settings,
    updateSetting,
    resetSettings,
    getSetting,
    saveSettings
  }
})
