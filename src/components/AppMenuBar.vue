<template>
  <div class="app-menu-bar" :class="{ 'light-mode': !isDarkTheme }">
    <div class="menu-section">
      <!-- File Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'file' }"
        @click="handleMenuClick('file')"
        @mouseenter="handleMouseEnter('file')"
      >
        <span class="menu-label">{{ getMenuLabel('file') }}</span>

        <transition name="dropdown">
          <div v-if="activeMenu === 'file'" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="handleAction('new_connection')">
              <n-icon class="item-icon"><AddOutline /></n-icon>
              <span class="item-label">{{ t('menu.newConnection') }}</span>
              <span class="item-shortcut">⌘N</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('open_connection')">
              <n-icon class="item-icon"><FolderOutline /></n-icon>
              <span class="item-label">{{ t('menu.openConnection') }}</span>
              <span class="item-shortcut">⌘O</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('new_query')">
              <n-icon class="item-icon"><DocumentTextOutline /></n-icon>
              <span class="item-label">{{ t('menu.newQuery') }}</span>
              <span class="item-shortcut">⌘T</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('new_tab')">
              <n-icon class="item-icon"><AddOutline /></n-icon>
              <span class="item-label">{{ t('menu.newTab') }}</span>
              <span class="item-shortcut">⌘⇧N</span>
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

      <!-- Edit Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'edit' }"
        @click="handleMenuClick('edit')"
        @mouseenter="handleMouseEnter('edit')"
      >
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
            <div class="dropdown-item" @click.stop="handleAction('select_all')">
              <span class="item-label">{{ t('menu.selectAll') }}</span>
              <span class="item-shortcut">⌘A</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Database Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'database' }"
        @click="handleMenuClick('database')"
        @mouseenter="handleMouseEnter('database')"
      >
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
            <div class="dropdown-item" @click.stop="handleAction('refresh_metadata')">
              <n-icon class="item-icon"><SyncOutline /></n-icon>
              <span class="item-label">{{ t('menu.refreshMetadata') }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('create_table')">
              <n-icon class="item-icon"><CreateOutline /></n-icon>
              <span class="item-label">{{ t('menu.createTable') }}</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('create_database')">
              <n-icon class="item-icon"><ServerOutline /></n-icon>
              <span class="item-label">{{ t('menu.createDatabase') }}</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('create_index')">
              <n-icon class="item-icon"><BuildOutline /></n-icon>
              <span class="item-label">{{ t('menu.createIndex') }}</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- SQL Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'sql' }"
        @click="handleMenuClick('sql')"
        @mouseenter="handleMouseEnter('sql')"
      >
        <span class="menu-label">{{ getMenuLabel('sql') }}</span>

        <transition name="dropdown">
          <div v-if="activeMenu === 'sql'" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="handleAction('execute')">
              <n-icon class="item-icon"><PlayCircleOutline /></n-icon>
              <span class="item-label">{{ t('menu.execute') }}</span>
              <span class="item-shortcut">⌘↵</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('execute_line')">
              <n-icon class="item-icon"><PlayCircleOutline /></n-icon>
              <span class="item-label">{{ t('menu.executeLine') }}</span>
              <span class="item-shortcut">⌘L</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('execute_selection')">
              <span class="item-label">{{ t('menu.executeSelection') }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('format_sql')">
              <n-icon class="item-icon"><ConstructOutline /></n-icon>
              <span class="item-label">{{ t('menu.formatSQL') }}</span>
              <span class="item-shortcut">⇧⌘F</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('beautify')">
              <n-icon class="item-icon"><BrushOutline /></n-icon>
              <span class="item-label">{{ t('menu.beautify') }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('open_console')">
              <n-icon class="item-icon"><TerminalOutline /></n-icon>
              <span class="item-label">{{ t('menu.openConsole') }}</span>
              <span class="item-shortcut">⌘⇧C</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- View Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'view' }"
        @click="handleMenuClick('view')"
        @mouseenter="handleMouseEnter('view')"
      >
        <span class="menu-label">{{ getMenuLabel('view') }}</span>

        <transition name="dropdown">
          <div v-if="activeMenu === 'view'" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="handleAction('toggle_sidebar')">
              <n-icon class="item-icon"><MenuOutline /></n-icon>
              <span class="item-label">{{ t('menu.toggleSidebar') }}</span>
              <span class="item-shortcut">⌘B</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('zoom_in')">
              <n-icon class="item-icon"><AddOutline /></n-icon>
              <span class="item-label">{{ t('menu.zoomIn') }}</span>
              <span class="item-shortcut">⌘+</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('zoom_out')">
              <n-icon class="item-icon"><RemoveOutline /></n-icon>
              <span class="item-label">{{ t('menu.zoomOut') }}</span>
              <span class="item-shortcut">⌘-</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('reset_zoom')">
              <span class="item-label">{{ t('menu.resetZoom') }}</span>
              <span class="item-shortcut">⌘0</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('toggle_fullscreen')">
              <n-icon class="item-icon"><ExpandOutline /></n-icon>
              <span class="item-label">{{ t('menu.toggleFullscreen') }}</span>
              <span class="item-shortcut">F11</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('open_console_panel')">
              <n-icon class="item-icon"><TerminalOutline /></n-icon>
              <span class="item-label">{{ t('menu.openConsolePanel') }}</span>
              <span class="item-shortcut">⌘J</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Language Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'language' }"
        @click="handleMenuClick('language')"
        @mouseenter="handleMouseEnter('language')"
      >
        <span class="menu-label">{{ getMenuLabel('language') }}</span>

        <transition name="dropdown">
          <div v-if="activeMenu === 'language'" class="dropdown-menu">
            <div
              class="dropdown-item"
              :class="{ 'is-selected': currentLanguage === 'zh-CN' }"
              @click.stop="handleLanguageChange('zh-CN')"
            >
              <n-icon v-if="currentLanguage === 'zh-CN'" class="item-icon"><CheckmarkOutline /></n-icon>
              <span v-else class="item-icon-spacer"></span>
              <span class="item-label">简体中文</span>
            </div>
            <div
              class="dropdown-item"
              :class="{ 'is-selected': currentLanguage === 'en-US' }"
              @click.stop="handleLanguageChange('en-US')"
            >
              <n-icon v-if="currentLanguage === 'en-US'" class="item-icon"><CheckmarkOutline /></n-icon>
              <span v-else class="item-icon-spacer"></span>
              <span class="item-label">English</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Help Menu -->
      <div
        class="menu-item"
        :class="{ 'is-active': activeMenu === 'help' }"
        @click="handleMenuClick('help')"
        @mouseenter="handleMouseEnter('help')"
      >
        <span class="menu-label">{{ getMenuLabel('help') }}</span>

        <transition name="dropdown">
          <div v-if="activeMenu === 'help'" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="handleAction('toggle_theme')">
              <n-icon class="item-icon">
                <MoonOutline v-if="isDarkTheme" />
                <SunnyOutline v-else />
              </n-icon>
              <span class="item-label">{{ isDarkTheme ? t('menu.switchToLight') : t('menu.switchToDark') }}</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('open_settings')">
              <n-icon class="item-icon"><SettingsOutline /></n-icon>
              <span class="item-label">{{ t('menu.settings') }}</span>
              <span class="item-shortcut">⌘,</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('documentation')">
              <n-icon class="item-icon"><BookOutline /></n-icon>
              <span class="item-label">{{ t('menu.documentation') }}</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('keyboard_shortcuts')">
              <n-icon class="item-icon"><DocumentTextOutline /></n-icon>
              <span class="item-label">{{ t('menu.keyboardShortcuts') }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="handleAction('report_bug')">
              <n-icon class="item-icon"><BugOutline /></n-icon>
              <span class="item-label">{{ t('menu.reportBug') }}</span>
            </div>
            <div class="dropdown-item" @click.stop="handleAction('check_updates')">
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
  AddOutline,
  FolderOutline,
  DocumentTextOutline,
  DownloadOutline,
  CloudUploadOutline,
  ExitOutline,
  ArrowUndoOutline,
  ArrowRedoOutline,
  CloudDoneOutline,
  CloudOfflineOutline,
  RefreshOutline,
  SyncOutline,
  CreateOutline,
  ServerOutline,
  BuildOutline,
  PlayCircleOutline,
  ConstructOutline,
  BrushOutline,
  TerminalOutline,
  MenuOutline,
  RemoveOutline,
  ExpandOutline,
  GlobeOutline,
  CheckmarkOutline,
  BookOutline,
  BugOutline,
  CloudDownloadOutline,
  InformationCircleOutline,
  MoonOutline,
  SunnyOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t, locale } = useI18n()
const settingsStore = useSettingsStore()

const emit = defineEmits<{
  (e: 'menu-action', action: string): void
}>()

const activeMenu = ref<string | null>(null)

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const currentLanguage = computed(() => locale.value)

// Toggle theme
const toggleTheme = () => {
  const newTheme = isDarkTheme.value ? 'light' : 'dark'
  settingsStore.updateSetting('theme', newTheme)
  closeMenu()
}

// Language
const handleLanguageChange = (lang: string) => {
  locale.value = lang
  settingsStore.updateSetting('language', lang)
  closeMenu()
}

// Menu
const handleMenuClick = (menu: string) => {
  if (activeMenu.value === menu) {
    activeMenu.value = null
  } else {
    activeMenu.value = menu
  }
}

const handleMouseEnter = (menu: string) => {
  if (activeMenu.value) {
    activeMenu.value = menu
  }
}

const closeMenu = () => {
  activeMenu.value = null
}

// Actions
const handleAction = (action: string) => {
  // Handle theme toggle directly
  if (action === 'toggle_theme') {
    toggleTheme()
    return
  }
  emit('menu-action', action)
  closeMenu()
}

// Menu labels with i18n fallback
const getMenuLabel = (key: string): string => {
  const translation = t(`menu.${key}`)
  if (translation === `menu.${key}`) {
    const fallbacks: Record<string, string> = {
      file: locale.value === 'zh-CN' ? '文件' : 'File',
      edit: locale.value === 'zh-CN' ? '编辑' : 'Edit',
      database: locale.value === 'zh-CN' ? '数据库' : 'Database',
      sql: 'SQL',
      view: locale.value === 'zh-CN' ? '视图' : 'View',
      language: locale.value === 'zh-CN' ? '语言' : 'Language',
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
  justify-content: space-between;
  height: 28px;
  padding: 0 8px;
  background: rgba(30, 30, 35, 0.95);
  user-select: none;
  position: relative;
  z-index: 100;
}

.app-menu-bar.light-mode {
  background: rgba(255, 255, 255, 0.98);
}

.menu-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menu-item:hover,
.menu-item.is-active {
  background: rgba(255, 255, 255, 0.08);
}

.light-mode .menu-item:hover,
.light-mode .menu-item.is-active {
  background: rgba(0, 0, 0, 0.06);
}

.menu-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.light-mode .menu-label {
  color: rgba(0, 0, 0, 0.85);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  padding: 6px 0;
  background: rgba(30, 30, 35, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.light-mode .dropdown-menu {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.dropdown-item:hover {
  background: rgba(24, 160, 88, 0.25);
}

.light-mode .dropdown-item:hover {
  background: rgba(24, 160, 88, 0.15);
}

.dropdown-item.is-selected {
  background: rgba(24, 160, 88, 0.15);
}

.dropdown-item.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dropdown-item.is-disabled:hover {
  background: transparent;
}

.item-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.light-mode .item-icon {
  color: rgba(0, 0, 0, 0.6);
}

.item-icon-spacer {
  width: 16px;
  flex-shrink: 0;
}

.dropdown-item:hover .item-icon {
  color: rgba(255, 255, 255, 0.9);
}

.light-mode .dropdown-item:hover .item-icon {
  color: rgba(0, 0, 0, 0.9);
}

.item-label {
  flex: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.light-mode .item-label {
  color: rgba(0, 0, 0, 0.85);
}

.item-shortcut {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.light-mode .item-shortcut {
  color: rgba(0, 0, 0, 0.35);
}

.dropdown-divider {
  height: 1px;
  margin: 6px 12px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.light-mode .dropdown-divider {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

/* Backdrop */
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
