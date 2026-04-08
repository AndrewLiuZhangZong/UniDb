<template>
  <div class="app-layout" :class="{ 'is-macos': isMacOS }">
    <!-- Title Bar (with Traffic Lights on macOS) -->
    <TitleBar />

    <div class="app-body">
      <AppSideNav @menu-action="handleMenuAction" />
      <div class="page-content">
        <ContentTopNav />
        <router-view />
      </div>
    </div>

    <!-- Help Dialogs -->
    <HelpDialogs ref="helpDialogsRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import TitleBar from './TitleBar.vue'
import AppSideNav from './AppSideNav.vue'
import ContentTopNav from './ContentTopNav.vue'
import HelpDialogs from './HelpDialogs.vue'
import { useConnectionStore } from '../stores/connection'

const router = useRouter()
const message = useMessage()
const connectionStore = useConnectionStore()
const helpDialogsRef = ref<InstanceType<typeof HelpDialogs>>()

const isMacOS = computed(() => {
  return window.electronAPI?.platform === 'darwin'
})

const handleMenuAction = (action: string) => {
  switch (action) {
    case 'newConnection':
    case 'manageConnections':
      window.dispatchEvent(new CustomEvent('open-connection-dialog'))
      break
    case 'openConnection':
      window.dispatchEvent(new CustomEvent('open-connection-dialog'))
      break
    case 'newQuery':
      message.info('New query tab')
      break
    case 'newTab':
      message.info('New tab')
      break
    case 'export':
      message.info('Export data')
      break
    case 'import':
      message.info('Import data')
      break
    case 'exit':
      window.electronAPI?.close?.()
      break
    case 'undo':
      document.execCommand('undo')
      break
    case 'redo':
      document.execCommand('redo')
      break
    case 'cut':
      document.execCommand('cut')
      break
    case 'copy':
      document.execCommand('copy')
      break
    case 'paste':
      document.execCommand('paste')
      break
    case 'selectAll':
      document.execCommand('selectAll')
      break
    case 'refresh':
      connectionStore.fetchConnections()
      message.success('Refreshed')
      break
    case 'refreshMetadata':
      message.info('Refreshing metadata...')
      break
    case 'connect':
      message.info('Connect to database')
      break
    case 'disconnect':
      message.info('Disconnect from database')
      break
    case 'createTable':
      message.info('Create table dialog')
      break
    case 'createDatabase':
      message.info('Create database dialog')
      break
    case 'createIndex':
      message.info('Create index dialog')
      break
    case 'execute':
      window.dispatchEvent(new CustomEvent('execute-query'))
      break
    case 'executeLine':
      window.dispatchEvent(new CustomEvent('execute-query-line'))
      break
    case 'executeSelection':
      window.dispatchEvent(new CustomEvent('execute-query-selection'))
      break
    case 'formatSQL':
      window.dispatchEvent(new CustomEvent('format-sql'))
      break
    case 'beautify':
      window.dispatchEvent(new CustomEvent('beautify-query'))
      break
    case 'settings':
      router.push('/settings')
      break
    case 'home':
      router.push('/')
      break
    case 'toggleSidebar':
      window.dispatchEvent(new CustomEvent('toggle-sidebar'))
      break
    case 'zoomIn':
      window.electronAPI?.zoomIn?.() || (document.body.style.zoom = String(parseFloat(document.body.style.zoom || '1') + 0.1))
      break
    case 'zoomOut':
      window.electronAPI?.zoomOut?.() || (document.body.style.zoom = String(Math.max(0.5, parseFloat(document.body.style.zoom || '1') - 0.1)))
      break
    case 'resetZoom':
      window.electronAPI?.resetZoom?.() || (document.body.style.zoom = '1')
      break
    case 'toggleFullscreen':
      window.electronAPI?.toggleFullscreen?.()
      break
    case 'documentation':
      router.push('/docs')
      break
    case 'keyboardShortcuts':
      window.open('https://unidb.com/docs/keyboard', '_blank')
      break
    case 'reportBug':
      router.push('/report')
      break
    case 'checkUpdates':
      helpDialogsRef.value?.showCheckUpdates()
      break
    case 'about':
      router.push('/about')
      break
    default:
      console.log('Unhandled action:', action)
  }
}
</script>

<style scoped>
.app-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.page-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
</style>
