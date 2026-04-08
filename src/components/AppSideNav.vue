<template>
  <aside class="app-side-nav">
    <div class="rail-top">
      <button type="button" class="rail-logo" @click="goHome" :aria-label="t('menu.home')">
        <svg width="34" height="34" viewBox="0 0 256 256" fill="none" aria-hidden="true">
          <circle cx="128" cy="128" r="108" fill="url(#railLogoG)" />
          <ellipse cx="128" cy="92" rx="44" ry="16" fill="rgba(255,255,255,0.32)" />
          <ellipse cx="128" cy="128" rx="44" ry="16" fill="rgba(255,255,255,0.18)" />
          <defs>
            <linearGradient id="railLogoG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#a78bfa" />
              <stop offset="100%" stop-color="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </button>
    </div>

    <nav class="rail-main" aria-label="Main">
      <button
        type="button"
        class="rail-item"
        :class="{ active: isHome }"
        @click="goHome"
      >
        <n-icon :size="22"><HomeOutline /></n-icon>
      </button>

      <n-dropdown
        v-model:show="fileMenuOpen"
        trigger="click"
        placement="right-start"
        :options="fileOptions"
        @select="onMenuSelect"
      >
        <div class="rail-dropdown-wrap">
          <button
            type="button"
            class="rail-item"
            :class="{ active: fileMenuOpen }"
          >
            <n-icon :size="22"><FolderOpenOutline /></n-icon>
          </button>
        </div>
      </n-dropdown>
    </nav>

    <div class="rail-bottom">
      <button
        type="button"
        class="rail-item"
        :class="{ active: isSettings }"
        @click="emitAction('settings')"
      >
        <n-icon :size="22"><SettingsOutline /></n-icon>
      </button>

      <button
        type="button"
        class="rail-item"
        :class="{ active: isHelpPage }"
        @click="router.push('/docs')"
      >
        <n-icon :size="22"><HelpCircleOutline /></n-icon>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NDropdown, NIcon } from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import {
  HomeOutline,
  FolderOpenOutline,
  SettingsOutline,
  HelpCircleOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const emit = defineEmits<{ (e: 'menu-action', action: string): void }>()

const isHome = computed(() => route.name === 'home' || route.path === '/' || route.path === '')
const isSettings = computed(() => route.path.startsWith('/settings'))

const fileMenuOpen = ref(false)

const fileOptions = computed<DropdownOption[]>(() => [
  { label: t('menu.newConnection'), key: 'newConnection' },
  { type: 'divider', key: 'd1' },
  { label: t('menu.export'), key: 'export' },
  { label: t('menu.import'), key: 'import' },
  { type: 'divider', key: 'd2' },
  { label: t('menu.exit'), key: 'exit' }
])

function emitAction(action: string) {
  emit('menu-action', action)
}

function goHome() {
  router.push('/')
}

const isHelpPage = computed(() =>
  route.path.startsWith('/docs') ||
  route.path.startsWith('/report') ||
  route.path.startsWith('/about') ||
  route.path.startsWith('/logs')
)

function onMenuSelect(key: string | number) {
  emit('menu-action', String(key))
  fileMenuOpen.value = false
}
</script>

<style scoped>
.app-side-nav {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--bg-menubar);
  border-right: 1px solid var(--border-secondary);
  user-select: none;
  z-index: 90;
  box-shadow: var(--shadow-rail, none);
}


.rail-top {
  display: flex;
  justify-content: center;
  padding: 12px 0 8px;
  flex-shrink: 0;
}

.rail-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.rail-logo:hover {
  transform: scale(1.04);
  box-shadow: var(--shadow-soft-sm, 0 4px 14px rgba(0,0,0,0.15));
}

.rail-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  min-height: 0;
}

.rail-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0 14px;
  flex-shrink: 0;
  border-top: 1px solid var(--border-secondary);
  margin-top: auto;
}

.rail-dropdown-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.rail-item {
  position: relative;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.rail-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.rail-item.active {
  color: var(--accent-primary);
  background: var(--accent-primary-subtle);
}

.rail-item.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  border-radius: 0 3px 3px 0;
  background: var(--accent-primary);
}
</style>
