<template>
  <div class="app-layout">
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
import { useConnectionStore } from '../stores/connection'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const connectionStore = useConnectionStore()

const handleMenuAction = (action: string) => {
  switch (action) {
    case 'new_connection':
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
    case 'refresh':
      connectionStore.fetchConnections()
      message.success('Refreshed')
      break
    case 'refresh_metadata':
      message.info('Refreshing metadata...')
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
    case 'connect':
      message.info('Connect to database')
      break
    case 'disconnect':
      message.info('Disconnect from database')
      break
    case 'execute':
      message.info('Execute query')
      break
    case 'execute_line':
      message.info('Execute current line')
      break
    case 'execute_selection':
      message.info('Execute selection')
      break
    case 'format_sql':
      message.info('Format SQL')
      break
    case 'beautify':
      message.info('Beautify query')
      break
    case 'open_console':
    case 'logs':
      router.push('/logs')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'documentation':
      window.open('https://unidb.com/docs', '_blank')
      break
    case 'keyboard_shortcuts':
      message.info('Keyboard shortcuts dialog')
      break
    case 'report_bug':
      window.open('https://github.com/AndrewLiuZhangZong/UniDb/issues', '_blank')
      break
    case 'about':
      dialog.info({
        title: 'UniDb',
        content: `Version: 0.1.0\nElectron: ${window.electronAPI?.versions?.electron || 'N/A'}\nNode: ${window.electronAPI?.versions?.node || 'N/A'}`,
        positiveText: 'OK'
      })
      break
    case 'exit':
      window.close()
      break
    default:
      console.log('Unhandled action:', action)
  }
}

const handleOpenSettings = () => {
  router.push('/settings')
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
