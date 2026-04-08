<template>
  <div class="settings-container">
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
              <label class="setting-label">{{ t('settings.accentColor') }}</label>
              <p class="setting-desc">{{ t('settings.accentColorDesc') }}</p>
            </div>
            <n-select
              :value="settings.accentColor"
              :options="accentColorOptions"
              style="width: 200px;"
              @update:value="(val) => settingsStore.updateSetting('accentColor', val)"
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
          >
            <div class="driver-header">
              <n-icon class="driver-icon" :size="28">
                <ServerOutline v-if="driver.id === 'mysql' || driver.id === 'mongodb' || driver.id === 'redis'" />
                <CloudDownloadOutline v-else-if="driver.id === 'clickhouse'" />
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
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NSelect, NButton, NTag, NIcon } from 'naive-ui'
import { ServerOutline, CloudDownloadOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const LogsPanel = defineAsyncComponent(() => import('../components/LogsPanel.vue'))

const { t } = useI18n()
const route = useRoute()

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const activeSection = ref('general')

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'general' || tab === 'drivers' || tab === 'logs') {
      activeSection.value = tab as string
    } else {
      activeSection.value = 'general'
    }
  },
  { immediate: true }
)

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const accentColorOptions = computed(() => [
  { label: t('settings.accentOrange'), value: 'orange' },
  { label: t('settings.accentPurple'), value: 'purple' }
])

const drivers = ref([
  { id: 'mysql', name: 'MySQL', version: '8.0', installed: true, outdated: false },
  { id: 'clickhouse', name: 'ClickHouse', version: '0.4.6', installed: true, outdated: false },
  { id: 'mongodb', name: 'MongoDB', version: '7.1', installed: true, outdated: false },
  { id: 'redis', name: 'Redis', version: '5.0', installed: true, outdated: false }
])

const handleInstallDriver = (driver: any) => {
  console.log(`Installing ${driver.name}...`)
}

const handleUpdateDriver = (driver: any) => {
  console.log(`Updating ${driver.name}...`)
}

const handleRemoveDriver = (driver: any) => {
  console.log(`Removing ${driver.name}...`)
}
</script>

<style scoped>
.settings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
  color: var(--text-primary);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 14px;
  color: var(--text-quaternary);
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
  background: var(--bg-row-hover);
  border-radius: 12px;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-disabled);
  margin: 0;
}

.drivers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.driver-card {
  padding: 20px;
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
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
  color: var(--accent-primary);
}

.driver-info {
  flex: 1;
}

.driver-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.driver-version {
  font-size: 12px;
  color: var(--text-disabled);
}

.driver-actions {
  display: flex;
  justify-content: flex-end;
}
</style>