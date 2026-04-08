<template>
  <div class="about-page">
    <div class="about-container">
      <div class="about-logo">
        <svg width="64" height="64" viewBox="0 0 256 256" fill="none">
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

      <h2 class="about-name">UniDb</h2>
      <p class="about-tagline">{{ t('help.about.tagline') }}</p>

      <div class="about-version-row">
        <span class="version-label">{{ t('help.about.version') }}</span>
        <span class="version-value">v{{ appVersion }}</span>
      </div>

      <div class="about-meta-grid">
        <div class="meta-item">
          <span class="meta-label">{{ t('help.about.electron') }}</span>
          <span class="meta-value">{{ electronVersions.electron }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">{{ t('help.about.node') }}</span>
          <span class="meta-value">{{ electronVersions.node }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">{{ t('help.about.chrome') }}</span>
          <span class="meta-value">{{ electronVersions.chrome }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">{{ t('help.about.platform') }}</span>
          <span class="meta-value">{{ platform }}</span>
        </div>
      </div>

      <div class="about-links">
        <button class="about-link-btn" @click="openLink('docs')">
          <n-icon><BookOutline /></n-icon>
          {{ t('help.about.viewDocs') }}
        </button>
        <button class="about-link-btn" @click="openLink('github')">
          <n-icon><LogoGithub /></n-icon>
          GitHub
        </button>
        <button class="about-link-btn" @click="openLink('issues')">
          <n-icon><BugOutline /></n-icon>
          {{ t('help.about.reportIssue') }}
        </button>
      </div>

      <p class="about-copyright">© 2024–{{ currentYear }} UniDb</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import { BookOutline, LogoGithub, BugOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const appVersion = '0.1.0'
const currentYear = new Date().getFullYear()
const platform = window.electronAPI?.platform === 'darwin' ? 'macOS' : 'Windows'

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
}

.about-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.about-logo svg {
  filter: drop-shadow(0 4px 16px rgba(255, 107, 0, 0.35));
  margin-bottom: 14px;
}

.about-name {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.about-tagline {
  font-size: 13px;
  color: var(--text-quaternary);
  margin: 0 0 20px;
}

.about-version-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.version-label {
  font-size: 13px;
  color: var(--text-quaternary);
}

.version-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
  background: var(--accent-primary-subtle);
  padding: 2px 8px;
  border-radius: 6px;
}

.about-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 22px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
}

.meta-label {
  font-size: 11px;
  color: var(--text-quaternary);
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.about-links {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 24px;
}

.about-link-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 8px;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
  color: var(--text-secondary);
  transition: all 0.15s;
}

.about-link-btn:hover {
  background: var(--accent-primary-subtle);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.about-copyright {
  font-size: 11px;
  color: var(--text-disabled);
  margin: 0;
}
</style>