<template>
  <div class="home-container" :class="{ 'light-theme': !isDarkTheme }">

    <!-- ── Main layout: Navigator + Content ── -->
    <n-layout has-sider class="main-layout">

      <!-- Left: Database Navigator sidebar (collapsible) -->
      <n-layout-sider
        bordered
        :width="220"
        :collapsed-width="0"
        show-trigger="bar"
        collapse-mode="width"
        :native-scrollbar="false"
        class="navigator-sider"
        :class="{ 'light-mode': !isDarkTheme }"
      >
        <ConnectionTree
          @select="handleNavSelect"
          @connection-select="handleConnSelect"
          @db-change="handleNavDbChange"
        />
      </n-layout-sider>

      <!-- Right: Main workspace content -->
      <n-layout class="content-layout">

        <!-- Top: Breadcrumb navigation -->
        <ContentTopNav
          :active-connection="activeConnection"
          :active-db="activeDb"
          :selected-item="selectedItem"
          :selected-item-type="selectedItemType"
          @root-click="activeConnection = null"
          @refresh="handleAction('refresh')"
          @new-connection="showConnectionDialog = true"
        />

        <!-- Welcome page: no connection selected -->
        <div v-if="!activeConnection" class="welcome-page">
          <div class="welcome-hero">
            <div class="welcome-icon">
              <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="55" fill="url(#heroGrad)" opacity="0.08"/>
                <circle cx="60" cy="60" r="38" fill="url(#heroGrad)" opacity="0.15"/>
                <circle cx="60" cy="60" r="22" fill="url(#heroGrad)"/>
                <defs>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FF6B00"/><stop offset="100%" stop-color="#FF8C42"/>
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

        <!-- Active workspace -->
        <div v-else class="workspace-shell">

          <!-- Status bar: active connection info + db actions -->
          <div class="workspace-statusbar" :class="{ 'light-mode': !isDarkTheme }">
            <div class="statusbar-left">
              <DbTypeIcon :type="activeConnection.type" :size="14" />
              <span class="statusbar-conn-name">{{ activeConnection.name }}</span>
              <span class="statusbar-host">{{ activeConnection.config?.host }}:{{ activeConnection.config?.port }}</span>
            </div>
            <div class="statusbar-right">
              <template v-if="activeConnection.type === 'mysql' || activeConnection.type === 'clickhouse'">
                <n-button text size="tiny" @click="handleAction('createTable')" :title="t('toolbar.createTable')">
                  <template #icon><n-icon><CreateOutline /></n-icon></template>
                  <span>{{ t('toolbar.createTable') }}</span>
                </n-button>
                <n-button text size="tiny" @click="handleAction('createDatabase')" :title="t('toolbar.createDatabase')">
                  <template #icon><n-icon><ServerOutline /></n-icon></template>
                  <span>{{ t('toolbar.createDatabase') }}</span>
                </n-button>
              </template>
              <template v-else-if="activeConnection.type === 'mongodb'">
                <n-button text size="tiny" @click="handleAction('createCollection')" :title="t('toolbar.createCollection')">
                  <template #icon><n-icon><LayersOutline /></n-icon></template>
                  <span>{{ t('toolbar.createCollection') }}</span>
                </n-button>
              </template>
              <template v-else-if="activeConnection.type === 'redis'">
                <n-button text size="tiny" @click="handleAction('newKey')" :title="t('toolbar.newKey')">
                  <template #icon><n-icon><KeyOutline /></n-icon></template>
                  <span>{{ t('toolbar.newKey') }}</span>
                </n-button>
              </template>
              <div class="statusbar-sep"></div>
              <n-button text size="tiny" @click="handleAction('refresh')" :title="t('toolbar.refresh')">
                <template #icon><n-icon><RefreshOutline /></n-icon></template>
              </n-button>
            </div>
          </div>

          <!-- Main workspace content -->
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
  NLayout, NLayoutSider, NButton, NIcon,
  useMessage, useDialog
} from 'naive-ui'
import {
  AddOutline, CubeOutline, CreateOutline, ServerOutline,
  LayersOutline, KeyOutline, RefreshOutline
} from '@vicons/ionicons5'
import ConnectionTree from '../components/ConnectionTree.vue'
import ConnectionDialog from '../components/ConnectionDialog.vue'
import ContentTopNav from '../components/ContentTopNav.vue'
import DbTypeIcon from '../components/DbTypeIcon.vue'

// Lazy-load DB-specific components
import MySQLWorkspace from '../components/database/MySQL/MySQLWorkspace.vue'
import ClickHouseWorkspace from '../components/database/ClickHouse/ClickHouseWorkspace.vue'
import MongoDBWorkspace from '../components/database/MongoDB/MongoDBWorkspace.vue'
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
const selectedItem = ref<any>(null)
const selectedItemType = ref<string>('')
const activeDb = ref<string>('')

const supportedDatabases = [
  { type: 'mysql', label: 'MySQL' },
  { type: 'clickhouse', label: 'ClickHouse' },
  { type: 'mongodb', label: 'MongoDB' },
  { type: 'redis', label: 'Redis' }
]

const workspaceMap: Record<string, any> = {
  mysql: MySQLWorkspace,
  clickhouse: ClickHouseWorkspace,
  mongodb: MongoDBWorkspace,
  redis: RedisWorkspace
}

const workspaceComponent = computed(() =>
  workspaceMap[activeConnection.value?.type] ?? null
)

// Navigator emits: (conn, item, type)
const handleNavSelect = (conn: any, item: any, type: string) => {
  activeConnection.value = conn
  selectedItem.value = item
  selectedItemType.value = type
}

// When clicking on a connection row in the navigator
const handleConnSelect = (conn: any) => {
  activeConnection.value = conn
  selectedItem.value = null
  selectedItemType.value = ''
}

const handleNavDbChange = (conn: any, db: string) => {
  activeDb.value = db
}

const handleAction = (action: string) => {
  switch (action) {
    case 'refresh':
      connectionStore.fetchConnections()
      message.success('Refreshed')
      break
    case 'createTable':
      window.dispatchEvent(new CustomEvent('db-create-table', { detail: { connection: activeConnection.value } }))
      break
    case 'createDatabase':
      window.dispatchEvent(new CustomEvent('db-create-database', { detail: { connection: activeConnection.value } }))
      break
    case 'createCollection':
      window.dispatchEvent(new CustomEvent('db-create-collection', { detail: { connection: activeConnection.value } }))
      break
    case 'newKey':
      window.dispatchEvent(new CustomEvent('db-new-key', { detail: { connection: activeConnection.value } }))
      break
  }
}

const handleDialogSaved = () => { editingConnection.value = null }

// Menu action handler (from AppLayout)
const handleMenuAction = (action: string) => {
  switch (action) {
    case 'newConnection': case 'manageConnections': case 'openConnection':
      editingConnection.value = null; showConnectionDialog.value = true; break
    case 'settings': window.location.hash = '#/settings'; break
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

onMounted(() => {
  window.addEventListener('menu-action', handleMenuEvent)
  window.addEventListener('open-connection-dialog', handleOpenConnectionDialog)
  window.addEventListener('edit-connection', handleEditConnectionEvent)
  if (window.electronAPI?.onMenuAction) window.electronAPI.onMenuAction(handleMenuAction)
})
onUnmounted(() => {
  window.removeEventListener('menu-action', handleMenuEvent)
  window.removeEventListener('open-connection-dialog', handleOpenConnectionDialog)
  window.removeEventListener('edit-connection', handleEditConnectionEvent)
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

.navigator-sider {
  background: var(--bg-sidebar) !important;
  height: 100%;
  position: relative !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Content layout ── */
.content-layout {
  background: var(--bg-primary) !important;
  display: flex;
  flex-direction: column;
}
.content-layout :deep(.n-layout-scroll-container),
.content-layout :deep(.n-layout),
.content-layout :deep(.n-layout-content) {
  background: var(--bg-primary) !important;
}

/* ── Workspace area ── */
.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ── Welcome page ── */
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

.welcome-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-center-icon { position: absolute; font-size: 44px; color: var(--accent-primary); }

.welcome-title {
  font-size: 32px; font-weight: 700; margin: 0;
  color: var(--text-primary); letter-spacing: -0.5px;
}

.welcome-subtitle { font-size: 15px; margin: 0; color: var(--text-disabled); }

.supported-databases { text-align: center; }

.supported-title {
  font-size: 11px; font-weight: 600; color: var(--text-disabled);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;
}

.db-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

.db-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 20px 16px; background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary); border-radius: 18px;
  cursor: pointer; transition: all 0.25s ease;
  box-shadow: var(--shadow-soft-sm, none);
}

.db-card:hover {
  background: var(--bg-hover); border-color: var(--border-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-soft, 0 8px 28px rgba(15, 23, 42, 0.08));
}

.db-label { font-size: 13px; font-weight: 500; color: var(--text-tertiary); }

/* ── Workspace shell ── */
.workspace-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

/* ── Status bar (DBeaver-style info bar) ── */
.workspace-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 12px;
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-secondary);
  gap: 12px;
}

.statusbar-left {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow: hidden;
}

.statusbar-conn-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.statusbar-host {
  font-size: 10px;
  color: var(--text-disabled);
  font-family: 'SF Mono', monospace;
  white-space: nowrap;
}

.statusbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.statusbar-sep {
  width: 1px;
  height: 12px;
  background: var(--border-strong);
  margin: 0 6px;
  flex-shrink: 0;
}

:deep(.workspace-statusbar .n-button__content) {
  gap: 4px;
  font-size: 11px;
  color: var(--text-quaternary);
}
:deep(.workspace-statusbar .n-button:hover .n-button__content) {
  color: var(--text-primary);
}

/* ── Main workspace ── */
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
