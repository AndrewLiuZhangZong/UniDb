<template>
  <div class="connection-tree" :class="{ 'light-mode': !isDarkTheme }">
    <div class="tree-header">
      <n-space justify="space-between" align="center">
        <span class="tree-title">{{ t('sidebar.connections') }}</span>
      </n-space>
    </div>

    <div class="tree-content">
      <!-- Empty State -->
      <div v-if="connectionStore.connections.length === 0" class="empty-state">
        <div class="empty-icon">
          <n-icon :size="48"><ServerOutline /></n-icon>
        </div>
        <p class="empty-text">{{ t('sidebar.noConnections') }}</p>
        <p class="empty-hint">{{ t('sidebar.useMenuToCreate') }}</p>
      </div>

      <!-- Connection List -->
      <div v-else class="connection-list">
        <div
          v-for="conn in connectionStore.connections"
          :key="conn.id"
          class="connection-item"
          :class="{ 'is-selected': activeConnectionId === conn.id }"
          @click="handleSelectConnection(conn)"
        >
          <DbTypeIcon :type="conn.type" :size="22" />
          <div class="connection-info">
            <span class="connection-name">{{ conn.name }}</span>
            <span class="connection-type">{{ getDbTypeName(conn.type) }}</span>
          </div>
          <div class="connection-actions">
            <n-tooltip trigger="hover" placement="right">
              <template #trigger>
                <n-icon class="action-icon" @click.stop="handleConnectionMenu(conn)">
                  <EllipsisHorizontalOutline />
                </n-icon>
              </template>
              Actions
            </n-tooltip>
          </div>
        </div>
      </div>
    </div>

    <div class="tree-footer">
      <div class="footer-item" @click="handleRefresh">
        <n-icon><RefreshOutline /></n-icon>
        <span>{{ t('sidebar.refresh') }}</span>
      </div>
    </div>

    <!-- Context Menu -->
    <n-dropdown
      :show="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      :options="contextMenuOptions"
      @select="handleContextMenuSelect"
      @clickoutside="closeContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NSpace, NTooltip, NDropdown, useMessage, useDialog } from 'naive-ui'
import {
  EllipsisHorizontalOutline,
  RefreshOutline,
  ServerOutline,
  CreateOutline,
  TrashOutline,
  CloudDoneOutline
} from '@vicons/ionicons5'
import { h } from 'vue'
import { useConnectionStore } from '../stores/connection'
import { useSettingsStore } from '../stores/settings'
import DbTypeIcon from './DbTypeIcon.vue'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const connectionStore = useConnectionStore()
const settingsStore = useSettingsStore()

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const emit = defineEmits<{
  (e: 'select', connection: any): void
}>()

const activeConnectionId = ref<string | null>(null)
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const selectedConnection = ref<any>(null)

const contextMenuOptions = [
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
    type: 'divider',
    key: 'd1'
  },
  {
    label: t('common.delete'),
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
  }
]

// Get database type name
const getDbTypeName = (type: string) => {
  const names: Record<string, string> = {
    mysql: 'MySQL',
    clickhouse: 'ClickHouse',
    mongodb: 'MongoDB',
    redis: 'Redis'
  }
  return names[type] || type
}

// Select connection
const handleSelectConnection = (conn: any) => {
  activeConnectionId.value = conn.id
  emit('select', conn)
}

// Connection menu (right-click context)
const handleConnectionMenu = (conn: any, event?: MouseEvent) => {
  selectedConnection.value = conn
  if (event) {
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
  } else {
    contextMenuX.value = 200
    contextMenuY.value = 200
  }
  showContextMenu.value = true
}

// Close context menu
const closeContextMenu = () => {
  showContextMenu.value = false
}

// Handle context menu selection
const handleContextMenuSelect = async (key: string) => {
  closeContextMenu()

  switch (key) {
    case 'edit':
      window.dispatchEvent(new CustomEvent('edit-connection', { detail: selectedConnection.value }))
      break
    case 'connect':
      message.info(`Connecting to ${selectedConnection.value?.name}...`)
      break
    case 'delete':
      await handleDelete(selectedConnection.value.id)
      break
  }
}

// Delete connection
const handleDelete = async (id: string) => {
  try {
    await connectionStore.deleteConnection(id)
    if (activeConnectionId.value === id) {
      activeConnectionId.value = null
    }
    message.success('Connection deleted')
  } catch {
    message.error('Delete failed')
  }
}

// Refresh
const handleRefresh = async () => {
  await connectionStore.fetchConnections()
  message.success('Refreshed')
}

onMounted(() => {
  connectionStore.fetchConnections()
})
</script>

<style scoped>
.connection-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(30, 30, 35, 1) 0%, rgba(25, 25, 30, 1) 100%);
  transition: background 0.3s ease;
}

/* Light theme styles */
:global(.light-theme) .connection-tree,
.connection-tree.light-mode {
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%);
}

.tree-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.light-mode .tree-header {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.tree-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.light-mode .tree-title {
  color: rgba(0, 0, 0, 0.45);
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* Custom scrollbar */
.tree-content::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-track {
  background: transparent;
}

.tree-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.15);
}

.light-mode .empty-icon {
  color: rgba(0, 0, 0, 0.15);
}

.empty-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

.light-mode .empty-text {
  color: rgba(0, 0, 0, 0.45);
}

.empty-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
  text-align: center;
}

.light-mode .empty-hint {
  color: rgba(0, 0, 0, 0.35);
}

/* Connection List */
.connection-list {
  padding: 0 8px;
}

.connection-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border: 1px solid transparent;
}

.connection-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.06);
}

.light-mode .connection-item:hover {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.06);
}

.connection-item:hover .connection-actions {
  opacity: 1;
}

.connection-item.is-selected {
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.15) 0%, rgba(24, 160, 88, 0.08) 100%);
  border-color: rgba(24, 160, 88, 0.3);
}

.light-mode .connection-item.is-selected {
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.12) 0%, rgba(24, 160, 88, 0.05) 100%);
  border-color: rgba(24, 160, 88, 0.25);
}

.connection-item.is-selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(180deg, #18a058, #36b374);
  border-radius: 0 2px 2px 0;
}

.connection-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.connection-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.light-mode .connection-name {
  color: rgba(0, 0, 0, 0.9);
}

.connection-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.light-mode .connection-type {
  color: rgba(0, 0, 0, 0.4);
}

.connection-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.light-mode .action-icon {
  color: rgba(0, 0, 0, 0.4);
}

.action-icon:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.light-mode .action-icon:hover {
  color: rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.06);
}

/* Footer */
.tree-footer {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.light-mode .tree-footer {
  border-top-color: rgba(0, 0, 0, 0.08);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.light-mode .footer-item {
  color: rgba(0, 0, 0, 0.5);
}

.footer-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.light-mode .footer-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.9);
}
</style>
