<template>
  <div class="app-layout" :class="{ 'is-macos': isMacOS }">
    <!-- Title Bar (with Traffic Lights on macOS) -->
    <TitleBar />

    <!-- Menu Bar -->
    <AppMenuBar @menu-action="handleMenuAction" />

    <!-- Page Content -->
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import TitleBar from './TitleBar.vue'
import AppMenuBar from './AppMenuBar.vue'
import { useConnectionStore } from '../stores/connection'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const connectionStore = useConnectionStore()

const isMacOS = computed(() => {
  return window.electronAPI?.platform === 'darwin'
})

const handleMenuAction = (action: string) => {
  switch (action) {
    case 'new_connection':
    case 'open_connection':
    case 'manage_connections':
      window.dispatchEvent(new CustomEvent('open-connection-dialog'))
      break
    case 'new_query':
      message.info('New query tab')
      break
    case 'new_tab':
      message.info('New tab')
      break
    case 'export':
      message.info('Export data')
      break
    case 'import':
      message.info('Import data')
      break
    case 'exit':
      window.electronAPI?.close()
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
    case 'select_all':
      document.execCommand('selectAll')
      break
    case 'refresh':
      connectionStore.fetchConnections()
      message.success('Refreshed')
      break
    case 'refresh_metadata':
      message.info('Refreshing metadata...')
      break
    case 'connect':
      message.info('Connect to database')
      break
    case 'disconnect':
      message.info('Disconnect from database')
      break
    case 'create_table':
      message.info('Create table dialog')
      break
    case 'create_database':
      message.info('Create database dialog')
      break
    case 'create_index':
      message.info('Create index dialog')
      break
    case 'execute':
      window.dispatchEvent(new CustomEvent('execute-query'))
      break
    case 'execute_line':
      window.dispatchEvent(new CustomEvent('execute-query-line'))
      break
    case 'execute_selection':
      window.dispatchEvent(new CustomEvent('execute-query-selection'))
      break
    case 'format_sql':
      window.dispatchEvent(new CustomEvent('format-sql'))
      break
    case 'beautify':
      window.dispatchEvent(new CustomEvent('beautify-query'))
      break
    case 'open_console':
    case 'open_console_panel':
      router.push('/logs')
      break
    case 'toggle_sidebar':
      window.dispatchEvent(new CustomEvent('toggle-sidebar'))
      break
    case 'zoom_in':
      message.info('Zoom in')
      break
    case 'zoom_out':
      message.info('Zoom out')
      break
    case 'reset_zoom':
      message.info('Reset zoom')
      break
    case 'toggle_fullscreen':
      window.electronAPI?.toggleFullscreen()
      break
    case 'documentation':
      window.open('https://unidb.com/docs', '_blank')
      break
    case 'keyboard_shortcuts':
      message.info('Keyboard shortcuts')
      break
    case 'report_bug':
      window.open('https://github.com/AndrewLiuZhangZong/UniDb/issues', '_blank')
      break
    case 'check_updates':
      message.info('Checking for updates...')
      break
    case 'about':
      dialog.info({
        title: 'UniDb',
        content: `Version: 0.1.0\nElectron: ${window.electronAPI?.versions?.electron || 'N/A'}\nNode: ${window.electronAPI?.versions?.node || 'N/A'}`,
        positiveText: 'OK'
      })
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
}

.page-content {
  flex: 1;
  overflow: hidden;
}
</style>
