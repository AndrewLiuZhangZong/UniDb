<template>
  <n-space class="menu-actions" justify="end">
    <!-- Theme Toggle -->
    <n-tooltip trigger="hover" placement="bottom">
      <template #trigger>
        <n-button text @click="toggleTheme">
          <template #icon>
            <n-icon>
              <MoonOutline v-if="isDarkTheme" />
              <SunnyOutline v-else />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ isDarkTheme ? t('settings.lightTheme') : t('settings.darkTheme') }}
    </n-tooltip>

    <!-- Notifications -->
    <n-tooltip trigger="hover" placement="bottom">
      <template #trigger>
        <n-button text>
          <template #icon>
            <n-icon><NotificationsOutline /></n-icon>
          </template>
        </n-button>
      </template>
      {{ t('menu.notifications') }}
    </n-tooltip>

    <!-- Settings -->
    <n-tooltip trigger="hover" placement="bottom">
      <template #trigger>
        <n-button text @click="openSettings">
          <template #icon>
            <n-icon><SettingsOutline /></n-icon>
          </template>
        </n-button>
      </template>
      {{ t('menu.settings') }}
    </n-tooltip>
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon, NTooltip, NSpace } from 'naive-ui'
import {
  NotificationsOutline,
  SettingsOutline,
  MoonOutline,
  SunnyOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()

// Current theme
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

// Toggle theme
const toggleTheme = () => {
  const newTheme = isDarkTheme.value ? 'light' : 'dark'
  settingsStore.updateSetting('theme', newTheme)
}

// Open settings
const openSettings = () => {
  router.push('/settings')
}
</script>

<style scoped>
.menu-actions {
  padding: 0 8px;
}
</style>
