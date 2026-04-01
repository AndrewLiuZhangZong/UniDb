<template>
  <div class="settings-container">
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
                v-model:value="settings.theme"
                :options="themeOptions"
                style="width: 200px;"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.autoUpdate') }}</label>
                <p class="setting-desc">{{ t('settings.autoUpdateDesc') }}</p>
              </div>
              <n-switch v-model:value="settings.autoUpdate" />
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

          <div class="add-driver">
            <n-button type="primary" @click="showAddDriverModal = true">
              <template #icon>
                <n-icon><AddOutline /></n-icon>
              </template>
              {{ t('settings.addDriver') }}
            </n-button>
          </div>
        </div>

        <!-- Log Settings -->
        <div v-if="activeSection === 'logs'" class="settings-section">
          <h3 class="section-title">{{ t('settings.sections.logs') }}</h3>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.logRetention') }}</label>
                <p class="setting-desc">{{ t('settings.logRetentionDesc') }}</p>
              </div>
              <n-input-number
                v-model:value="settings.logRetentionDays"
                :min="1"
                :max="365"
                style="width: 120px;"
              />
              <span class="setting-suffix">{{ t('settings.days') }}</span>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.logLevel') }}</label>
                <p class="setting-desc">{{ t('settings.logLevelDesc') }}</p>
              </div>
              <n-select
                v-model:value="settings.logLevel"
                :options="logLevelOptions"
                style="width: 200px;"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.enableFileLogging') }}</label>
                <p class="setting-desc">{{ t('settings.enableFileLoggingDesc') }}</p>
              </div>
              <n-switch v-model:value="settings.enableFileLogging" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.maxLogFileSize') }}</label>
                <p class="setting-desc">{{ t('settings.maxLogFileSizeDesc') }}</p>
              </div>
              <n-input-number
                v-model:value="settings.maxLogFileSize"
                :min="1"
                :max="100"
                style="width: 120px;"
              />
              <span class="setting-suffix">MB</span>
            </div>
          </div>

          <div class="setting-actions">
            <n-button @click="handleOpenLogViewer">
              <template #icon>
                <n-icon><DocumentTextOutline /></n-icon>
              </template>
              {{ t('settings.viewLogs') }}
            </n-button>
          </div>
        </div>

        <!-- Update Settings -->
        <div v-if="activeSection === 'updates'" class="settings-section">
          <h3 class="section-title">{{ t('settings.sections.updates') }}</h3>

          <div class="update-status-card">
            <div class="update-status-info">
              <div class="update-version">
                <n-icon :size="24"><RocketOutline /></n-icon>
                <div>
                  <h4>UniDb</h4>
                  <p>{{ t('settings.currentVersion') }}: {{ currentVersion }}</p>
                </div>
              </div>
              <div v-if="updateAvailable" class="update-available">
                <n-tag type="success">{{ t('settings.updateAvailable') }}</n-tag>
                <p>{{ t('settings.newVersion') }}: {{ latestVersion }}</p>
              </div>
            </div>
            <div class="update-actions">
              <n-button v-if="updateAvailable" type="primary" @click="handleCheckUpdate">
                {{ t('settings.downloadUpdate') }}
              </n-button>
              <n-button v-else @click="handleCheckUpdate">
                {{ t('settings.checkForUpdates') }}
              </n-button>
            </div>
          </div>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.autoCheckUpdate') }}</label>
                <p class="setting-desc">{{ t('settings.autoCheckUpdateDesc') }}</p>
              </div>
              <n-switch v-model:value="settings.autoCheckUpdate" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.updateChannel') }}</label>
                <p class="setting-desc">{{ t('settings.updateChannelDesc') }}</p>
              </div>
              <n-select
                v-model:value="settings.updateChannel"
                :options="updateChannelOptions"
                style="width: 200px;"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.proxySettings') }}</label>
                <p class="setting-desc">{{ t('settings.proxySettingsDesc') }}</p>
              </div>
              <n-switch v-model:value="settings.useProxy" />
            </div>

            <div v-if="settings.useProxy" class="setting-item nested">
              <div class="setting-info">
                <label class="setting-label">{{ t('settings.proxyUrl') }}</label>
              </div>
              <n-input
                v-model:value="settings.proxyUrl"
                placeholder="http://proxy:8080"
                style="width: 300px;"
              />
            </div>
          </div>

          <n-divider />

          <div class="update-history">
            <h4>{{ t('settings.updateHistory') }}</h4>
            <div class="history-list">
              <div v-for="(version, index) in updateHistory" :key="index" class="history-item">
                <div class="history-version">
                  <n-tag size="small">{{ version.version }}</n-tag>
                  <span class="history-date">{{ version.date }}</span>
                </div>
                <p class="history-changes">{{ version.changes }}</p>
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
                <span>{{ t('settings.version') }}: {{ currentVersion }}</span>
                <span>{{ t('settings.electron') }}: {{ electronVersion }}</span>
                <span>{{ t('settings.node') }}: {{ nodeVersion }}</span>
              </div>
            </div>
          </div>

          <n-divider />

          <div class="links-section">
            <h4>{{ t('settings.links') }}</h4>
            <div class="links-grid">
              <a href="#" class="link-item">
                <n-icon><BookOutline /></n-icon>
                <span>{{ t('settings.documentation') }}</span>
              </a>
              <a href="#" class="link-item">
                <n-icon><LogoGithub /></n-icon>
                <span>GitHub</span>
              </a>
              <a href="#" class="link-item">
                <n-icon><BugOutline /></n-icon>
                <span>{{ t('settings.reportIssue') }}</span>
              </a>
              <a href="#" class="link-item">
                <n-icon><HeartOutline /></n-icon>
                <span>{{ t('settings.support') }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  NIcon,
  NSelect,
  NSwitch,
  NInputNumber,
  NInput,
  NButton,
  NTag,
  NDivider,
  useMessage
} from 'naive-ui'
import {
  SettingsOutline,
  GlobeOutline,
  ConstructOutline,
  DocumentTextOutline,
  RocketOutline,
  InformationCircleOutline,
  AddOutline,
  BookOutline,
  HeartOutline,
  BugOutline,
  HardwareChipOutline,
  ServerOutline,
  CloudDownloadOutline
} from '@vicons/ionicons5'
import { LogoGithub } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const router = useRouter()
const message = useMessage()

const activeSection = ref('general')
const showAddDriverModal = ref(false)

const currentVersion = ref('0.1.0')
const latestVersion = ref('0.2.0')
const updateAvailable = ref(true)
const electronVersion = ref('28.0.0')
const nodeVersion = ref('18.0.0')

const sections = [
  { key: 'general', icon: SettingsOutline },
  { key: 'drivers', icon: HardwareChipOutline },
  { key: 'logs', icon: DocumentTextOutline },
  { key: 'updates', icon: RocketOutline },
  { key: 'about', icon: InformationCircleOutline }
]

const settingsStore = useSettingsStore()

// Use settings from store
const settings = computed(() => settingsStore.settings)

// Watch for language changes
watch(
  () => settings.value.language,
  (newLang) => {
    settingsStore.updateSetting('language', newLang)
  }
)

// Watch for theme changes
watch(
  () => settings.value.theme,
  (newTheme) => {
    settingsStore.updateSetting('theme', newTheme)
  }
)

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const themeOptions = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' }
]

const logLevelOptions = [
  { label: 'DEBUG', value: 'debug' },
  { label: 'INFO', value: 'info' },
  { label: 'WARN', value: 'warn' },
  { label: 'ERROR', value: 'error' }
]

const updateChannelOptions = [
  { label: 'Stable', value: 'stable' },
  { label: 'Beta', value: 'beta' },
  { label: 'Dev', value: 'dev' }
]

const drivers = ref([
  { id: 'mysql-connector', name: 'MySQL Connector', version: '8.0.33', installed: true, outdated: true, icon: ServerOutline },
  { id: 'postgresql', name: 'PostgreSQL JDBC', version: '42.6.0', installed: false, outdated: false, icon: ServerOutline },
  { id: 'clickhouse', name: 'ClickHouse JDBC', version: '0.4.6', installed: true, outdated: false, icon: CloudDownloadOutline },
  { id: 'mariadb', name: 'MariaDB Connector', version: '3.1.4', installed: false, outdated: false, icon: ServerOutline }
])

const updateHistory = ref([
  { version: '0.1.0', date: '2024-01-15', changes: 'Initial release with MySQL, ClickHouse, MongoDB, Redis support' },
  { version: '0.0.5', date: '2024-01-10', changes: 'Beta testing phase' }
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

const handleCheckUpdate = () => {
  message.info(t('settings.checkingUpdate'))
}

const handleOpenLogViewer = () => {
  router.push('/logs')
}
</script>

<style scoped>
.settings-container {
  height: 100%;
  background: var(--n-color);
}

.settings-layout {
  display: flex;
  height: 100%;
}

/* Sidebar */
.settings-sidebar {
  width: 240px;
  background: rgba(30, 30, 35, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  color: rgba(255, 255, 255, 0.6);
}

.nav-item.is-active .nav-icon {
  color: #18a058;
}

.nav-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.nav-item.is-active .nav-label {
  color: rgba(255, 255, 255, 0.95);
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
  gap: 24px;
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
}

.setting-item.nested {
  background: rgba(255, 255, 255, 0.01);
  border: none;
  padding-left: 40px;
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

.setting-suffix {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 8px;
}

.setting-actions {
  margin-top: 24px;
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

.driver-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.driver-card.is-outdated {
  border-color: rgba(240, 160, 32, 0.3);
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

.driver-version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.driver-actions {
  display: flex;
  justify-content: flex-end;
}

.add-driver {
  display: flex;
}

/* Update Status */
.update-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: rgba(24, 160, 88, 0.08);
  border: 1px solid rgba(24, 160, 88, 0.2);
  border-radius: 12px;
  margin-bottom: 24px;
}

.update-status-info {
  flex: 1;
}

.update-version {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.update-version h4 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.update-version p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.update-available {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-available p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Update History */
.update-history {
  margin-top: 24px;
}

.update-history h4 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.history-version {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.history-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.history-changes {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
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

.about-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px;
}

.about-meta {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.links-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.15s ease;
}

.link-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.95);
}
</style>
