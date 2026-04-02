<template>
  <div class="home-container" :class="{ 'light-theme': !isDarkTheme }">

    <n-layout has-sider class="main-layout">

      <!-- Column 1: Connection List -->
      <n-layout-sider
        bordered
        :width="220"
        :collapsed-width="0"
        show-trigger="bar"
        collapse-mode="width"
        :native-scrollbar="false"
        class="conn-sidebar"
        :class="{ 'light-mode': !isDarkTheme }"
      >
        <ConnectionTree @select="handleConnectionSelect" />
      </n-layout-sider>

      <!-- Column 2 + 3: DB Explorer + Workspace -->
      <n-layout class="content-layout">

        <!-- No connection selected: welcome -->
        <div v-if="!activeConnection" class="welcome-page">
          <div class="welcome-hero">
            <div class="welcome-icon">
              <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="55" fill="url(#heroGrad)" opacity="0.08"/>
                <circle cx="60" cy="60" r="38" fill="url(#heroGrad)" opacity="0.15"/>
                <circle cx="60" cy="60" r="22" fill="url(#heroGrad)"/>
                <defs>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#18a058"/><stop offset="100%" stop-color="#36b374"/>
                  </linearGradient>
                </defs>
              </svg>
              <n-icon class="hero-center-icon"><CubeOutline /></n-icon>
            </div>
            <h1 class="welcome-title">{{ t('welcome.title') }}</h1>
            <p class="welcome-subtitle">{{ t('welcome.subtitle') }}</p>
          </div>
          <div class="supported-databases">
            <h3 class="supported-title">{{ t('welcome.supported') }}</h3>
            <div class="db-grid">
              <div v-for="db in supportedDatabases" :key="db.type" class="db-card"
                   @click="showConnectionDialog = true">
                <DbTypeIcon :type="db.type" :size="38" />
                <span class="db-label">{{ db.label }}</span>
              </div>
            </div>
          </div>
          <n-button type="primary" size="large" @click="showConnectionDialog = true">
            <template #icon><n-icon><AddOutline /></n-icon></template>
            {{ t('connection.new') }}
          </n-button>
        </div>

        <!-- Active connection: DB Explorer + Workspace -->
        <div v-else class="workspace-shell">

          <!-- Column 2: DB Tree Explorer (left side of content) -->
          <div class="db-tree-panel" :class="{ 'light-mode': !isDarkTheme }">
            <!-- Mini connection info header -->
            <div class="panel-conn-header">
              <DbTypeIcon :type="activeConnection.type" :size="18" />
              <div class="panel-conn-info">
                <span class="panel-conn-name">{{ activeConnection.name }}</span>
                <span class="panel-conn-host">{{ activeConnection.config?.host }}:{{ activeConnection.config?.port }}</span>
              </div>
              <n-tooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <n-button text size="tiny" @click="handleConnect">
                    <template #icon>
                      <n-icon :color="isConnected ? '#18a058' : (isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')">
                        <RadioButtonOn v-if="isConnected" /><RadioButtonOffOutline v-else />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
                {{ isConnected ? t('connection.disconnect') : t('connection.connect') }}
              </n-tooltip>
            </div>

            <!-- Per-DB explorer tree -->
            <component
              :is="explorerComponent"
              :connection="activeConnection"
              @select-item="handleExplorerSelectItem"
              @db-change="handleDbChange"
            />
          </div>

          <!-- Column 3: Main workspace content -->
          <div class="workspace-main">
            <component
              :is="workspaceComponent"
              :connection="activeConnection"
              :selected-item="selectedItem"
              :selected-item-type="selectedItemType"
              :active-db="activeDb"
            />
          </div>

        </div>
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
import {
  NLayout, NLayoutSider, NButton, NIcon, NTag, NTooltip,
  useMessage, useDialog
} from 'naive-ui'
import {
  AddOutline, CubeOutline, RadioButtonOn, RadioButtonOffOutline
} from '@vicons/ionicons5'
import ConnectionTree from '../components/ConnectionTree.vue'
import ConnectionDialog from '../components/ConnectionDialog.vue'
import DbTypeIcon from '../components/DbTypeIcon.vue'

// Lazy-load DB-specific components
import MySQLExplorer from '../components/database/MySQL/MySQLExplorer.vue'
import MySQLWorkspace from '../components/database/MySQL/MySQLWorkspace.vue'
import ClickHouseExplorer from '../components/database/ClickHouse/ClickHouseExplorer.vue'
import ClickHouseWorkspace from '../components/database/ClickHouse/ClickHouseWorkspace.vue'
import MongoDBExplorer from '../components/database/MongoDB/MongoDBExplorer.vue'
import MongoDBWorkspace from '../components/database/MongoDB/MongoDBWorkspace.vue'
import RedisExplorer from '../components/database/Redis/RedisExplorer.vue'
import RedisWorkspace from '../components/database/Redis/RedisWorkspace.vue'

import { useConnectionStore } from '../stores/connection'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const connectionStore = useConnectionStore()
const settingsStore = useSettingsStore()

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const showConnectionDialog = ref(false)
const editingConnection = ref<any>(null)
const activeConnection = ref<any>(null)
const isConnected = ref(false)
const selectedItem = ref<any>(null)
const selectedItemType = ref<string>('')
const activeDb = ref<string>('')

const supportedDatabases = [
  { type: 'mysql', label: 'MySQL' },
  { type: 'clickhouse', label: 'ClickHouse' },
  { type: 'mongodb', label: 'MongoDB' },
  { type: 'redis', label: 'Redis' }
]

// Route to the correct Explorer / Workspace by db type
const explorerMap: Record<string, any> = {
  mysql: MySQLExplorer,
  clickhouse: ClickHouseExplorer,
  mongodb: MongoDBExplorer,
  redis: RedisExplorer
}
const workspaceMap: Record<string, any> = {
  mysql: MySQLWorkspace,
  clickhouse: ClickHouseWorkspace,
  mongodb: MongoDBWorkspace,
  redis: RedisWorkspace
}

const explorerComponent = computed(() => explorerMap[activeConnection.value?.type] ?? null)
const workspaceComponent = computed(() => workspaceMap[activeConnection.value?.type] ?? null)

const handleConnectionSelect = (conn: any) => {
  activeConnection.value = conn
  selectedItem.value = null
  selectedItemType.value = ''
  isConnected.value = false
}

const handleConnect = () => {
  isConnected.value = !isConnected.value
  message.success(isConnected.value
    ? `Connected to ${activeConnection.value?.name}`
    : `Disconnected from ${activeConnection.value?.name}`)
}

const handleExplorerSelectItem = (item: any, type: string) => {
  selectedItem.value = item
  selectedItemType.value = type
}

const handleDbChange = (db: string) => {
  activeDb.value = db
}

const handleDialogSaved = () => { editingConnection.value = null }

// Menu action handler (kept for AppLayout events)
const handleMenuAction = (action: string) => {
  switch (action) {
    case 'newConnection': case 'manageConnections': case 'openConnection':
      editingConnection.value = null; showConnectionDialog.value = true; break
    case 'refresh': connectionStore.fetchConnections(); message.success('Refreshed'); break
    case 'documentation': window.open('https://unidb.com/docs', '_blank'); break
    case 'reportBug': window.open('https://github.com/AndrewLiuZhangZong/UniDb/issues', '_blank'); break
    case 'checkUpdates': message.info('Checking for updates...'); break
    case 'about':
      dialog.info({
        title: 'UniDb',
        content: `Version: 0.1.0\nElectron: ${window.electronAPI?.versions?.electron || 'N/A'}\nNode: ${window.electronAPI?.versions?.node || 'N/A'}`,
        positiveText: 'OK'
      }); break
    case 'exit': window.electronAPI?.close?.(); break
  }
}

const handleMenuEvent = (e: Event) => handleMenuAction((e as CustomEvent<string>).detail)
const handleOpenConnectionDialog = () => { editingConnection.value = null; showConnectionDialog.value = true }
const handleEditConnectionEvent = (e: Event) => {
  editingConnection.value = (e as CustomEvent<any>).detail
  showConnectionDialog.value = true
}
const handleGoHome = () => {
  activeConnection.value = null
  isConnected.value = false
  selectedItem.value = null
  selectedItemType.value = ''
}

onMounted(() => {
  window.addEventListener('menu-action', handleMenuEvent)
  window.addEventListener('open-connection-dialog', handleOpenConnectionDialog)
  window.addEventListener('edit-connection', handleEditConnectionEvent)
  window.addEventListener('go-home', handleGoHome)
  // @ts-ignore
  if (window.electronAPI?.onMenuAction) window.electronAPI.onMenuAction(handleMenuAction)
})
onUnmounted(() => {
  window.removeEventListener('menu-action', handleMenuEvent)
  window.removeEventListener('open-connection-dialog', handleOpenConnectionDialog)
  window.removeEventListener('edit-connection', handleEditConnectionEvent)
  window.removeEventListener('go-home', handleGoHome)
})
</script>

<style scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-layout { flex: 1; overflow: hidden; }

.conn-sidebar { background: rgba(28, 28, 32, 0.98) !important; }

.content-layout {
  background: #13131a;
  display: flex;
  flex-direction: column;
}

/* ── Welcome ── */
.welcome-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 48px 32px;
  animation: fadeInUp 0.5s ease;
}
.welcome-hero {
  display: flex; flex-direction: column; align-items: center; gap: 20px;
}
.welcome-icon { position: relative; display: flex; align-items: center; justify-content: center; }
.hero-center-icon { position: absolute; font-size: 44px; color: #18a058; }
.welcome-title {
  font-size: 32px; font-weight: 700; margin: 0;
  color: rgba(255,255,255,0.95); letter-spacing: -0.5px;
}
.welcome-subtitle { font-size: 15px; margin: 0; color: rgba(255,255,255,0.45); }

.supported-databases { text-align: center; }
.supported-title {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;
}
.db-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.db-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px 16px; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
  cursor: pointer; transition: all 0.25s ease;
}
.db-card:hover {
  background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12);
  transform: translateY(-3px);
}
.db-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.75); }

/* ── Workspace shell ── */
.workspace-shell {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  height: 100%;
}

/* Column 2: DB tree panel */
.db-tree-panel {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(22, 22, 28, 0.95);
  border-right: 1px solid rgba(255,255,255,0.06);
}

/* Mini connection header inside DB tree */
.panel-conn-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.panel-conn-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.panel-conn-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.panel-conn-host {
  font-size: 10px;
  color: rgba(255,255,255,0.35);
  font-family: 'SF Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Column 3: Main workspace */
.workspace-main {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
