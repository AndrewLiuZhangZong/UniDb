<template>
  <div class="navigator" :class="{ 'light-mode': !isDarkTheme }">

    <!-- ── Navigator Header ── -->
    <div class="nav-header">
      <div class="nav-title-row">
        <n-icon class="nav-icon"><CubeOutline /></n-icon>
        <span class="nav-title">{{ t('nav.database') }}</span>
      </div>
      <div class="nav-actions">
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button text size="tiny" @click="handleNewConnection">
              <template #icon><n-icon><AddOutline /></n-icon></template>
            </n-button>
          </template>
          {{ t('nav.newConnection') }}
        </n-tooltip>
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-button text size="tiny" @click="handleRefresh">
              <template #icon><n-icon><RefreshOutline /></n-icon></template>
            </n-button>
          </template>
          {{ t('nav.refresh') }}
        </n-tooltip>
      </div>
    </div>

    <!-- ── Navigator Tree ── -->
    <div class="nav-tree" v-if="connectionStore.connections.length">

      <!-- Connection nodes -->
      <div
        v-for="conn in connectionStore.connections"
        :key="conn.id"
        class="conn-node"
      >
        <!-- Connection row -->
        <div
          class="tree-row conn-row"
          :class="{ 'is-active': activeConnId === conn.id }"
          @click="toggleConn(conn)"
        >
          <n-icon class="row-arrow" :class="{ open: expandedConns[conn.id] }">
            <ChevronForwardOutline />
          </n-icon>
          <DbTypeIcon :type="conn.type" :size="14" />
          <span class="row-name" :title="conn.name">{{ conn.name }}</span>
          <n-tooltip trigger="hover" placement="right">
            <template #trigger>
              <n-icon class="row-action-icon" @click.stop="handleConnMenu(conn, $event)">
                <EllipsisHorizontalOutline />
              </n-icon>
            </template>
            {{ t('nav.actions') }}
          </n-tooltip>
        </div>

        <!-- Expanded: Database sub-nodes (per-db Explorer) -->
        <div v-if="expandedConns[conn.id]" class="conn-children">
          <component
            :is="explorerMap[conn.type]"
            :connection="conn"
            :is-selected="activeConnId === conn.id"
            @select-item="(item, type) => emit('select', conn, item, type)"
            @db-change="(db) => emit('db-change', conn, db)"
          />
        </div>
      </div>
    </div>

    <!-- ── Empty State ── -->
    <div v-else class="nav-empty">
      <n-icon class="empty-icon"><ServerOutline /></n-icon>
      <p class="empty-text">{{ t('nav.noConnections') }}</p>
      <n-button size="small" type="primary" @click="handleNewConnection">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        {{ t('nav.newConnection') }}
      </n-button>
    </div>

    <!-- Connection context menu -->
    <n-dropdown
      :show="ctxShow"
      :x="ctxX"
      :y="ctxY"
      :options="ctxOptions"
      @select="handleCtxSelect"
      @clickoutside="ctxShow = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NTooltip, NDropdown } from 'naive-ui'
import {
  CubeOutline, ChevronForwardOutline, AddOutline, RefreshOutline,
  EllipsisHorizontalOutline, ServerOutline, CreateOutline,
  TrashOutline, CloudDoneOutline, CloudOfflineOutline
} from '@vicons/ionicons5'
import { h } from 'vue'
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

const activeConnId = ref<string | null>(null)
const expandedConns = reactive<Record<string, boolean>>({})

// Context menu
const ctxShow = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxConn = ref<any>(null)

const ctxOptions = computed(() => [
  {
    label: t('common.edit'),
    key: 'edit',
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
  },
  {
    label: t('connection.connect'),
    key: 'connect',
    icon: () => h(NIcon, null, { default: () => h(CloudDoneOutline) })
  },
  {
    label: t('connection.disconnect'),
    key: 'disconnect',
    icon: () => h(NIcon, null, { default: () => h(CloudOfflineOutline) })
  },
  { type: 'divider', key: 'd1' },
  {
    label: t('common.delete'),
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
  }
])

const toggleConn = (conn: any) => {
  if (activeConnId.value === conn.id && expandedConns[conn.id]) {
    expandedConns[conn.id] = false
    activeConnId.value = null
  } else if (activeConnId.value === conn.id) {
    expandedConns[conn.id] = true
  } else {
    activeConnId.value = conn.id
    expandedConns[conn.id] = true
  }
  emit('connection-select', conn)
}

const handleConnMenu = (conn: any, e: MouseEvent) => {
  ctxConn.value = conn
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxShow.value = true
}

const handleCtxSelect = async (key: string) => {
  ctxShow.value = false
  if (key === 'edit') {
    window.dispatchEvent(new CustomEvent('edit-connection', { detail: ctxConn.value }))
  } else if (key === 'delete') {
    try {
      await connectionStore.deleteConnection(ctxConn.value.id)
      delete expandedConns[ctxConn.value.id]
      if (activeConnId.value === ctxConn.value.id) activeConnId.value = null
    } catch { /* handled by store */ }
  }
}

const handleNewConnection = () => {
  window.dispatchEvent(new CustomEvent('open-connection-dialog'))
}

const handleRefresh = () => {
  connectionStore.fetchConnections()
}

onMounted(() => {
  connectionStore.fetchConnections()
})
</script>

<style scoped>
.navigator {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-sidebar);
  overflow: hidden;
}

/* ── Header ── */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 8px;
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
}

.nav-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.nav-icon {
  font-size: 14px;
  color: var(--accent-primary);
}

.nav-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

:deep(.nav-actions .n-button) {
  color: var(--text-disabled);
}
:deep(.nav-actions .n-button:hover) {
  color: var(--text-primary);
}

/* ── Tree ── */
.nav-tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.nav-tree::-webkit-scrollbar { width: 5px; }
.nav-tree::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 3px; }

/* Connection node */
.conn-node {
  margin-bottom: 1px;
}

.conn-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 5px;
  margin: 1px 4px;
  transition: background 0.12s;
  position: relative;
}

.conn-row:hover {
  background: var(--bg-hover);
}

.conn-row.is-active {
  background: var(--accent-primary-subtle);
}

.conn-row.is-active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 2px; height: 18px;
  background: var(--accent-primary);
  border-radius: 0 2px 2px 0;
}

.row-arrow {
  font-size: 11px;
  color: var(--text-hint);
  transition: transform 0.18s;
  flex-shrink: 0;
}
.row-arrow.open { transform: rotate(90deg); }

.row-name {
  flex: 1;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-action-icon {
  font-size: 14px;
  color: var(--text-hint);
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.12s;
  flex-shrink: 0;
  opacity: 0;
}
.conn-row:hover .row-action-icon { opacity: 1; }
.row-action-icon:hover {
  color: var(--text-primary);
  background: var(--border-primary);
}

/* Expanded children */
.conn-children {
  padding-left: 8px;
  margin-bottom: 4px;
}

/* ── Empty ── */
.nav-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
}

.empty-icon {
  font-size: 40px;
  color: var(--text-disabled);
}

.empty-text {
  font-size: 12px;
  color: var(--text-hint);
  margin: 0;
  text-align: center;
}
</style>
