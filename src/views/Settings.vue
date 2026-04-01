<template>
  <div class="settings-container" :class="{ 'light-theme': !isDarkTheme }">
    <div class="settings-layout">
      <!-- Sidebar -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <n-button text @click="goBack" class="back-btn">
            <template #icon>
              <n-icon><ArrowBackOutline /></n-icon>
            </template>
          </n-button>
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

        <!-- About -->
        <div v-if="activeSection === 'about'" class="settings-section">
          <h3 class="section-title">{{ t('settings.sections.about') }}</h3>

          <div class="about-card">
            <div class="about-logo">
              <svg width="80" height="80" viewBox="0 0 256 256" fill="none">
                <circle cx="128" cy="128" r="100" fill="url(#aboutGrad)"/>
                <ellipse cx="128" cy="88" rx="50" ry="20" fill="rgba(255,255,255,0.3)"/>
                <ellipse cx="128" cy="128" rx="50" ry="20" fill="rgba(255,255,255,0.2)"/>
                <ellipse cx="128" cy="168" rx="50" ry="20" fill="rgba(255,255,255,0.1)"/>
                <defs>
                  <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#18a058"/>
                    <stop offset="100%" stop-color="#36b374"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="about-info">
              <h2 class="about-name">UniDb</h2>
              <p class="about-desc">{{ t('settings.aboutDesc') }}</p>
              <div class="about-meta">
                <span>{{ t('settings.version') }}: 0.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  NIcon,
  NSelect,
  NButton,
  NTag,
  useMessage
} from 'naive-ui'
import {
  ArrowBackOutline,
  SettingsOutline,
  HardwareChipOutline,
  InformationCircleOutline,
  ServerOutline,
  CloudDownloadOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const router = useRouter()
const message = useMessage()

const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const settings = computed(() => settingsStore.settings)

const activeSection = ref('general')

const sections = [
  { key: 'general', icon: SettingsOutline },
  { key: 'drivers', icon: HardwareChipOutline },
  { key: 'about', icon: InformationCircleOutline }
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

const goBack = () => {
  router.push('/')
}

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
  background: #12121a;
  color: rgba(255, 255, 255, 0.9);
  transition: background 0.3s ease, color 0.3s ease;
}

.settings-container.light-theme {
  background: #f5f5f5;
  color: rgba(0, 0, 0, 0.9);
}

.settings-layout {
  display: flex;
  height: 100%;
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

.light-theme .settings-sidebar {
  background: #ffffff;
  border-right-color: rgba(0, 0, 0, 0.08);
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 12px;
}

.light-theme .sidebar-header {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.back-btn {
  font-size: 18px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.light-theme .sidebar-title {
  color: rgba(0, 0, 0, 0.9);
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

.light-theme .nav-item {
  color: rgba(0, 0, 0, 0.7);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.light-theme .nav-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.nav-item.is-active {
  background: rgba(24, 160, 88, 0.15);
  color: #18a058;
}

.light-theme .nav-item.is-active {
  background: rgba(24, 160, 88, 0.1);
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

.light-theme .section-title {
  color: rgba(0, 0, 0, 0.95);
}

.section-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 24px;
}

.light-theme .section-desc {
  color: rgba(0, 0, 0, 0.5);
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

.light-theme .setting-item {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.06);
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

.light-theme .setting-label {
  color: rgba(0, 0, 0, 0.9);
}

.setting-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.light-theme .setting-desc {
  color: rgba(0, 0, 0, 0.4);
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

.light-theme .driver-card {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.06);
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

.driver-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2px;
}

.light-theme .driver-name {
  color: rgba(0, 0, 0, 0.9);
}

.driver-version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.light-theme .driver-version {
  color: rgba(0, 0, 0, 0.4);
}

.driver-actions {
  display: flex;
  justify-content: flex-end;
}

/* About */
.about-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
}

.light-theme .about-card {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.06);
}

.about-logo svg {
  filter: drop-shadow(0 4px 12px rgba(24, 160, 88, 0.3));
}

.about-info {
  flex: 1;
}

.about-name {
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 8px;
}

.light-theme .about-name {
  color: rgba(0, 0, 0, 0.95);
}

.about-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px;
}

.light-theme .about-desc {
  color: rgba(0, 0, 0, 0.5);
}

.about-meta {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.light-theme .about-meta {
  color: rgba(0, 0, 0, 0.4);
}
</style>
