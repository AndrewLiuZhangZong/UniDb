<template>
  <div class="home-container" :class="{ 'light-theme': !isDarkTheme }">
    <!-- Top Bar with Actions -->
    <div class="top-bar" :class="{ 'light-mode': !isDarkTheme }">
      <AppMenuBar />
    </div>

    <!-- Main Layout -->
    <n-layout has-sider class="main-layout" :has-sider="true">
      <!-- Sidebar -->
      <n-layout-sider
        bordered
        :width="260"
        :collapsed-width="0"
        show-trigger="bar"
        collapse-mode="width"
        :native-scrollbar="false"
        class="sidebar"
        :class="{ 'light-mode': !isDarkTheme }"
      >
        <ConnectionTree @select="handleConnectionSelect" />
      </n-layout-sider>

      <!-- Main Content -->
      <n-layout class="content-layout">
        <!-- Connection Header -->
        <div v-if="activeConnection" class="connection-header">
          <div class="connection-header-left">
            <DbTypeIcon :type="activeConnection.type" :size="28" />
            <div class="connection-header-info">
              <h2 class="connection-header-name">{{ activeConnection.name }}</h2>
              <div class="connection-header-meta">
                <n-tag size="small" :type="getDbTypeTagType(activeConnection.type)">
                  {{ getDbTypeName(activeConnection.type) }}
                </n-tag>
                <span class="connection-host">
                  {{ activeConnection.config.host }}:{{ activeConnection.config.port }}
                </span>
              </div>
            </div>
          </div>
          <div class="connection-header-actions">
            <n-button size="small" type="primary" @click="handleConnect">
              <template #icon>
                <n-icon><CloudDoneOutline /></n-icon>
              </template>
              {{ t('connection.connect') }}
            </n-button>
            <n-button size="small" @click="handleEditConnection">
              <template #icon>
                <n-icon><CreateOutline /></n-icon>
              </template>
              {{ t('common.edit') }}
            </n-button>
            <n-button size="small" type="error" ghost @click="handleDeleteConnection">
              <template #icon>
                <n-icon><TrashOutline /></n-icon>
              </template>
              {{ t('common.delete') }}
            </n-button>
          </div>
        </div>

        <!-- Content Area -->
        <n-layout-content class="content-area" :native-scrollbar="false">
          <!-- Welcome Page -->
          <div v-if="!activeConnection" class="welcome-page">
            <div class="welcome-hero">
              <div class="welcome-icon">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="55" fill="url(#heroGrad)" opacity="0.1"/>
                  <circle cx="60" cy="60" r="40" fill="url(#heroGrad)" opacity="0.2"/>
                  <circle cx="60" cy="60" r="25" fill="url(#heroGrad)"/>
                  <defs>
                    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#18a058"/>
                      <stop offset="100%" stop-color="#36b374"/>
                    </linearGradient>
                  </defs>
                </svg>
                <n-icon class="hero-center-icon"><CubeOutline /></n-icon>
              </div>
              <h1 class="welcome-title">{{ t('welcome.title') }}</h1>
              <p class="welcome-subtitle">{{ t('welcome.subtitle') }}</p>
            </div>

            <!-- Supported Databases -->
            <div class="supported-databases">
              <h3 class="supported-title">{{ t('welcome.supported') }}</h3>
              <div class="db-grid">
                <div v-for="db in supportedDatabases" :key="db.type" class="db-card">
                  <DbTypeIcon :type="db.type" :size="40" />
                  <span class="db-label">{{ db.label }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
              <n-button type="primary" size="large" @click="showConnectionDialog = true">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                {{ t('connection.new') }}
              </n-button>
            </div>
          </div>

          <!-- Connection Detail / Query Area -->
          <div v-else class="workspace-area">
            <!-- Tabs -->
            <div class="workspace-tabs">
              <div class="tab active">
                <n-icon><DocumentTextOutline /></n-icon>
                <span>Query 1</span>
                <n-icon class="tab-close"><CloseOutline /></n-icon>
              </div>
              <div class="tab-add">
                <n-icon><AddOutline /></n-icon>
              </div>
            </div>

            <!-- Query Editor Placeholder -->
            <div class="query-editor">
              <div class="editor-toolbar">
                <n-button-group size="small">
                  <n-button>
                    <template #icon>
                      <n-icon><PlayCircleOutline /></n-icon>
                    </template>
                    {{ t('menu.execute') }}
                  </n-button>
                  <n-button>
                    {{ t('menu.format_sql') }}
                  </n-button>
                </n-button-group>
                <n-space>
                  <n-text depth="3" style="font-size: 12px;">
                    {{ activeConnection.config.database || 'No database selected' }}
                  </n-text>
                </n-space>
              </div>
              <div class="editor-content">
                <div class="editor-placeholder">
                  <n-icon :size="48"><CodeSlashOutline /></n-icon>
                  <p>Write your SQL query here...</p>
                </div>
              </div>
              <div class="editor-statusbar">
                <span class="status-item">Ln 1, Col 1</span>
                <span class="status-item">UTF-8</span>
                <span class="status-item">{{ getDbTypeName(activeConnection.type) }}</span>
              </div>
            </div>

            <!-- Results Panel -->
            <div class="results-panel">
              <div class="results-tabs">
                <div class="result-tab active">
                  <n-icon><GridOutline /></n-icon>
                  Results
                </div>
                <div class="result-tab">
                  <n-icon><DownloadOutline /></n-icon>
                  Export
                </div>
              </div>
              <div class="results-placeholder">
                <n-empty description="Execute a query to see results" />
              </div>
            </div>
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>

    <!-- Connection Dialog -->
    <ConnectionDialog
      v-model:show="showConnectionDialog"
      :edit-connection="editingConnection"
      @saved="handleDialogSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NButton,
  NButtonGroup,
  NSpace,
  NTag,
  NIcon,
  NText,
  NEmpty,
  useMessage,
  useDialog
} from 'naive-ui'
import {
  AddOutline,
  CreateOutline,
  TrashOutline,
  CloudDoneOutline,
  CubeOutline,
  DocumentTextOutline,
  CloseOutline,
  PlayCircleOutline,
  ConstructOutline,
  CodeSlashOutline,
  GridOutline,
  DownloadOutline,
  RefreshOutline
} from '@vicons/ionicons5'
import ConnectionTree from '../components/ConnectionTree.vue'
import ConnectionDialog from '../components/ConnectionDialog.vue'
import DbTypeIcon from '../components/DbTypeIcon.vue'
import AppMenuBar from '../components/AppMenuBar.vue'
import { useConnectionStore } from '../stores/connection'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const router = useRouter()
const connectionStore = useConnectionStore()
const settingsStore = useSettingsStore()

const showConnectionDialog = ref(false)
const editingConnection = ref<any>(null)
const activeConnection = ref<any>(null)

// Current theme
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const supportedDatabases = [
  { type: 'mysql', label: 'MySQL' },
  { type: 'clickhouse', label: 'ClickHouse' },
  { type: 'mongodb', label: 'MongoDB' },
  { type: 'redis', label: 'Redis' }
]

// Database type helpers
const getDbTypeName = (type: string) => {
  const names: Record<string, string> = {
    mysql: 'MySQL',
    clickhouse: 'ClickHouse',
    mongodb: 'MongoDB',
    redis: 'Redis'
  }
  return names[type] || type
}

const getDbTypeTagType = (type: string) => {
  const types: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
    mysql: 'success',
    clickhouse: 'warning',
    mongodb: 'info',
    redis: 'error'
  }
  return types[type] || 'default'
}

// Handle connection selection
const handleConnectionSelect = (conn: any) => {
  activeConnection.value = conn
}

// Handle connection actions
const handleConnect = () => {
  message.info(`Connecting to ${activeConnection.value?.name}...`)
}

const handleEditConnection = () => {
  editingConnection.value = activeConnection.value
  showConnectionDialog.value = true
}

const handleDeleteConnection = async () => {
  dialog.warning({
    title: t('connection.deleteConnection'),
    content: `Are you sure you want to delete "${activeConnection.value?.name}"?`,
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await connectionStore.deleteConnection(activeConnection.value.id)
        activeConnection.value = null
        message.success('Connection deleted')
      } catch {
        message.error('Delete failed')
      }
    }
  })
}

// Handle dialog events
const handleDialogSaved = () => {
  editingConnection.value = null
}

// Handle menu actions
const handleMenuAction = (action: string) => {
  console.log('Menu action:', action)
  switch (action) {
    case 'new_connection':
    case 'manage_connections':
      editingConnection.value = null
      showConnectionDialog.value = true
      break
    case 'open_connection':
      message.info('Open connection dialog')
      break
    case 'new_query':
      message.info('New query tab')
      break
    case 'new_tab':
      message.info('New tab')
      break
    case 'export':
      message.info('Export data')
      break
    case 'import':
      message.info('Import data')
      break
    case 'refresh':
      connectionStore.fetchConnections()
      message.success('Refreshed')
      break
    case 'refresh_metadata':
      message.info('Refreshing metadata...')
      break
    case 'create_table':
      message.info('Create table dialog')
      break
    case 'create_database':
      message.info('Create database dialog')
      break
    case 'create_index':
      message.info('Create index dialog')
      break
    case 'connect':
      if (activeConnection.value) {
        message.info(`Connecting to ${activeConnection.value.name}...`)
      } else {
        message.warning('No connection selected')
      }
      break
    case 'disconnect':
      message.info('Disconnect from database')
      break
    case 'execute':
      message.info('Execute query')
      break
    case 'execute_line':
      message.info('Execute current line')
      break
    case 'execute_selection':
      message.info('Execute selection')
      break
    case 'format_sql':
      message.info('Format SQL')
      break
    case 'beautify':
      message.info('Beautify query')
      break
    case 'open_console':
      router.push('/logs')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logs':
      router.push('/logs')
      break
    case 'documentation':
      window.open('https://unidb.com/docs', '_blank')
      break
    case 'keyboard_shortcuts':
      message.info('Keyboard shortcuts dialog')
      break
    case 'report_bug':
      window.open('https://github.com/unidb/unidb/issues', '_blank')
      break
    case 'about':
      dialog.info({
        title: 'UniDb',
        content: `Version: 0.1.0\nElectron: ${window.electronAPI?.versions?.electron || 'N/A'}\nNode: ${window.electronAPI?.versions?.node || 'N/A'}`,
        positiveText: 'OK'
      })
      break
    case 'exit':
      window.close()
      break
    default:
      console.log('Unhandled action:', action)
  }
}

const handleOpenSettings = () => {
  router.push('/settings')
}

// Listen for menu events from main process (macOS native menu)
const handleMenuEvent = (event: Event) => {
  const customEvent = event as CustomEvent<string>
  handleMenuAction(customEvent.detail)
}

onMounted(() => {
  // Listen for menu action events from Electron main process
  window.addEventListener('menu-action', handleMenuEvent)

  // Also set up listener via electronAPI if available
  // @ts-ignore
  if (window.electronAPI?.onMenuAction) {
    // @ts-ignore
    window.electronAPI.onMenuAction(handleMenuAction)
  }
})

onUnmounted(() => {
  window.removeEventListener('menu-action', handleMenuEvent)
})
</script>

<style scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: 28px;
  flex-shrink: 0;
}

.main-layout {
  flex: 1;
  overflow: hidden;
}

.sidebar {
  background: rgba(30, 30, 35, 0.95) !important;
}

.light-theme .sidebar {
  background: rgba(255, 255, 255, 0.98) !important;
}

.content-layout {
  background: linear-gradient(135deg, #1a1a1f 0%, #12121a 100%);
}

.light-theme .content-layout {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
}

/* Connection Header */
.connection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.light-theme .connection-header {
  background: rgba(0, 0, 0, 0.02);
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.connection-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.connection-header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.connection-header-name {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
}

.light-theme .connection-header-name {
  color: rgba(0, 0, 0, 0.95);
}

.connection-header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-host {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', 'Monaco', monospace;
}

.light-theme .connection-host {
  color: rgba(0, 0, 0, 0.4);
}

.connection-header-actions {
  display: flex;
  gap: 8px;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow: auto;
}

/* Welcome Page */
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 48px 24px;
}

.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 48px;
  animation: fadeInUp 0.6s ease;
}

.welcome-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-center-icon {
  position: absolute;
  font-size: 48px;
  color: #18a058;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Supported Databases */
.supported-databases {
  margin-bottom: 48px;
  animation: fadeInUp 0.6s ease 0.1s both;
}

.supported-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.db-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.db-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.db-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.db-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

/* Quick Actions */
.quick-actions {
  animation: fadeInUp 0.6s ease 0.2s both;
}

/* Workspace Area */
.workspace-area {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}

.workspace-tabs {
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  height: 40px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.03);
}

.tab.active {
  color: rgba(255, 255, 255, 0.95);
  border-bottom-color: #18a058;
  background: rgba(255, 255, 255, 0.05);
}

.tab-close {
  font-size: 14px;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.tab:hover .tab-close {
  opacity: 1;
}

.tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.15s;
}

.tab-add:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

/* Query Editor */
.query-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  background: #1e1e1e;
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.editor-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.editor-placeholder p {
  font-size: 14px;
  margin: 0;
}

.editor-statusbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.status-item {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* Results Panel */
.results-panel {
  height: 300px;
  margin: 0 16px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.results-tabs {
  display: flex;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  height: 36px;
}

.result-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.result-tab:hover {
  color: rgba(255, 255, 255, 0.8);
}

.result-tab.active {
  color: rgba(255, 255, 255, 0.95);
  border-bottom-color: #18a058;
}

.results-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 36px);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Light theme for Home page */
.light-theme .welcome-title {
  color: rgba(0, 0, 0, 0.95);
}

.light-theme .welcome-subtitle {
  color: rgba(0, 0, 0, 0.5);
}

.light-theme .supported-title {
  color: rgba(0, 0, 0, 0.4);
}

.light-theme .db-card {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.06);
}

.light-theme .db-card:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

.light-theme .db-label {
  color: rgba(0, 0, 0, 0.8);
}

.light-theme .workspace-tabs {
  background: rgba(0, 0, 0, 0.02);
  border-bottom-color: rgba(0, 0, 0, 0.06);
}

.light-theme .tab {
  color: rgba(0, 0, 0, 0.6);
}

.light-theme .tab:hover {
  color: rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.03);
}

.light-theme .tab.active {
  color: rgba(0, 0, 0, 0.95);
  background: rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .db-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .connection-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .connection-header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
