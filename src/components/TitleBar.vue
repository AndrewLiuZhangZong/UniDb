<template>
  <div class="title-bar" :class="{ 'light-mode': !isDarkTheme }">
    <!-- macOS Traffic Lights -->
    <div class="traffic-lights" v-if="isMacOS">
      <div class="traffic-light close" @click="handleClose"></div>
      <div class="traffic-light minimize" @click="handleMinimize"></div>
      <div class="traffic-light maximize" @click="handleMaximize"></div>
    </div>

    <!-- App Title / Drag Region -->
    <div class="title-bar-drag">
      <span class="app-title">UniDb</span>
    </div>

    <!-- Window Controls (Windows/Linux) -->
    <div class="window-controls" v-if="!isMacOS">
      <button class="control-btn minimize" @click="handleMinimize">
        <n-icon><RemoveOutline /></n-icon>
      </button>
      <button class="control-btn maximize" @click="handleMaximize">
        <n-icon><SquareOutline /></n-icon>
      </button>
      <button class="control-btn close" @click="handleClose">
        <n-icon><CloseOutline /></n-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { NIcon } from 'naive-ui'
import {
  RemoveOutline,
  SquareOutline,
  CloseOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const isMacOS = computed(() => {
  return window.electronAPI?.platform === 'darwin'
})

const isMaximized = computed(() => window.electronAPI?.isMaximized || false)

// Window control handlers
const handleMinimize = () => {
  window.electronAPI?.minimize()
}

const handleMaximize = async () => {
  if (isMaximized.value) {
    window.electronAPI?.unmaximize()
  } else {
    window.electronAPI?.maximize()
  }
}

const handleClose = () => {
  window.electronAPI?.close?.()
}

// Listen for maximize state changes
onMounted(() => {
  window.addEventListener('maximize-change', handleMaximizeChange)
})

onUnmounted(() => {
  window.removeEventListener('maximize-change', handleMaximizeChange)
})

const handleMaximizeChange = () => {
  // Force re-render
}
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  height: 36px;
  background: linear-gradient(180deg, rgba(40, 40, 45, 0.98) 0%, rgba(30, 30, 35, 0.98) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  user-select: none;
  -webkit-app-region: drag;
}

/* Light mode */
.title-bar.light-mode {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 248, 248, 0.98) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Traffic Lights */
.traffic-lights {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 100%;
  -webkit-app-region: no-drag;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.traffic-light:hover {
  filter: brightness(0.8);
}

.traffic-light.close {
  background: #ff5f57;
}

.traffic-light.minimize {
  background: #febc2e;
}

.traffic-light.maximize {
  background: #28c840;
}

/* Drag Region */
.title-bar-drag {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 12px;
  height: 100%;
}

.app-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.light-mode .app-title {
  color: rgba(0, 0, 0, 0.6);
}

/* Window Controls (Windows/Linux) */
.window-controls {
  display: flex;
  align-items: center;
  height: 100%;
  -webkit-app-region: no-drag;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn.close:hover {
  background: #e81123;
}

.light-mode .control-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.light-mode .control-btn.close:hover {
  background: #e81123;
}

.control-btn n-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.light-mode .control-btn n-icon {
  color: rgba(0, 0, 0, 0.8);
}
</style>
