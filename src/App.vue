<template>
  <n-config-provider
    :theme="currentTheme"
    :locale="currentLocale"
    :date-locale="currentDateLocale"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <AppLayout />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  darkTheme,
  lightTheme,
  zhCN,
  enUS,
  dateZhCN,
  dateEnUS
} from 'naive-ui'
import { useSettingsStore } from './stores/settings'
import AppLayout from './components/AppLayout.vue'
import { createThemeOverrides, generateCSS } from './styles/theme-config'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

const themeStyleId = 'app-theme-styles'

const currentTheme = computed(() => {
  // 深色/浅色主题切换由 Naive UI 主题控制
  return settingsStore.settings.theme === 'dark' ? darkTheme : lightTheme
})

const currentLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? zhCN : enUS
})

const currentDateLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? dateZhCN : dateEnUS
})

const themeOverrides = computed(() => {
  const isDark = settingsStore.settings.theme === 'dark'
  const accent = settingsStore.settings.accentColor
  return createThemeOverrides(isDark, accent)
})

// ── 动态注入 CSS（主题色 + 深浅色变量） ──────────────────────────
const applyCSS = (accent: string, isDark: boolean) => {
  let styleEl = document.getElementById(themeStyleId) as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = themeStyleId
    document.head.appendChild(styleEl)
  }

  // 主题色类
  if (isDark) {
    document.body.classList.remove('light-theme')
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
    document.body.classList.add('light-theme')
  }

  // 注入完整 CSS（包含所有主题色 + 深浅色变量）
  styleEl.textContent = generateCSS(accent as 'orange' | 'purple')
}

watch(
  [() => settingsStore.settings.theme, () => settingsStore.settings.accentColor],
  ([theme, accent]) => {
    applyCSS(accent, theme === 'dark')
  },
  { immediate: true }
)

watch(
  () => settingsStore.settings.language,
  (newLang) => {
    locale.value = newLang
  },
  { immediate: true }
)

onMounted(() => {
  if (settingsStore.settings.language) {
    locale.value = settingsStore.settings.language
  }
  applyCSS(settingsStore.settings.accentColor, settingsStore.settings.theme === 'dark')
})
</script>
