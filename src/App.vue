<template>
  <n-config-provider
    :locale="currentLocale"
    :date-locale="currentDateLocale"
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
  dateEnUS
} from 'naive-ui'
import { useSettingsStore } from './stores/settings'
import AppLayout from './components/AppLayout.vue'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

const currentLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? zhCN : enUS
})

const currentDateLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? dateZhCN : dateEnUS
})

// 切换主题色 class（由 accent-*.css 控制所有样式）
const applyThemeClass = () => {
  const { accentColor } = settingsStore.settings
  document.body.classList.remove('accent-orange', 'accent-purple')
  document.body.classList.add(`accent-${accentColor}`)
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
