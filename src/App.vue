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
  return createThemeOverrides(isDark)
})

// Apply theme CSS to document
const applyThemeCSS = (isDark: boolean) => {
  let styleEl = document.getElementById(themeStyleId) as HTMLStyleElement

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = themeStyleId
    document.head.appendChild(styleEl)
  }

  // Update body class
  if (isDark) {
    document.body.classList.remove('light-theme')
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
    document.body.classList.add('light-theme')
  }

  // Inject theme CSS
  styleEl.textContent = isDark ? darkThemeCSS : lightThemeCSS
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
  // Apply initial theme
  const isDark = settingsStore.settings.theme === 'dark'
  applyThemeCSS(isDark)
})
</script>
