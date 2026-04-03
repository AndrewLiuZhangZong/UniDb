<template>
  <div class="db-toolbar" :class="{ 'light-mode': !isDarkTheme }">
    <!-- Left: DB type badge + name -->
    <div class="toolbar-left">
      <DbTypeIcon :type="connection.type" :size="16" />
      <span class="db-name">{{ connection.name }}</span>
      <n-tag :type="isConnected ? 'success' : 'default'" size="tiny" round>
        {{ isConnected ? t('status.connected') : t('status.disconnected') }}
      </n-tag>
    </div>

    <!-- Right: type-specific actions -->
    <div class="toolbar-right">
      <!-- MySQL / ClickHouse actions -->
      <template v-if="connection.type === 'mysql' || connection.type === 'clickhouse'">
        <n-button text size="tiny" @click="emit('action', 'refresh')" :title="t('toolbar.refresh')">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          {{ t('toolbar.refresh') }}
        </n-button>
        <n-button text size="tiny" @click="emit('action', 'refreshMetadata')" :title="t('toolbar.refreshMetadata')">
          <template #icon><n-icon><SyncOutline /></n-icon></template>
          {{ t('toolbar.refreshMetadata') }}
        </n-button>
        <div class="toolbar-sep"></div>
        <n-button text size="tiny" @click="emit('action', 'createTable')" :title="t('toolbar.createTable')">
          <template #icon><n-icon><CreateOutline /></n-icon></template>
          {{ t('toolbar.createTable') }}
        </n-button>
        <n-button text size="tiny" @click="emit('action', 'createDatabase')" :title="t('toolbar.createDatabase')">
          <template #icon><n-icon><ServerOutline /></n-icon></template>
          {{ t('toolbar.createDatabase') }}
        </n-button>
        <n-button text size="tiny" @click="emit('action', 'createIndex')" :title="t('toolbar.createIndex')">
          <template #icon><n-icon><BuildOutline /></n-icon></template>
          {{ t('toolbar.createIndex') }}
        </n-button>
      </template>

      <!-- MongoDB actions -->
      <template v-else-if="connection.type === 'mongodb'">
        <n-button text size="tiny" @click="emit('action', 'refresh')" :title="t('toolbar.refresh')">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          {{ t('toolbar.refresh') }}
        </n-button>
        <div class="toolbar-sep"></div>
        <n-button text size="tiny" @click="emit('action', 'createCollection')" :title="t('toolbar.createCollection')">
          <template #icon><n-icon><LayersOutline /></n-icon></template>
          {{ t('toolbar.createCollection') }}
        </n-button>
        <n-button text size="tiny" @click="emit('action', 'createDatabase')" :title="t('toolbar.createDatabase')">
          <template #icon><n-icon><ServerOutline /></n-icon></template>
          {{ t('toolbar.createDatabase') }}
        </n-button>
      </template>

      <!-- Redis actions -->
      <template v-else-if="connection.type === 'redis'">
        <n-button text size="tiny" @click="emit('action', 'refresh')" :title="t('toolbar.refresh')">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          {{ t('toolbar.refresh') }}
        </n-button>
        <div class="toolbar-sep"></div>
        <n-button text size="tiny" @click="emit('action', 'newKey')" :title="t('toolbar.newKey')">
          <template #icon><n-icon><KeyOutline /></n-icon></template>
          {{ t('toolbar.newKey') }}
        </n-button>
        <n-button text size="tiny" @click="emit('action', 'flushDb')" :title="t('toolbar.flushDb')">
          <template #icon><n-icon><TrashOutline /></n-icon></template>
          {{ t('toolbar.flushDb') }}
        </n-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NTag } from 'naive-ui'
import {
  RefreshOutline, SyncOutline, CreateOutline, ServerOutline,
  BuildOutline, LayersOutline, KeyOutline, TrashOutline
} from '@vicons/ionicons5'
import DbTypeIcon from './DbTypeIcon.vue'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  connection: any
  isConnected: boolean
}>()

const emit = defineEmits<{
  (e: 'action', action: string): void
}>()
</script>

<style scoped>
.db-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  flex-shrink: 0;
  background: rgba(22, 22, 28, 0.8);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  gap: 12px;
}

.light-mode.db-toolbar {
  background: rgba(246, 246, 250, 0.8);
  border-bottom-color: rgba(0,0,0,0.08);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.db-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
}

.light-mode .db-name {
  color: rgba(0,0,0,0.75);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-sep {
  width: 1px;
  height: 14px;
  background: rgba(255,255,255,0.12);
  margin: 0 6px;
  flex-shrink: 0;
}

.light-mode .toolbar-sep {
  background: rgba(0,0,0,0.1);
}

:deep(.n-button__content) {
  gap: 5px;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

:deep(.n-button:hover .n-button__content) {
  color: rgba(255,255,255,0.9);
}

.light-mode :deep(.n-button__content) {
  color: rgba(0,0,0,0.55);
}

.light-mode :deep(.n-button:hover .n-button__content) {
  color: rgba(0,0,0,0.85);
}
</style>
