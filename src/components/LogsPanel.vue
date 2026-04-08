<template>
  <div class="logs-panel">
    <!-- Toolbar -->
    <div class="logs-toolbar">
      <n-space wrap>
        <n-select
          v-model:value="levelFilter"
          :options="levelOptions"
          multiple
          size="small"
          :placeholder="t('logViewer.filterByLevel')"
          style="width: 200px;"
        />
        <n-input
          v-model:value="searchKeyword"
          size="small"
          :placeholder="t('logViewer.searchPlaceholder')"
          clearable
          style="width: 220px;"
          @keyup.enter="currentPage = 1"
        >
          <template #prefix><n-icon><SearchOutline /></n-icon></template>
        </n-input>
      </n-space>
      <div class="toolbar-right">
        <span class="log-count">{{ filteredLogs.length }} 条</span>
        <n-button size="small" @click="handleRefresh">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          刷新
        </n-button>
        <n-button size="small" @click="handleExport">
          <template #icon><n-icon><DownloadOutline /></n-icon></template>
          导出
        </n-button>
        <n-button size="small" type="error" ghost @click="handleClear">
          <template #icon><n-icon><TrashOutline /></n-icon></template>
          清空
        </n-button>
      </div>
    </div>

    <!-- Log List -->
    <div class="log-list">
      <div v-if="loading" class="state-center">
        <n-spin size="medium" />
      </div>
      <div v-else-if="!filteredLogs.length" class="state-center">
        <n-empty :description="t('logViewer.noLogs')" size="small" />
      </div>
      <div v-else class="log-entries">
        <div
          v-for="(log, i) in paginatedLogs"
          :key="i"
          class="log-entry"
          :class="`level-${log.level}`"
        >
          <n-tag size="tiny" :type="getLevelType(log.level)" class="log-tag">
            {{ log.level.toUpperCase() }}
          </n-tag>
          <span class="log-ts">{{ fmtTs(log.timestamp) }}</span>
          <span class="log-src">{{ log.source }}</span>
          <pre class="log-msg">{{ log.message }}</pre>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="log-pagination">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-slot="5"
        show-quick-jumper
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NSelect, NTag, NEmpty, NSpin, NPagination, NSpace, useMessage, useDialog } from 'naive-ui'
import { RefreshOutline, DownloadOutline, TrashOutline, SearchOutline } from '@vicons/ionicons5'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const logs = ref<any[]>([])
const levelFilter = ref<string[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 50

const levelOptions = [
  { label: 'ERROR', value: 'error' },
  { label: 'WARN', value: 'warn' },
  { label: 'INFO', value: 'info' },
  { label: 'DEBUG', value: 'debug' }
]

const filteredLogs = computed(() => {
  let r = [...logs.value]
  if (levelFilter.value.length) r = r.filter(l => levelFilter.value.includes(l.level))
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    r = r.filter(l => l.message.toLowerCase().includes(kw) || l.source.toLowerCase().includes(kw))
  }
  return r
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize))
const paginatedLogs = computed(() => {
  const s = (currentPage.value - 1) * pageSize
  return filteredLogs.value.slice(s, s + pageSize)
})

const getLevelType = (lv: string): 'error' | 'warning' | 'info' | 'default' =>
  ({ error: 'error', warn: 'warning', warning: 'warning', info: 'info', debug: 'default' } as any)[lv] || 'default'

const fmtTs = (ts: string) => {
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const loadLogs = () => {
  loading.value = true
  const levels = ['error', 'warn', 'info', 'debug']
  const sources = ['Database', 'Connection', 'Query', 'API', 'System']
  const msgs = [
    'Connection established', 'Query executed in 45ms', 'Failed to connect: timeout',
    'Auth successful', 'Cache cleared', 'Config loaded', 'Export done',
    'Memory 256MB', 'Session expired', 'Index created'
  ]
  const now = Date.now()
  logs.value = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    timestamp: new Date(now - Math.random() * 7 * 86400000).toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    message: msgs[Math.floor(Math.random() * msgs.length)]
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  loading.value = false
}

const handleRefresh = () => { loadLogs(); message.success('已刷新') }

const handleExport = () => {
  const content = filteredLogs.value.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type: 'text/plain' })),
    download: `unidb-logs-${new Date().toISOString().split('T')[0]}.log`
  })
  a.click()
  message.success('已导出')
}

const handleClear = () => {
  dialog.warning({
    title: '清空日志', content: '确定清空所有日志记录吗？',
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: () => { logs.value = []; message.success('已清空') }
  })
}

onMounted(loadLogs)
</script>

<style scoped>
.logs-panel { display: flex; flex-direction: column; gap: 12px; }

.logs-toolbar {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  padding: 10px 0; border-bottom: 1px solid var(--border-secondary);
}
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.log-count { font-size: 12px; color: var(--text-quaternary); }

.log-list { max-height: 500px; overflow-y: auto; border-radius: 8px; }
.log-list::-webkit-scrollbar { width: 4px; }
.log-list::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 2px; }

.state-center { display: flex; align-items: center; justify-content: center; height: 200px; }

.log-entries { display: flex; flex-direction: column; gap: 4px; }

.log-entry {
  display: grid; grid-template-columns: 52px 110px 80px 1fr;
  align-items: baseline; gap: 10px; padding: 8px 10px;
  background: var(--bg-row-hover); border-radius: 6px;
  border-left: 3px solid transparent; font-size: 12px;
  transition: background 0.1s;
}
.log-entry:hover { background: var(--bg-hover); }
.log-entry.level-error { border-left-color: var(--status-error); background: rgba(208,48,80,0.05); }
.log-entry.level-warn { border-left-color: var(--status-warning); }
.log-entry.level-info { border-left-color: var(--status-info); }
.log-entry.level-debug { border-left-color: var(--border-primary); }

.log-tag { flex-shrink: 0; }
.log-ts { font-family: monospace; font-size: 11px; color: var(--text-tertiary); white-space: nowrap; }
.log-src { font-size: 11px; color: var(--text-quaternary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-msg { margin: 0; font-family: inherit; font-size: 12px; color: var(--text-secondary); white-space: pre-wrap; word-break: break-word; }

.log-pagination { display: flex; justify-content: center; padding-top: 8px; }
</style>
