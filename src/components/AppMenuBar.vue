<template>
  <div class="app-menu-bar" :class="{ 'light-mode': !isDarkTheme }">
    <div class="menu-section">

      <!-- Home / Logo -->
      <div class="menu-item home-btn" @click="handleAction('home')" title="主页">
        <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
          <circle cx="128" cy="128" r="110" fill="url(#logoG)"/>
          <ellipse cx="128" cy="90" rx="46" ry="18" fill="rgba(255,255,255,0.35)"/>
          <ellipse cx="128" cy="128" rx="46" ry="18" fill="rgba(255,255,255,0.22)"/>
          <ellipse cx="128" cy="166" rx="46" ry="18" fill="rgba(255,255,255,0.12)"/>
          <defs>
            <linearGradient id="logoG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#18a058"/>
              <stop offset="100%" stop-color="#36b374"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="home-name">UniDb</span>
      </div>

      <div class="menu-divider-v"></div>

      <!-- File -->
      <div class="menu-wrapper">
        <div class="menu-item">
          <span class="menu-label">{{ getMenuLabel('file') }}</span>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-item" @click.stop="handleAction('newConnection')">
            <n-icon class="item-icon"><AddOutline /></n-icon>
            <span class="item-label">{{ t('menu.newConnection') }}</span>
            <span class="item-shortcut">⌘N</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('openConnection')">
            <n-icon class="item-icon"><FolderOutline /></n-icon>
            <span class="item-label">{{ t('menu.openConnection') }}</span>
            <span class="item-shortcut">⌘O</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('newQuery')">
            <n-icon class="item-icon"><DocumentTextOutline /></n-icon>
            <span class="item-label">{{ t('menu.newQuery') }}</span>
            <span class="item-shortcut">⌘T</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('export')">
            <n-icon class="item-icon"><DownloadOutline /></n-icon>
            <span class="item-label">{{ t('menu.export') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('import')">
            <n-icon class="item-icon"><CloudUploadOutline /></n-icon>
            <span class="item-label">{{ t('menu.import') }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('exit')">
            <n-icon class="item-icon"><ExitOutline /></n-icon>
            <span class="item-label">{{ t('menu.exit') }}</span>
            <span class="item-shortcut">⌘Q</span>
          </div>
        </div>
      </div>

      <!-- Database -->
      <div class="menu-wrapper">
        <div class="menu-item">
          <span class="menu-label">{{ getMenuLabel('database') }}</span>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-item" @click.stop="handleAction('connect')">
            <n-icon class="item-icon"><CloudDoneOutline /></n-icon>
            <span class="item-label">{{ t('menu.connect') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('disconnect')">
            <n-icon class="item-icon"><CloudOfflineOutline /></n-icon>
            <span class="item-label">{{ t('menu.disconnect') }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('refresh')">
            <n-icon class="item-icon"><RefreshOutline /></n-icon>
            <span class="item-label">{{ t('menu.refresh') }}</span>
            <span class="item-shortcut">F5</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('refreshMetadata')">
            <n-icon class="item-icon"><SyncOutline /></n-icon>
            <span class="item-label">{{ t('menu.refreshMetadata') }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('createTable')">
            <n-icon class="item-icon"><CreateOutline /></n-icon>
            <span class="item-label">{{ t('menu.createTable') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('createDatabase')">
            <n-icon class="item-icon"><ServerOutline /></n-icon>
            <span class="item-label">{{ t('menu.createDatabase') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('createIndex')">
            <n-icon class="item-icon"><BuildOutline /></n-icon>
            <span class="item-label">{{ t('menu.createIndex') }}</span>
          </div>
        </div>
      </div>

      <!-- SQL -->
      <div class="menu-wrapper">
        <div class="menu-item">
          <span class="menu-label">SQL</span>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-item" @click.stop="handleAction('execute')">
            <n-icon class="item-icon"><PlayCircleOutline /></n-icon>
            <span class="item-label">{{ t('menu.execute') }}</span>
            <span class="item-shortcut">⌘↵</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('executeLine')">
            <n-icon class="item-icon"><PlayCircleOutline /></n-icon>
            <span class="item-label">{{ t('menu.executeLine') }}</span>
            <span class="item-shortcut">⌘L</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('executeSelection')">
            <span class="item-label">{{ t('menu.executeSelection') }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('formatSQL')">
            <n-icon class="item-icon"><ConstructOutline /></n-icon>
            <span class="item-label">{{ t('menu.formatSQL') }}</span>
            <span class="item-shortcut">⇧⌘F</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('beautify')">
            <n-icon class="item-icon"><BrushOutline /></n-icon>
            <span class="item-label">{{ t('menu.beautify') }}</span>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="menu-wrapper">
        <div class="menu-item">
          <span class="menu-label">{{ t('menu.settings') }}</span>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-item" @click.stop="handleAction('settings')">
            <span class="item-label">{{ t('menu.settings') }}</span>
          </div>
        </div>
      </div>

      <!-- Help -->
      <div class="menu-wrapper">
        <div class="menu-item">
          <span class="menu-label">{{ getMenuLabel('help') }}</span>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-item" @click.stop="handleAction('documentation')">
            <n-icon class="item-icon"><BookOutline /></n-icon>
            <span class="item-label">{{ t('menu.documentation') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('keyboardShortcuts')">
            <n-icon class="item-icon"><DocumentTextOutline /></n-icon>
            <span class="item-label">{{ t('menu.keyboardShortcuts') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('reportBug')">
            <n-icon class="item-icon"><BugOutline /></n-icon>
            <span class="item-label">{{ t('menu.reportBug') }}</span>
          </div>
          <div class="dropdown-item" @click.stop="handleAction('checkUpdates')">
            <n-icon class="item-icon"><CloudDownloadOutline /></n-icon>
            <span class="item-label">{{ t('menu.checkUpdates') }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click.stop="handleAction('about')">
            <n-icon class="item-icon"><InformationCircleOutline /></n-icon>
            <span class="item-label">{{ t('menu.about') }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import {
  AddOutline, FolderOutline, DocumentTextOutline, DownloadOutline, CloudUploadOutline,
  ExitOutline, CloudDoneOutline, CloudOfflineOutline,
  RefreshOutline, SyncOutline, CreateOutline, ServerOutline, BuildOutline,
  PlayCircleOutline, ConstructOutline, BrushOutline,
  BookOutline, BugOutline, CloudDownloadOutline, InformationCircleOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const emit = defineEmits<{ (e: 'menu-action', action: string): void }>()

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const handleAction = (action: string) => {
  emit('menu-action', action)
}

const getMenuLabel = (key: string): string => {
  const translation = t(`menu.${key}`)
  if (translation === `menu.${key}`) {
    const fallbacks: Record<string, string> = {
      file: 'File',
      database: 'Database',
      help: 'Help'
    }
    return fallbacks[key] || key
  }
  return translation
}
</script>

<style scoped>
.app-menu-bar {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 10px;
  background: rgba(22, 22, 28, 0.97);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  user-select: none;
  position: relative;
  z-index: 100;
  gap: 0;
}

.app-menu-bar.light-mode {
  background: rgba(246, 246, 250, 0.99);
  border-bottom: 1px solid rgba(0,0,0,0.09);
}

.menu-section {
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
}

/* wrapper holds both the menu item and its dropdown */
.menu-wrapper {
  position: relative;
  height: 100%;
}

/* show dropdown on hover */
.menu-wrapper:hover .dropdown-menu {
  display: block;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 100%;
  cursor: pointer;
  transition: background 0.1s;
  position: relative;
}

.menu-item:hover { background: rgba(255,255,255,0.07); }
.light-mode .menu-item:hover { background: rgba(0,0,0,0.05); }
.menu-item.is-active { background: rgba(24,160,88,0.15); }
.light-mode .menu-item.is-active { background: rgba(24,160,88,0.1); }

.menu-label {
  font-size: 13px;
  color: rgba(255,255,255,0.82);
  white-space: nowrap;
  line-height: 1;
}
.light-mode .menu-label { color: rgba(0,0,0,0.78); }

.home-btn { gap: 7px; padding: 0 10px; }
.home-name {
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.3px;
}
.light-mode .home-name { color: #18a058; }

.menu-divider-v {
  width: 1px;
  height: 18px;
  background: rgba(255,255,255,0.1);
  margin: 0 4px;
  flex-shrink: 0;
}
.light-mode .menu-divider-v { background: rgba(0,0,0,0.1); }

/* Dropdown */
.dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  min-width: 220px;
  padding: 5px 0;
  background: #1e1e26;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
  z-index: 1000;
}

.light-mode .dropdown-menu {
  background: #ffffff;
  border-color: rgba(0,0,0,0.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07);
}

.lang-menu { min-width: 150px; }

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.dropdown-item:hover { background: rgba(24,160,88,0.18); }
.light-mode .dropdown-item:hover { background: rgba(24,160,88,0.1); }

.dropdown-item.is-selected { background: rgba(24,160,88,0.12); }
.light-mode .dropdown-item.is-selected { background: rgba(24,160,88,0.08); }

.item-icon {
  font-size: 15px;
  color: rgba(255,255,255,0.55);
  flex-shrink: 0;
  width: 16px;
}
.light-mode .item-icon { color: rgba(0,0,0,0.5); }
.dropdown-item:hover .item-icon { color: rgba(255,255,255,0.9); }
.light-mode .dropdown-item:hover .item-icon { color: rgba(0,0,0,0.85); }

.item-icon-spacer { width: 16px; flex-shrink: 0; }

.item-label {
  flex: 1;
  font-size: 13.5px;
  color: rgba(255,255,255,0.85);
}
.light-mode .item-label { color: rgba(0,0,0,0.82); }
.dropdown-item:hover .item-label { color: rgba(255,255,255,0.95); }
.light-mode .dropdown-item:hover .item-label { color: rgba(0,0,0,0.92); }

.item-shortcut {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  font-family: 'SF Mono','Monaco',monospace;
  flex-shrink: 0;
}
.light-mode .item-shortcut { color: rgba(0,0,0,0.3); }

.dropdown-divider {
  height: 1px;
  margin: 4px 10px;
  background: rgba(255,255,255,0.08);
}
.light-mode .dropdown-divider { background: rgba(0,0,0,0.08); }

/* Backdrop */
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

/* Dropdown animation */
.dropdown-menu {
  animation: dropdown-in 0.12s ease;
}

@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
