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
import darkThemeCSS from './styles/theme-dark.css?inline'
import lightThemeCSS from './styles/theme-light.css?inline'
import { createThemeOverrides } from './styles/theme-config'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

const themeStyleId = 'app-theme-styles'

const currentTheme = computed(() => {
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

// Accent color CSS variable sets
const ORANGE_ACCENT_CSS = `
  :root {
    --accent-primary: #FF6B00;
    --accent-primary-hover: #FF8C42;
    --accent-primary-pressed: #CC5500;
    --accent-primary-subtle: rgba(255, 107, 0, 0.15);
    --accent-primary-subtle-hover: rgba(255, 107, 0, 0.25);
    --type-number: #FF6B00;
    --type-number-bg: rgba(255, 107, 0, 0.12);
  }
  body.light-theme {
    --accent-primary-subtle: rgba(255, 107, 0, 0.10);
    --accent-primary-subtle-hover: rgba(255, 107, 0, 0.18);
    --type-number-bg: rgba(255, 107, 0, 0.10);
  }
`

const PURPLE_ACCENT_CSS = `
  :root {
    --accent-primary: #7c3aed;
    --accent-primary-hover: #8b5cf6;
    --accent-primary-pressed: #6d28d9;
    --accent-primary-subtle: rgba(124, 58, 237, 0.22);
    --accent-primary-subtle-hover: rgba(124, 58, 237, 0.32);
    --type-number: #7c3aed;
    --type-number-bg: rgba(124, 58, 237, 0.12);
  }
  body.light-theme {
    --accent-primary-subtle: rgba(124, 58, 237, 0.10);
    --accent-primary-subtle-hover: rgba(124, 58, 237, 0.16);
    --type-number-bg: rgba(124, 58, 237, 0.10);
  }
`

const accentStyleId = 'app-accent-styles'

// Apply theme CSS to document
const applyThemeCSS = (isDark: boolean) => {
  let styleEl = document.getElementById(themeStyleId) as HTMLStyleElement

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = themeStyleId
    document.head.appendChild(styleEl)
  }

  if (isDark) {
    document.body.classList.remove('light-theme')
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
    document.body.classList.add('light-theme')
  }

  styleEl.textContent = isDark ? darkThemeCSS : lightThemeCSS
}

const applyAccentCSS = (accent: string) => {
  let styleEl = document.getElementById(accentStyleId) as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = accentStyleId
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = accent === 'purple' ? PURPLE_ACCENT_CSS : ORANGE_ACCENT_CSS
}

// Watch for theme changes
watch(
  () => settingsStore.settings.theme,
  (newTheme) => {
    const isDark = newTheme === 'dark'
    applyThemeCSS(isDark)
  },
  { immediate: true }
)

watch(
  () => settingsStore.settings.accentColor,
  (accent) => {
    applyAccentCSS(accent)
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
  const isDark = settingsStore.settings.theme === 'dark'
  applyThemeCSS(isDark)
  applyAccentCSS(settingsStore.settings.accentColor)
})
</script>
