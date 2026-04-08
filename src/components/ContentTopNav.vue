<template>
  <div class="topnav-bar">
    <nav class="topnav-nav" v-if="secondaryTabs.length > 0" role="tablist">
      <button
        v-for="(tab, index) in secondaryTabs"
        :key="tab.path"
        type="button"
        role="tab"
        class="topnav-tab"
        :class="{ active: isTabActive(tab) }"
        @click="router.push(tab.path)"
      >
        <span class="tab-dot" v-if="isTabActive(tab)" />
        {{ tab.label }}
      </button>
    </nav>

    <div class="topnav-spacer" />

    <button type="button" class="topnav-btn" @click="handleRefresh" :title="t('nav.refresh')">
      <n-icon :size="16"><RefreshOutline /></n-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import { useConnectionStore } from '../stores/connection'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const connectionStore = useConnectionStore()

const currentPath = computed(() => route.path)

const secondaryTabs = computed(() => {
  const path = currentPath.value

  if (path.startsWith('/settings')) {
    return [
      { path: '/settings?tab=general', label: t('nav.general') },
      { path: '/settings?tab=drivers', label: t('nav.drivers') },
      { path: '/settings?tab=logs', label: t('nav.logs') }
    ]
  }

  if (path.startsWith('/docs') || path.startsWith('/report') || path.startsWith('/about') || path.startsWith('/logs')) {
    return [
      { path: '/docs', label: t('nav.docs') },
      { path: '/report', label: t('nav.report') },
      { path: '/logs', label: t('nav.logs') },
      { path: '/about', label: t('nav.about') }
    ]
  }

  return []
})

const isTabActive = (tab: { path: string }) => {
  if (currentPath.value.startsWith('/settings')) {
    const tabTab = tab.path.match(/tab=(\w+)/)?.[1]
    const currentTab = (route.query.tab as string) || 'general'
    return tabTab === currentTab
  }
  return currentPath.value.startsWith(tab.path)
}

const handleRefresh = () => {
  connectionStore.fetchConnections()
}
</script>

<style scoped>
/* 顶栏：白色背景 + 底部细线 */
.topnav-bar {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
  user-select: none;
}

/* Tab 行：左对齐，横向排列 */
.topnav-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 1 auto;
}

/* 单个 Tab：文字 + 左侧指示点 */
.topnav-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.topnav-tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

/* 激活态：主题色文字 */
.topnav-tab.active {
  color: var(--accent-primary);
  font-weight: 600;
  background: var(--accent-primary-subtle);
}

.topnav-tab.active:hover {
  background: var(--accent-primary-subtle-hover);
}

/* 激活指示点 */
.tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
  flex-shrink: 0;
}

.topnav-spacer {
  flex: 1;
}

.topnav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.topnav-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
}
</style>