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
      <div class="menu-item" :class="{ 'is-active': activeMenu === 'file' }"
        @click="handleMenuClick('file')" @mouseenter="handleMouseEnter('file')">
        <span class="menu-label">{{ getMenuLabel('file') }}</span>
        <transition name="dropdown">
          <div v-if="activeMenu === 'file'" class="dropdown-menu">
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
        </transition>
      </div>

      <!-- Edit -->
      <div class="menu-item" :class="{ 'is-active': activeMenu === 'edit' }"
        @click="handleMenuClick('edit')" @mouseenter="handleMouseEnter('edit')">
        <span class="menu-label">{{ getMenuLabel('edit') }}</span>
        <transition name="dropdown">
          <div v-if="activeMenu === 'edit'" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="handleAction('undo')">
              <n-icon class="item-icon"><ArrowUndoOutline /></n-icon>
              <span class="item-label">{{ t('menu.undo') }}</span>
              <span class="item-shortcut">⌘Z</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('redo')">
              <n-icon class="item-icon"><ArrowRedoOutline /></n-icon>
              <span class="item-label">{{ t('menu.redo') }}</span>
              <span class="item-shortcut">⇧⌘Z</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('cut')">
              <span class="item-label">{{ t('menu.cut') }}</span>
              <span class="item-shortcut">⌘X</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('copy')">
              <span class="item-label">{{ t('menu.copy') }}</span>
              <span class="item-shortcut">⌘C</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('paste')">
              <span class="item-label">{{ t('menu.paste') }}</span>
              <span class="item-shortcut">⌘V</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('selectAll')">
              <span class="item-label">{{ t('menu.selectAll') }}</span>
              <span class="item-shortcut">⌘A</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Database -->
      <div class="menu-item" :class="{ 'is-active': activeMenu === 'database' }"
        @click="handleMenuClick('database')" @mouseenter="handleMouseEnter('database')">
        <span class="menu-label">{{ getMenuLabel('database') }}</span>
        <transition name="dropdown">
          <div v-if="activeMenu === 'database'" class="dropdown-menu">
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
        </transition>
      </div>

      <!-- SQL -->
      <div class="menu-item" :class="{ 'is-active': activeMenu === 'sql' }"
        @click="handleMenuClick('sql')" @mouseenter="handleMouseEnter('sql')">
        <span class="menu-label">SQL</span>
        <transition name="dropdown">
          <div v-if="activeMenu === 'sql'" class="dropdown-menu">
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
        </transition>
      </div>

      <!-- View -->
      <div class="menu-item" :class="{ 'is-active': activeMenu === 'view' }"
        @click="handleMenuClick('view')" @mouseenter="handleMouseEnter('view')">
        <span class="menu-label">{{ getMenuLabel('view') }}</span>
        <transition name="dropdown">
          <div v-if="activeMenu === 'view'" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="handleAction('toggleSidebar')">
              <n-icon class="item-icon"><MenuOutline /></n-icon>
              <span class="item-label">{{ t('menu.toggleSidebar') }}</span>
              <span class="item-shortcut">⌘B</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('zoomIn')">
              <n-icon class="item-icon"><AddOutline /></n-icon>
              <span class="item-label">{{ t('menu.zoomIn') }}</span>
              <span class="item-shortcut">⌘+</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('zoomOut')">
              <n-icon class="item-icon"><RemoveOutline /></n-icon>
              <span class="item-label">{{ t('menu.zoomOut') }}</span>
              <span class="item-shortcut">⌘-</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('resetZoom')">
              <span class="item-label">{{ t('menu.resetZoom') }}</span>
              <span class="item-shortcut">⌘0</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('toggleFullscreen')">
              <n-icon class="item-icon"><ExpandOutline /></n-icon>
              <span class="item-label">{{ t('menu.toggleFullscreen') }}</span>
              <span class="item-shortcut">F11</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('openConsolePanel')">
              <n-icon class="item-icon"><TerminalOutline /></n-icon>
              <span class="item-label">{{ t('menu.openConsolePanel') }}</span>
              <span class="item-shortcut">⌘J</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- ── Settings (opens drawer panel) ── -->
      <div class="menu-item" @click="handleAction('settings')">
        <n-icon class="menu-icon-only"><SettingsOutline /></n-icon>
        <span class="menu-label">{{ t('menu.settings') }}</span>
      </div>

      <!-- Help -->
      <div class="menu-item" :class="{ 'is-active': activeMenu === 'help' }"
        @click="handleMenuClick('help')" @mouseenter="handleMouseEnter('help')">
        <span class="menu-label">{{ getMenuLabel('help') }}</span>
        <transition name="dropdown">
          <div v-if="activeMenu === 'help'" class="dropdown-menu">
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
        </transition>
      </div>

    </div>

    <!-- Backdrop -->
    <div v-if="activeMenu" class="menu-backdrop" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import {
  AddOutline, FolderOutline, DocumentTextOutline, DownloadOutline, CloudUploadOutline,
  ExitOutline, ArrowUndoOutline, ArrowRedoOutline, CloudDoneOutline, CloudOfflineOutline,
  RefreshOutline, SyncOutline, CreateOutline, ServerOutline, BuildOutline,
  PlayCircleOutline, ConstructOutline, BrushOutline, TerminalOutline,
  MenuOutline, RemoveOutline, ExpandOutline,
  BookOutline, BugOutline, CloudDownloadOutline, InformationCircleOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t, locale } = useI18n()
const settingsStore = useSettingsStore()

const emit = defineEmits<{ (e: 'menu-action', action: string): void }>()

const activeMenu = ref<string | null>(null)
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const handleMenuClick = (menu: string) => {
  activeMenu.value = activeMenu.value === menu ? null : menu
}

const handleMouseEnter = (menu: string) => {
  if (activeMenu.value) activeMenu.value = menu
}

const closeMenu = () => { activeMenu.value = null }

const handleAction = (action: string) => {
  emit('menu-action', action)
  closeMenu()
}

const getMenuLabel = (key: string): string => {
  const translation = t(`menu.${key}`)
  if (translation === `menu.${key}`) {
    const fallbacks: Record<string, string> = {
      file: locale.value === 'zh-CN' ? '文件' : 'File',
      edit: locale.value === 'zh-CN' ? '编辑' : 'Edit',
      database: locale.value === 'zh-CN' ? '数据库' : 'Database',
      view: locale.value === 'zh-CN' ? '视图' : 'View',
      help: locale.value === 'zh-CN' ? '帮助' : 'Help'
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

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 100%;
  padding: 0 12px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.12s ease;
  white-space: nowrap;
}

.menu-item:hover,
.menu-item.is-active {
  background: rgba(255,255,255,0.08);
}

.light-mode .menu-item:hover,
.light-mode .menu-item.is-active {
  background: rgba(0,0,0,0.07);
}

.menu-label {
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(255,255,255,0.82);
  line-height: 1;
}

.light-mode .menu-label {
  color: rgba(0,0,0,0.78);
}

.menu-icon-only {
  font-size: 15px;
  color: rgba(255,255,255,0.65);
  flex-shrink: 0;
}
.light-mode .menu-icon-only {
  color: rgba(0,0,0,0.55);
}

.home-btn { gap: 7px; padding: 0 10px; }
.home-name {
  font-size: 14px;
  font-weight: 600;
  color: #36b374;
  letter-spacing: 0.2px;
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
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.13s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-3px); }
</style>
