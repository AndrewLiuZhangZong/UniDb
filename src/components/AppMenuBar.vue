<template>
  <div class="app-menu-bar" :class="{ 'is-macos': isMacOS }">
    <!-- Drag Region for macOS -->
    <div v-if="isMacOS" class="drag-region"></div>

    <div class="menu-section">
      <div
        v-for="menu in menus"
        :key="menu.key"
        class="menu-item"
        :class="{ 'is-active': activeMenu === menu.key }"
        @click="handleMenuClick(menu)"
        @mouseenter="handleMouseEnter(menu)"
      >
        <span class="menu-label">{{ getMenuLabel(menu.key) }}</span>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
          <div v-if="activeMenu === menu.key && menu.children" class="dropdown-menu">
            <template v-for="item in menu.children" :key="item.key">
              <div v-if="item.type === 'divider'" class="dropdown-divider"></div>
              <div
                v-else
                class="dropdown-item"
                :class="{ 'is-disabled': item.disabled }"
                @click.stop="handleMenuItemClick(item)"
              >
                <n-icon v-if="item.icon" class="item-icon">
                  <component :is="item.icon" />
                </n-icon>
                <span class="item-label">{{ getItemLabel(item) }}</span>
                <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
              </div>
            </template>
          </div>
        </transition>
      </div>
    </div>

    <div class="menu-section right">
      <!-- Theme Toggle -->
      <div class="menu-item" @click="toggleTheme">
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-icon class="menu-icon-btn">
              <MoonOutline v-if="currentTheme === 'dark'" />
              <SunnyOutline v-else />
            </n-icon>
          </template>
          {{ currentTheme === 'dark' ? t('settings.lightTheme') : t('settings.darkTheme') }}
        </n-tooltip>
      </div>
      <!-- Notifications -->
      <div class="menu-item">
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-icon class="menu-icon-btn"><NotificationsOutline /></n-icon>
          </template>
          {{ t('menu.notifications') }}
        </n-tooltip>
      </div>
      <!-- Settings -->
      <div class="menu-item" @click="openSettings">
        <n-tooltip trigger="hover" placement="bottom">
          <template #trigger>
            <n-icon class="menu-icon-btn"><SettingsOutline /></n-icon>
          </template>
          {{ t('menu.settings') }}
        </n-tooltip>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="activeMenu" class="menu-backdrop" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NTooltip } from 'naive-ui'
import {
  NotificationsOutline,
  SettingsOutline,
  AddOutline,
  DocumentTextOutline,
  DownloadOutline,
  ExitOutline,
  PlayCircleOutline,
  TerminalOutline,
  CloudDoneOutline,
  RefreshOutline,
  CreateOutline,
  TrashBinOutline,
  BuildOutline,
  ServerOutline,
  ConstructOutline,
  InformationCircleOutline,
  BookOutline,
  BugOutline,
  FolderOutline,
  RemoveOutline,
  SyncOutline,
  GlobeOutline,
  CheckmarkOutline,
  MoonOutline,
  SunnyOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const props = defineProps<{
  isMacOS?: boolean
}>()

const { t, locale } = useI18n()
const settingsStore = useSettingsStore()
const emit = defineEmits<{
  (e: 'menu-action', action: string): void
  (e: 'open-settings'): void
}>()

const activeMenu = ref<string | null>(null)

// Current theme
const currentTheme = computed(() => settingsStore.settings.theme)

// Toggle theme
const toggleTheme = () => {
  const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
  settingsStore.updateSetting('theme', newTheme)
  closeMenu()
}

// Open settings
const openSettings = () => {
  emit('open-settings')
  closeMenu()
}

// Language options
const languageOptions = [
  { key: 'zh-CN', label: '简体中文' },
  { key: 'en-US', label: 'English' }
]

// Get current language
const currentLanguage = computed(() => locale.value)

// Check if language option is currently selected
const isLanguageActive = (langKey: string) => locale.value === langKey

// Change language
const changeLanguage = (lang: string) => {
  locale.value = lang
  settingsStore.updateSetting('language', lang)
  closeMenu()
}

// Get menu label - fallback to key if translation not found
const getMenuLabel = (key: string): string => {
  const translation = t(`menu.${key}`)
  // If translation contains the key (not found), use a fallback
  if (translation === `menu.${key}`) {
    const fallbacks: Record<string, string> = {
      language: locale.value === 'zh-CN' ? '语言' : 'Language',
      sql: locale.value === 'zh-CN' ? 'SQL' : 'SQL'
    }
    return fallbacks[key] || key
  }
  return translation
}

// Get item label - handles special cases like language options
const getItemLabel = (item: MenuItem): string => {
  // For language items, show the language name directly
  if (item.key.startsWith('lang_')) {
    const langKey = item.key.replace('lang_', '')
    const lang = languageOptions.find(l => l.key === langKey)
    return lang?.label || langKey
  }
  // For regular items, use i18n
  const translation = t(`menu.${item.key}`)
  if (translation === `menu.${item.key}`) {
    return item.key
  }
  return translation
}

interface MenuItem {
  key: string
  icon?: any
  shortcut?: string
  disabled?: boolean
  type?: 'divider'
  action?: () => void
  children?: MenuItem[]
}

interface Menu {
  key: string
  children?: MenuItem[]
}

const menus: Menu[] = [
  {
    key: 'file',
    children: [
      { key: 'new_connection', icon: AddOutline, shortcut: '⌘N' },
      { key: 'open_connection', icon: FolderOutline, shortcut: '⌘O' },
      { type: 'divider' },
      { key: 'new_query', icon: DocumentTextOutline, shortcut: '⌘T' },
      { key: 'new_tab', icon: AddOutline, shortcut: '⌘⇧N' },
      { type: 'divider' },
      { key: 'export', icon: DownloadOutline },
      { key: 'import', icon: DownloadOutline },
      { type: 'divider' },
      { key: 'exit', icon: ExitOutline, shortcut: '⌘Q' }
    ]
  },
  {
    key: 'language',
    children: languageOptions.map(lang => ({
      key: `lang_${lang.key}`,
      icon: isLanguageActive(lang.key) ? CheckmarkOutline : GlobeOutline,
      action: () => changeLanguage(lang.key)
    }))
  },
  {
    key: 'sql',
    children: [
      { key: 'execute', icon: PlayCircleOutline, shortcut: '⌘↵' },
      { key: 'execute_line', icon: PlayCircleOutline, shortcut: '⌘L' },
      { key: 'execute_selection', icon: PlayCircleOutline, shortcut: '⌘↵' },
      { type: 'divider' },
      { key: 'format_sql', icon: ConstructOutline, shortcut: '⌘⇧F' },
      { key: 'beautify', icon: ConstructOutline },
      { type: 'divider' },
      { key: 'open_console', icon: TerminalOutline, shortcut: '⌘⇧C' }
    ]
  },
  {
    key: 'database',
    children: [
      { key: 'connect', icon: CloudDoneOutline },
      { key: 'disconnect', icon: RemoveOutline },
      { type: 'divider' },
      { key: 'refresh', icon: RefreshOutline, shortcut: 'F5' },
      { key: 'refresh_metadata', icon: SyncOutline },
      { type: 'divider' },
      { key: 'create_table', icon: CreateOutline },
      { key: 'create_database', icon: ServerOutline },
      { key: 'create_index', icon: BuildOutline },
      { type: 'divider' },
      { key: 'manage_connections', icon: BuildOutline, shortcut: '⌘⇧K' }
    ]
  },
  {
    key: 'help',
    children: [
      { key: 'documentation', icon: BookOutline },
      { key: 'keyboard_shortcuts', icon: DocumentTextOutline },
      { type: 'divider' },
      { key: 'report_bug', icon: BugOutline },
      { key: 'about', icon: InformationCircleOutline }
    ]
  }
]

const handleMenuClick = (menu: Menu) => {
  if (activeMenu.value === menu.key) {
    activeMenu.value = null
  } else {
    activeMenu.value = menu.key
  }
}

const handleMouseEnter = (menu: Menu) => {
  if (activeMenu.value && menu.children) {
    activeMenu.value = menu.key
  }
}

const handleMenuItemClick = (item: MenuItem) => {
  if (item.disabled) return
  // Handle language switching action
  if (item.action) {
    item.action()
    return
  }
  emit('menu-action', item.key)
  closeMenu()
}

const closeMenu = () => {
  activeMenu.value = null
}
</script>

<style scoped>
.app-menu-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 8px;
  background: linear-gradient(180deg, rgba(40, 40, 45, 0.98) 0%, rgba(30, 30, 35, 0.98) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  user-select: none;
  position: relative;
  z-index: 100;
}

/* macOS traffic lights area - reserve space for native window controls */
.app-menu-bar.is-macos {
  padding-left: 76px;
}

/* Drag region for window movement on macOS */
.drag-region {
  position: absolute;
  top: 0;
  left: 0;
  width: 68px;
  height: 100%;
  -webkit-app-region: drag;
  cursor: move;
}

.menu-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.menu-section.right {
  gap: 4px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menu-item:hover,
.menu-item.is-active {
  background: rgba(255, 255, 255, 0.08);
}

.menu-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

.menu-icon-btn {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.menu-icon-btn:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.08);
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
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  z-index: 1000;
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

.dropdown-item:hover .item-icon {
  color: rgba(255, 255, 255, 0.9);
}

.item-label {
  flex: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.item-shortcut {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.dropdown-divider {
  height: 1px;
  margin: 6px 12px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
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
