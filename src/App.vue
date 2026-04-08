<template>
  <n-config-provider
    :locale="currentLocale"
    :date-locale="currentDateLocale"
    :theme="lightTheme"
    :theme-overrides="currentThemeOverrides"
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
  zhCN,
  enUS,
  dateZhCN,
  dateEnUS,
  lightTheme,
  type GlobalThemeOverrides
} from 'naive-ui'
import { useSettingsStore } from './stores/settings'
import { getTheme } from './styles/theme-config'
import AppLayout from './components/AppLayout.vue'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

const currentLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? zhCN : enUS
})

const currentDateLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? dateZhCN : dateEnUS
})

// 当前主题配置
const currentThemeConfig = computed(() => {
  return getTheme(settingsStore.settings.accentColor)
})

// Naive UI 主题覆盖配置
const currentThemeOverrides = computed<GlobalThemeOverrides>(() => {
  return currentThemeConfig.value.themeOverrides as GlobalThemeOverrides
})

// 应用主题 class（仅用于 CSS 变量）
const applyThemeClass = () => {
  const themeName = settingsStore.settings.accentColor
  document.body.classList.remove('accent-orange', 'accent-purple')
  document.body.classList.add(`accent-${themeName}`)

  // 应用 CSS 变量
  const cssVars = currentThemeConfig.value.cssVars
  Object.entries(cssVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

watch(
  () => settingsStore.settings.accentColor,
  () => {
    applyThemeClass()
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
  applyThemeClass()
})
</script>
