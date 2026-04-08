<template>
  <div class="breadcrumb-bar" :class="{ 'light-mode': !isDarkTheme }">
    <nav class="breadcrumb" aria-label="Navigation">
      <!-- Home -->
      <span class="crumb crumb-root" @click="handleRootClick">
        <n-icon :size="13"><HomeOutline /></n-icon>
        <span>{{ t('nav.home') }}</span>
      </span>

      <template v-if="activeConnection">
        <!-- Separator -->
        <span class="crumb-sep"><ChevronForwardOutline :size="13" /></span>

        <!-- Connection -->
        <span class="crumb crumb-conn">
          <DbTypeIcon :type="activeConnection.type" :size="13" />
          <span>{{ activeConnection.name }}</span>
        </span>

        <template v-if="activeDb">
          <!-- Separator -->
          <span class="crumb-sep"><ChevronForwardOutline :size="13" /></span>

          <!-- Database -->
          <span class="crumb crumb-db" @click="handleDbClick">
            <n-icon :size="13"><CubeOutline /></n-icon>
            <span>{{ activeDb }}</span>
          </span>

          <template v-if="selectedItemName">
            <!-- Separator -->
            <span class="crumb-sep"><ChevronForwardOutline :size="13" /></span>

            <!-- Selected item (table/collection/key) -->
            <span class="crumb crumb-item" :class="{ 'has-type': selectedItemType }">
              <n-icon :size="13"><GridOutline v-if="selectedItemType === 'table'" /><DocumentTextOutline v-else-if="selectedItemType === 'view'" /><LayersOutline v-else-if="selectedItemType === 'collection'" /><KeyOutline v-else-if="selectedItemType === 'key'" /><EllipseOutline v-else /></n-icon>
              <span class="crumb-item-name">{{ selectedItemName }}</span>
              <n-tag v-if="selectedItemType" size="small" :bordered="false" type="default" class="crumb-type-tag">
                {{ t(`nav.type.${selectedItemType}`) }}
              </n-tag>
            </span>
          </template>
        </template>
      </template>
    </nav>

    <!-- Right actions: refresh + new connection -->
    <div class="crumb-actions">
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <button class="crumb-action-btn" @click="handleRefresh" :title="t('nav.refresh')">
            <n-icon :size="15"><RefreshOutline /></n-icon>
          </button>
        </template>
        {{ t('nav.refresh') }}
      </n-tooltip>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <button class="crumb-action-btn" @click="handleNewConnection" :title="t('nav.newConnection')">
            <n-icon :size="15"><AddOutline /></n-icon>
          </button>
        </template>
        {{ t('nav.newConnection') }}
      </n-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NTag, NTooltip } from 'naive-ui'
import {
  HomeOutline, ChevronForwardOutline, CubeOutline,
  GridOutline, DocumentTextOutline, LayersOutline,
  KeyOutline, EllipseOutline, RefreshOutline, AddOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'
import DbTypeIcon from './DbTypeIcon.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  activeConnection: any
  activeDb: string
  selectedItem: any
  selectedItemType: string
}>()

const emit = defineEmits<{
  (e: 'root-click'): void
  (e: 'db-click'): void
  (e: 'refresh'): void
  (e: 'new-connection'): void
}>()

const selectedItemName = computed(() => {
  if (!props.selectedItem) return ''
  return props.selectedItem.name || props.selectedItem.table_name || props.selectedItem.key || String(props.selectedItem)
})

const handleRootClick = () => emit('root-click')
const handleDbClick = () => emit('db-click')
const handleRefresh = () => emit('refresh')
const handleNewConnection = () => emit('new-connection')
</script>

<style scoped>
.breadcrumb-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 14px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
  user-select: none;
}

.breadcrumb-bar.light-mode {
  background: var(--bg-primary);
  border-bottom-color: rgba(0,0,0,0.07);
}

/* ── Breadcrumb nav ── */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
}

.crumb {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12.5px;
  color: var(--text-tertiary);
  transition: all 0.12s;
  white-space: nowrap;
  cursor: default;
}

.crumb-root {
  cursor: pointer;
  color: var(--text-disabled);
}
.crumb-root:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.crumb-conn {
  color: var(--text-secondary);
}

.crumb-db {
  cursor: pointer;
  color: var(--text-secondary);
}
.crumb-db:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.crumb-item {
  color: var(--text-primary);
  background: var(--accent-primary-subtle);
}

.crumb-item-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.crumb-type-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
  border-radius: 3px;
  background: var(--bg-active);
  color: var(--text-disabled);
}

.crumb-sep {
  display: flex;
  align-items: center;
  color: var(--text-disabled);
  flex-shrink: 0;
}

/* ── Right actions ── */
.crumb-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.crumb-action-btn {
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
.crumb-action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
