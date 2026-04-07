<template>
  <div class="docs-page" :class="{ 'light-mode': !isDarkTheme }">
    <div class="docs-container">
      <div class="docs-card" :style="{ background: isDarkTheme ? '#1e1e26' : '#ffffff' }">
        <h2 class="docs-title" :style="{ color: isDarkTheme ? '#fff' : '#1a1a1f' }">
          {{ t('help.docs.title') }}
        </h2>

        <div class="docs-grid">
          <div
            class="doc-item"
            :style="docItemStyle"
            @click="openLink('docs')"
            @mouseenter="hoveredItem = 'userGuide'"
            @mouseleave="hoveredItem = null"
          >
            <n-icon class="doc-icon" size="28"><BookOutline /></n-icon>
            <div class="doc-info">
              <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">
                {{ t('help.docs.userGuide') }}
              </h4>
              <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">
                {{ t('help.docs.userGuideDesc') }}
              </p>
            </div>
            <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
          </div>

          <div
            class="doc-item"
            :style="docItemStyle"
            @click="openLink('api')"
            @mouseenter="hoveredItem = 'apiRef'"
            @mouseleave="hoveredItem = null"
          >
            <n-icon class="doc-icon" size="28"><CodeSlashOutline /></n-icon>
            <div class="doc-info">
              <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">
                {{ t('help.docs.apiRef') }}
              </h4>
              <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">
                {{ t('help.docs.apiRefDesc') }}
              </p>
            </div>
            <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
          </div>

          <div
            class="doc-item"
            :style="docItemStyle"
            @click="openLink('faq')"
            @mouseenter="hoveredItem = 'faq'"
            @mouseleave="hoveredItem = null"
          >
            <n-icon class="doc-icon" size="28"><HelpCircleOutline /></n-icon>
            <div class="doc-info">
              <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">
                {{ t('help.docs.faq') }}
              </h4>
              <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">
                {{ t('help.docs.faqDesc') }}
              </p>
            </div>
            <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
          </div>

          <div
            class="doc-item"
            :style="docItemStyle"
            @click="openLink('github')"
            @mouseenter="hoveredItem = 'github'"
            @mouseleave="hoveredItem = null"
          >
            <n-icon class="doc-icon" size="28"><LogoGithub /></n-icon>
            <div class="doc-info">
              <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">GitHub</h4>
              <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">
                {{ t('help.docs.githubDesc') }}
              </p>
            </div>
            <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
          </div>
        </div>

        <div class="docs-footer">
          <n-button size="large" @click="goBack">
            <template #icon><n-icon><ArrowBackOutline /></n-icon></template>
            {{ t('common.back') }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton } from 'naive-ui'
import {
  BookOutline, LogoGithub, ChevronForwardOutline,
  CodeSlashOutline, HelpCircleOutline, ArrowBackOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()

const hoveredItem = ref<string | null>(null)
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const accentColor = computed(() => isDarkTheme.value ? '#FF6B00' : '#2080f0')

const docItemStyle = computed(() => ({
  background: isDarkTheme.value ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
  border: `1px solid ${isDarkTheme.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
}))

const openLink = (type: string) => {
  const urls: Record<string, string> = {
    docs: 'https://unidb.com/docs',
    api: 'https://unidb.com/docs/api',
    faq: 'https://unidb.com/docs/faq',
    github: 'https://github.com/AndrewLiuZhangZong/UniDb'
  }
  window.open(urls[type], '_blank')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.docs-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
  transition: background 0.2s;
}

.docs-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 100%;
}

.docs-card {
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  transition: background 0.2s;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.docs-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 24px;
  text-align: center;
  transition: color 0.2s;
}

.docs-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.doc-item:hover {
  background: rgba(255, 107, 0, 0.1) !important;
  border-color: rgba(255, 107, 0, 0.2) !important;
}

.doc-icon {
  color: #FF6B00;
  flex-shrink: 0;
  transition: color 0.2s;
}

.doc-info {
  flex: 1;
}

.doc-info h4 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.doc-info p {
  margin: 0;
  font-size: 12px;
  transition: color 0.2s;
}

.doc-arrow {
  opacity: 0.25;
  flex-shrink: 0;
  transition: color 0.2s;
}

.docs-footer {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}
</style>