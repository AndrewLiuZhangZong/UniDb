<template>
  <div class="about-page" :class="{ 'light-mode': !isDarkTheme }">
    <div class="about-container">
      <div class="about-card" :style="{ background: isDarkTheme ? '#1e1e26' : '#ffffff' }">
        <div class="about-logo">
          <svg width="72" height="72" viewBox="0 0 256 256" fill="none">
            <circle cx="128" cy="128" r="100" fill="url(#aboutGrad)"/>
            <ellipse cx="128" cy="88" rx="50" ry="20" fill="rgba(255,255,255,0.3)"/>
            <ellipse cx="128" cy="128" rx="50" ry="20" fill="rgba(255,255,255,0.2)"/>
            <ellipse cx="128" cy="168" rx="50" ry="20" fill="rgba(255,255,255,0.1)"/>
            <defs>
              <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF6B00"/>
                <stop offset="100%" stop-color="#36b374"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 class="about-name" :style="{ color: isDarkTheme ? '#fff' : '#1a1a1f' }">UniDb</h2>
        <p class="about-tagline" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }">{{ t('help.about.tagline') }}</p>

        <div class="about-version-row">
          <span class="version-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ t('help.about.version') }}</span>
          <span class="version-value" :style="versionBadgeStyle">v{{ appVersion }}</span>
        </div>

        <div class="about-meta-grid">
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.electron') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ electronVersions.electron }}</span>
          </div>
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.node') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ electronVersions.node }}</span>
          </div>
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.chrome') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ electronVersions.chrome }}</span>
          </div>
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.platform') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ platform }}</span>
          </div>
        </div>

        <div class="about-links">
          <button class="about-link-btn" :style="linkBtnStyle" @click="openLink('docs')">
            <n-icon><BookOutline /></n-icon>
            {{ t('help.about.viewDocs') }}
          </button>
          <button class="about-link-btn" :style="linkBtnStyle" @click="openLink('github')">
            <n-icon><LogoGithub /></n-icon>
            GitHub
          </button>
          <button class="about-link-btn" :style="linkBtnStyle" @click="openLink('issues')">
            <n-icon><BugOutline /></n-icon>
            {{ t('help.about.reportIssue') }}
          </button>
        </div>

        <p class="about-copyright" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }">© 2024–{{ currentYear }} UniDb</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import {
  BookOutline,
  LogoGithub,
  BugOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const appVersion = '0.1.0'
const currentYear = new Date().getFullYear()
const platform = window.electronAPI?.platform === 'darwin' ? 'macOS' : 'Windows'

const accentColor = computed(() => isDarkTheme.value ? '#FF6B00' : '#2080f0')

const versionBadgeStyle = computed(() => ({
  color: accentColor.value,
  background: isDarkTheme.value ? 'rgba(255,107,0,0.12)' : 'rgba(32,128,240,0.1)',
}))

const linkBtnStyle = computed(() => ({
  background: isDarkTheme.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${isDarkTheme.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  color: isDarkTheme.value ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)',
}))

const electronVersions = computed(() => ({
  electron: window.electronAPI?.versions?.electron || 'N/A',
  node: window.electronAPI?.versions?.node || 'N/A',
  chrome: window.electronAPI?.versions?.chrome || 'N/A'
}))

const openLink = (type: string) => {
  const urls: Record<string, string> = {
    docs: 'https://unidb.com/docs',
    github: 'https://github.com/AndrewLiuZhangZong/UniDb',
    issues: 'https://github.com/AndrewLiuZhangZong/UniDb/issues'
  }
  window.open(urls[type], '_blank')
}
</script>

<style scoped>
.about-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
  transition: background 0.2s;
}

.about-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 100%;
}

.about-card {
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: background 0.2s;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.about-logo svg {
  filter: drop-shadow(0 4px 16px rgba(255, 107, 0, 0.35));
  margin-bottom: 12px;
}

.about-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  transition: color 0.2s;
}

.about-tagline {
  font-size: 13px;
  margin: 0 0 20px;
  transition: color 0.2s;
}

.about-version-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.version-label {
  font-size: 13px;
  transition: color 0.2s;
}

.version-value {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}

.about-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.2s;
}

.meta-label {
  font-size: 11px;
  transition: color 0.2s;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  font-family: 'SF Mono', 'Monaco', monospace;
  transition: color 0.2s;
}

.about-links {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
}

.about-link-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.about-link-btn:hover {
  background: rgba(255,107,0,0.15) !important;
  border-color: rgba(255,107,0,0.4) !important;
  color: #FF6B00 !important;
}

.about-link-btn n-icon {
  font-size: 14px;
}

.about-copyright {
  font-size: 11px;
  margin: 0;
  transition: color 0.2s;
}
</style>
