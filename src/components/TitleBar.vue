<template>
  <!-- 非 macOS 平台显示自定义标题栏 -->
  <div v-if="!isMacOS" class="title-bar">
    <!-- Drag Area -->
    <div class="drag-region">
      <div class="app-info">
        <svg class="app-logo" width="18" height="18" viewBox="0 0 256 256" fill="none">
          <circle cx="128" cy="128" r="100" fill="url(#titleLogoGrad)"/>
          <ellipse cx="128" cy="88" rx="50" ry="20" fill="rgba(255,255,255,0.3)"/>
          <ellipse cx="128" cy="128" rx="50" ry="20" fill="rgba(255,255,255,0.2)"/>
          <ellipse cx="128" cy="168" rx="50" ry="20" fill="rgba(255,255,255,0.1)"/>
          <defs>
            <linearGradient id="titleLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#18a058"/>
              <stop offset="100%" stop-color="#36b374"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="app-name">UniDb</span>
      </div>
    </div>

    <!-- Window Controls (Windows/Linux) -->
    <div class="window-controls">
      <button class="control-btn" @click="handleMinimize" title="最小化">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M1 5H9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="control-btn" @click="handleMaximize" title="最大化">
        <svg v-if="isMaximized" width="10" height="10" viewBox="0 0 10 10">
          <path d="M3 1H9V7M1 3V9H7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 10 10">
          <rect x="1" y="1" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
        </svg>
      </button>
      <button class="control-btn close-btn" @click="handleClose" title="关闭">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const isMaximized = ref(false)

const isMacOS = computed(() => {
  // @ts-ignore
  return window.electronAPI?.platform === 'darwin'
})

const checkMaximized = async () => {
  // @ts-ignore
  if (window.electronAPI?.isMaximized) {
    // @ts-ignore
    const max = await window.electronAPI.isMaximized()
    isMaximized.value = max
  }
}

const handleMinimize = () => {
  // @ts-ignore
  window.electronAPI?.minimize?.()
}

const handleMaximize = () => {
  // @ts-ignore
  window.electronAPI?.maximize?.()
}

const handleClose = () => {
  // @ts-ignore
  window.electronAPI?.close?.()
}

const handleWindowMaximizedChange = (event: Event) => {
  const customEvent = event as CustomEvent<boolean>
  isMaximized.value = customEvent.detail
}

onMounted(() => {
  checkMaximized()
  window.addEventListener('window-maximized-change', handleWindowMaximizedChange)
})

onUnmounted(() => {
  window.removeEventListener('window-maximized-change', handleWindowMaximizedChange)
})
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: linear-gradient(180deg, #1a1a1e 0%, #141418 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  user-select: none;
  -webkit-app-region: drag;
}

.drag-region {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 12px;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-logo {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.app-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.3px;
}

/* Window Controls - Windows/Linux style */
.window-controls {
  display: flex;
  align-items: stretch;
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
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.15s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.control-btn.close-btn:hover {
  background: #c42b1c;
  color: white;
}

.control-btn:active {
  background: rgba(255, 255, 255, 0.05);
}

.control-btn.close-btn:active {
  background: #a02518;
}
</style>
