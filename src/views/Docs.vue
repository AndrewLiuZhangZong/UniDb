<template>
  <div class="docs-page" :class="{ 'light-mode': !isDarkTheme }">
    <div class="docs-container">
      <h2 class="docs-title">{{ t('help.docs.title') }}</h2>

      <div class="docs-grid">
        <div class="doc-item" @click="openLink('docs')">
          <n-icon class="doc-icon" size="26"><BookOutline /></n-icon>
          <div class="doc-info">
            <h4>{{ t('help.docs.userGuide') }}</h4>
            <p>{{ t('help.docs.userGuideDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>

        <div class="doc-item" @click="openLink('api')">
          <n-icon class="doc-icon" size="26"><CodeSlashOutline /></n-icon>
          <div class="doc-info">
            <h4>{{ t('help.docs.apiRef') }}</h4>
            <p>{{ t('help.docs.apiRefDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>

        <div class="doc-item" @click="openLink('faq')">
          <n-icon class="doc-icon" size="26"><HelpCircleOutline /></n-icon>
          <div class="doc-info">
            <h4>{{ t('help.docs.faq') }}</h4>
            <p>{{ t('help.docs.faqDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>

        <div class="doc-item" @click="openLink('github')">
          <n-icon class="doc-icon" size="26"><LogoGithub /></n-icon>
          <div class="doc-info">
            <h4>GitHub</h4>
            <p>{{ t('help.docs.githubDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import { BookOutline, LogoGithub, ChevronForwardOutline, CodeSlashOutline, HelpCircleOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const openLink = (type: string) => {
  const urls: Record<string, string> = {
    docs: 'https://unidb.com/docs',
    api: 'https://unidb.com/docs/api',
    faq: 'https://unidb.com/docs/faq',
    github: 'https://github.com/AndrewLiuZhangZong/UniDb'
  }
  window.open(urls[type], '_blank')
}
</script>

<style scoped>
.docs-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.docs-container {
  padding: 36px 40px;
  max-width: 700px;
  margin: 0 auto;
}

.docs-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px;
}

.docs-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
  transition: all 0.15s;
}
.doc-item:hover {
  background: var(--accent-primary-subtle);
  border-color: var(--accent-primary-muted);
}

.doc-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
}
.doc-info h4 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
.doc-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-quaternary);
}

.doc-arrow {
  color: var(--text-quaternary);
  flex-shrink: 0;
  opacity: 0.5;
}
</style>