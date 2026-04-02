<template>
  <div class="settings-container" :class="{ 'light-theme': !isDarkTheme }">
    <div class="settings-layout">
      <!-- Sidebar -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">{{ t('settings.title') }}</h2>
        </div>
        <div class="settings-nav">
          <div
            v-for="section in sections"
            :key="section.key"
            class="nav-item"
            :class="{ 'is-active': activeSection === section.key }"
            @click="activeSection = section.key"
          >
            <n-icon class="nav-icon"><component :is="section.icon" /></n-icon>
            <span class="nav-label">{{ t(`settings.sections.${section.key}`) }}</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="settings-content">
        <!-- General Settings -->
        <div v-if="activeSection === 'general'" class="settings-section">
          <h3 class="section-title">{{ t('settings.sections.general') }}</h3>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.language') }}</label>
                <p class="setting-desc">{{ t('settings.languageDesc') }}</p>
              </div>
              <n-select
                :value="settings.language"
                :options="languageOptions"
                style="width: 200px;"
                @update:value="(val) => settingsStore.updateSetting('language', val)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.theme') }}</label>
                <p class="setting-desc">{{ t('settings.themeDesc') }}</p>
              </div>
              <n-select
                :value="settings.theme"
                :options="themeOptions"
                style="width: 200px;"
                @update:value="(val) => settingsStore.updateSetting('theme', val)"
              />
            </div>
          </div>
        </div>

        <!-- Driver Management -->
        <div v-if="activeSection === 'drivers'" class="settings-section">
          <h3 class="section-title">{{ t('settings.sections.drivers') }}</h3>
          <p class="section-desc">{{ t('settings.driversDesc') }}</p>

          <div class="drivers-grid">
            <div
              v-for="driver in drivers"
              :key="driver.id"
              class="driver-card"
              :class="{ 'is-installed': driver.installed, 'is-outdated': driver.outdated }"
            >
              <div class="driver-header">
                <n-icon class="driver-icon" :size="32">
                  <Component :is="driver.icon" />
                </n-icon>
                <div class="driver-info">
                  <h4 class="driver-name">{{ driver.name }}</h4>
                  <span class="driver-version">v{{ driver.version }}</span>
                </div>
                <n-tag v-if="driver.outdated" type="warning" size="small">
                  {{ t('settings.outdated') }}
                </n-tag>
                <n-tag v-else-if="driver.installed" type="success" size="small">
                  {{ t('settings.installed') }}
                </n-tag>
              </div>
              <div class="driver-actions">
                <n-button
                  v-if="!driver.installed"
                  type="primary"
                  size="small"
                  @click="handleInstallDriver(driver)"
                >
                  {{ t('settings.install') }}
                </n-button>
                <n-button
                  v-else-if="driver.outdated"
                  type="info"
                  size="small"
                  @click="handleUpdateDriver(driver)"
                >
                  {{ t('settings.update') }}
                </n-button>
                <n-button
                  v-else
                  size="small"
                  @click="handleRemoveDriver(driver)"
                >
                  {{ t('settings.remove') }}
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <!-- logs -->
        <div v-if="activeSection === 'logs'" class="settings-section">
          <h3 class="section-title">{{ t('settings.sections.logs') }}</h3>
          <p class="section-desc">{{ t('settings.logsDesc') }}</p>
          <LogsPanel />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NSelect, NButton, NTag, useMessage } from 'naive-ui'
import {
  SettingsOutline, HardwareChipOutline,
  ServerOutline, CloudDownloadOutline, ListOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const LogsPanel = defineAsyncComponent(() => import('../components/LogsPanel.vue'))

const { t } = useI18n()
const message = useMessage()

const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const settings = computed(() => settingsStore.settings)

const activeSection = ref('general')

const sections = [
  { key: 'general', icon: SettingsOutline },
  { key: 'drivers', icon: HardwareChipOutline },
  { key: 'logs', icon: ListOutline }
]

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const themeOptions = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' }
]

const drivers = ref([
  { id: 'mysql', name: 'MySQL', version: '8.0', installed: true, outdated: false, icon: ServerOutline },
  { id: 'clickhouse', name: 'ClickHouse', version: '0.4.6', installed: true, outdated: false, icon: CloudDownloadOutline },
  { id: 'mongodb', name: 'MongoDB', version: '7.1', installed: true, outdated: false, icon: ServerOutline },
  { id: 'redis', name: 'Redis', version: '5.0', installed: true, outdated: false, icon: ServerOutline }
])

const handleInstallDriver = (driver: any) => {
  message.info(`Installing ${driver.name}...`)
}

const handleUpdateDriver = (driver: any) => {
  message.info(`Updating ${driver.name}...`)
}

const handleRemoveDriver = (driver: any) => {
  message.warning(`Removing ${driver.name}...`)
}
</script>

<style scoped>
.settings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #12121a;
  color: rgba(255, 255, 255, 0.9);
  transition: background 0.3s ease, color 0.3s ease;
}

.settings-layout {
  display: flex;
  flex: 1;
}

/* Sidebar */
.settings-sidebar {
  width: 240px;
  background: #1e1e23;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  transition: background 0.3s ease;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.settings-nav {
  flex: 1;
  padding: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.7);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.nav-item.is-active {
  background: rgba(24, 160, 88, 0.15);
  color: #18a058;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-size: 14px;
}

/* Content */
.settings-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.settings-section {
  max-width: 800px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 24px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Drivers */
.drivers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.driver-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.driver-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.driver-icon {
  color: #18a058;
}

.driver-info {
  flex: 1;
}

.driverName {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2px;
}

.driver-version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.driver-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
