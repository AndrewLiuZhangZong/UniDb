<template>
  <div class="topnav-bar" :class="{ 'light-mode': !isDarkTheme }">
    <!-- Secondary nav tabs (left-aligned) -->
    <div class="topnav-tabs" v-if="secondaryTabs.length > 0">
      <button
        v-for="tab in secondaryTabs"
        :key="tab.path"
        class="topnav-tab"
        :class="{ active: currentPath === tab.path || currentPath.startsWith(tab.path + '/') }"
        @click="router.push(tab.path)"
      >
        <n-icon :size="13" v-if="tab.icon"><component :is="tab.icon" /></n-icon>
        {{ tab.label }}
      </button>
    </div>

    <!-- Spacer (push right items to edge) -->
    <div class="topnav-spacer"></div>

    <!-- Right: refresh + new connection -->
    <div class="topnav-right">
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <button class="topnav-action-btn" @click="handleRefresh" :title="t('nav.refresh')">
            <n-icon :size="15"><RefreshOutline /></n-icon>
          </button>
        </template>
        {{ t('nav.refresh') }}
      </n-tooltip>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <button class="topnav-action-btn" @click="showConnDialog" :title="t('nav.newConnection')">
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
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NIcon, NTooltip } from 'naive-ui'
import {
  RefreshOutline, AddOutline,
  SettingsOutline, HardwareChipOutline, ListOutline,
  DocumentTextOutline, BugOutline, InformationCircleOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'
import { useConnectionStore } from '../stores/connection'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const connectionStore = useConnectionStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const currentPath = computed(() => route.path)

// Secondary nav tabs based on current route group
const secondaryTabs = computed(() => {
  const path = currentPath.value

  // Settings group
  if (path.startsWith('/settings')) {
    return [
      { path: '/settings?tab=general', label: t('nav.general'), icon: SettingsOutline },
      { path: '/settings?tab=drivers', label: t('nav.drivers'), icon: HardwareChipOutline },
      { path: '/settings?tab=logs', label: t('nav.logs'), icon: ListOutline }
    ]
  }

  // Help group
  if (path.startsWith('/docs') || path.startsWith('/report') || path.startsWith('/about') || path.startsWith('/logs')) {
    return [
      { path: '/docs', label: t('nav.docs'), icon: DocumentTextOutline },
      { path: '/report', label: t('nav.report'), icon: BugOutline },
      { path: '/logs', label: t('nav.logs'), icon: ListOutline },
      { path: '/about', label: t('nav.about'), icon: InformationCircleOutline }
    ]
  }

  return []
})

const handleRefresh = () => {
  connectionStore.fetchConnections()
}

const showConnDialog = () => {
  window.dispatchEvent(new CustomEvent('open-connection-dialog'))
}
</script>

<style scoped>
.topnav-bar {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
  gap: 6px;
  overflow: hidden;
  user-select: none;
}

.topnav-bar.light-mode {
  background: var(--bg-primary);
  border-bottom-color: rgba(0, 0, 0, 0.07);
}

/* ── Tabs: left-aligned ── */
.topnav-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
}

.topnav-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}
.topnav-tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
.topnav-tab.active {
  color: var(--accent-primary);
  background: var(--accent-primary-subtle);
}

/* ── Spacer ── */
.topnav-spacer {
  flex: 1;
}

/* ── Right actions ── */
.topnav-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.topnav-action-btn {
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
.topnav-action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>