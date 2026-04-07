<template>
  <!-- Top bar: collapsible database navigator panel -->
  <div class="content-top-nav" :class="{ 'light-mode': !isDarkTheme, collapsed: isCollapsed }">

    <!-- Header row: toggle + label + connection pills -->
    <div class="nav-panel-header">
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="t('nav.togglePanel')">
        <n-icon :size="14">
          <ChevronUpOutline v-if="!isCollapsed" />
          <ChevronDownOutline v-else />
        </n-icon>
      </button>
      <div class="nav-panel-label">
        <n-icon class="label-icon"><CubeOutline /></n-icon>
        <span class="label-text">{{ t('nav.database') }}</span>
      </div>

      <div class="conn-pills" v-if="!isCollapsed">
        <div
          v-for="conn in connectionStore.connections"
          :key="conn.id"
          class="conn-pill"
          :class="{ active: activeConnId === conn.id }"
          @click="handlePillClick(conn)"
        >
          <DbTypeIcon :type="conn.type" :size="12" />
          <span class="pill-name">{{ conn.name }}</span>
          <n-icon
            class="pill-close"
            :size="11"
            @click.stop="handleRemoveConn(conn.id)"
          >
            <CloseOutline />
          </n-icon>
        </div>

        <button class="add-conn-btn" @click="handleNewConnection" :title="t('nav.newConnection')">
          <n-icon :size="14"><AddOutline /></n-icon>
        </button>
      </div>

      <div class="header-actions" v-if="!isCollapsed">
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <button class="action-btn" @click="handleRefresh">
              <n-icon :size="15"><RefreshOutline /></n-icon>
            </button>
          </template>
          {{ t('nav.refresh') }}
        </n-tooltip>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <button class="action-btn" @click="handleNewConnection">
              <n-icon :size="15"><AddOutline /></n-icon>
            </button>
          </template>
          {{ t('nav.newConnection') }}
        </n-tooltip>
      </div>
    </div>

    <!-- Expanded: Database Explorer for active connection -->
    <div v-if="!isCollapsed && activeConnId" class="nav-panel-body">
      <component
        :is="explorerMap[activeConnType]"
        :connection="activeConn"
        :is-selected="true"
        @select-item="(item, type) => emit('select', activeConn, item, type)"
        @db-change="(db) => emit('db-change', activeConn, db)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="!isCollapsed && !activeConnId" class="nav-panel-empty">
      <n-icon class="empty-icon"><ServerOutline /></n-icon>
      <span class="empty-text">{{ t('nav.noConnections') }}</span>
      <n-button size="small" type="primary" @click="handleNewConnection">
        <template #icon><n-icon :size="14"><AddOutline /></n-icon></template>
        {{ t('nav.newConnection') }}
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NTooltip } from 'naive-ui'
import {
  CubeOutline, ChevronUpOutline, ChevronDownOutline,
  AddOutline, RefreshOutline, ServerOutline, CloseOutline
} from '@vicons/ionicons5'
import { useConnectionStore } from '../stores/connection'
import { useSettingsStore } from '../stores/settings'
import DbTypeIcon from './DbTypeIcon.vue'

import MySQLExplorer from './database/MySQL/MySQLExplorer.vue'
import ClickHouseExplorer from './database/ClickHouse/ClickHouseExplorer.vue'
import MongoDBExplorer from './database/MongoDB/MongoDBExplorer.vue'
import RedisExplorer from './database/Redis/RedisExplorer.vue'

const { t } = useI18n()
const connectionStore = useConnectionStore()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const emit = defineEmits<{
  (e: 'select', connection: any, item: any, type: string): void
  (e: 'db-change', connection: any, db: string): void
  (e: 'connection-select', connection: any): void
}>()

const explorerMap: Record<string, any> = {
  mysql: MySQLExplorer,
  clickhouse: ClickHouseExplorer,
  mongodb: MongoDBExplorer,
  redis: RedisExplorer
}

const isCollapsed = ref(false)
const activeConnId = ref<string | null>(null)

const activeConn = computed(() =>
  connectionStore.connections.find(c => c.id === activeConnId.value) ?? null
)
const activeConnType = computed(() => activeConn.value?.type ?? '')

const handlePillClick = (conn: any) => {
  activeConnId.value = conn.id
  emit('connection-select', conn)
}

const handleRemoveConn = async (connId: string) => {
  try {
    await connectionStore.deleteConnection(connId)
    if (activeConnId.value === connId) activeConnId.value = null
  } catch { /* handled by store */ }
}

const handleNewConnection = () => {
  window.dispatchEvent(new CustomEvent('open-connection-dialog'))
}

const handleRefresh = () => {
  connectionStore.fetchConnections()
}

onMounted(() => {
  connectionStore.fetchConnections()
  // Auto-select first connection if any
  if (connectionStore.connections.length > 0) {
    activeConnId.value = connectionStore.connections[0].id
  }
})
</script>

<style scoped>
.content-top-nav {
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  transition: background 0.2s;
}

.content-top-nav.light-mode {
  background: var(--bg-sidebar);
  border-bottom-color: rgba(0, 0, 0, 0.07);
}

/* ── Panel header row ── */
.nav-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 40px;
  flex-shrink: 0;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--text-disabled);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
}
.collapse-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.nav-panel-label {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.label-icon { font-size: 13px; color: var(--accent-primary); }

.label-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ── Connection pills ── */
.conn-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 4px;
  min-height: 0;
}
.conn-pills::-webkit-scrollbar { height: 2px; }
.conn-pills::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 2px; }

.conn-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  border-radius: 6px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-row-hover);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.conn-pill:hover { background: var(--bg-hover); border-color: var(--border-hover); }
.conn-pill.active {
  background: var(--accent-primary-subtle);
  border-color: var(--accent-primary);
}
.conn-pill.active .pill-name { color: var(--accent-primary); }

.pill-name {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pill-close {
  color: var(--text-disabled);
  cursor: pointer;
  padding: 1px;
  border-radius: 3px;
  transition: all 0.1s;
  opacity: 0;
}
.conn-pill:hover .pill-close { opacity: 1; }
.pill-close:hover { color: var(--status-error); background: rgba(208, 48, 80, 0.1); }

.add-conn-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px dashed var(--border-secondary);
  border-radius: 6px;
  background: transparent;
  color: var(--text-disabled);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.add-conn-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-primary-subtle);
}

/* ── Header actions ── */
.header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  margin-left: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-disabled);
  cursor: pointer;
  transition: all 0.12s;
}
.action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

/* ── Panel body (explorer) ── */
.nav-panel-body {
  border-top: 1px solid var(--border-secondary);
  overflow: hidden;
  min-height: 0;
}

/* ── Empty state ── */
.nav-panel-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-top: 1px solid var(--border-secondary);
}

.empty-icon { font-size: 18px; color: var(--text-disabled); }
.empty-text { font-size: 12px; color: var(--text-hint); flex: 1; }
</style>
