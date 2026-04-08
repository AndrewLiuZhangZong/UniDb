<template>
  <div class="log-viewer-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <n-button text @click="goBack" class="back-btn">
          <template #icon>
            <n-icon><ArrowBackOutline /></n-icon>
          </template>
        </n-button>
        <h1 class="page-title">{{ t('logViewer.title') }}</h1>
        <p class="page-subtitle">{{ t('logViewer.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <n-button-group size="small">
          <n-button @click="handleRefresh">
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            {{ t('common.refresh') }}
          </n-button>
          <n-button @click="handleExport">
            <template #icon>
              <n-icon><DownloadOutline /></n-icon>
            </template>
            {{ t('logViewer.export') }}
          </n-button>
          <n-button @click="handleClear">
            <template #icon>
              <n-icon><TrashOutline /></n-icon>
            </template>
            {{ t('logViewer.clear') }}
          </n-button>
        </n-button-group>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <n-space>
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          clearable
          size="small"
          :placeholder="t('logViewer.selectDateRange')"
          @update:value="handleDateRangeChange"
        />
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
          style="width: 240px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>
      </n-space>
      <div class="filter-stats">
        <n-text depth="3" style="font-size: 12px;">
          {{ t('logViewer.totalLogs') }}: {{ filteredLogs.length }} | {{ t('logViewer.retention') }}: {{ retentionDays }} {{ t('logViewer.days') }}
        </n-text>
      </div>
    </div>

    <!-- Log List -->
    <div class="log-list" ref="logListRef">
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
        <p>{{ t('logViewer.loading') }}</p>
      </div>

      <div v-else-if="filteredLogs.length === 0" class="empty-state">
        <n-empty :description="t('logViewer.noLogs')">
          <template #extra>
            <n-button size="small" @click="handleRefresh">
              {{ t('common.refresh') }}
            </n-button>
          </template>
        </n-empty>
      </div>

      <div v-else class="log-entries">
        <div
          v-for="(log, index) in paginatedLogs"
          :key="index"
          class="log-entry"
          :class="`level-${log.level}`"
        >
          <div class="log-level">
            <n-tag size="tiny" :type="getLevelTagType(log.level)">
              {{ log.level.toUpperCase() }}
            </n-tag>
          </div>
          <div class="log-timestamp">
            {{ formatTimestamp(log.timestamp) }}
          </div>
          <div class="log-source">
            <n-text depth="3" style="font-size: 11px;">{{ log.source }}</n-text>
          </div>
          <div class="log-message" :class="{ 'has-error': log.level === 'error' }">
            <pre>{{ log.message }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredLogs.length > pageSize" class="pagination-bar">
      <nPagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-slot="5"
        show-quick-jumper
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  NButton,
  NButtonGroup,
  NIcon,
  NDatePicker,
  NSelect,
  NInput,
  NSpace,
  NTag,
  NText,
  NEmpty,
  NSpin,
  NPagination,
  useMessage,
  useDialog
} from 'naive-ui'
import {
  ArrowBackOutline,
  RefreshOutline,
  DownloadOutline,
  TrashOutline,
  SearchOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()


// State
const loading = ref(false)
const logs = ref<any[]>([])
const dateRange = ref<[number, number] | null>(null)
const levelFilter = ref<string[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(50)
const retentionDays = ref(30)

// Options
const levelOptions = [
  { label: 'ERROR', value: 'error' },
  { label: 'WARN', value: 'warn' },
  { label: 'INFO', value: 'info' },
  { label: 'DEBUG', value: 'debug' }
]

// Computed
const filteredLogs = computed(() => {
  let result = [...logs.value]

  if (dateRange.value) {
    const [start, end] = dateRange.value
    result = result.filter(log => {
      const logTime = new Date(log.timestamp).getTime()
      return logTime >= start && logTime <= end + 86400000
    })
  }

  if (levelFilter.value.length > 0) {
    result = result.filter(log => levelFilter.value.includes(log.level))
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(log =>
      log.message.toLowerCase().includes(keyword) ||
      log.source.toLowerCase().includes(keyword)
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize.value))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// Methods
const goBack = () => {
  router.push('/')
}

const getLevelTagType = (level: string): 'error' | 'warning' | 'info' | 'default' => {
  const types: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
    error: 'error',
    warn: 'warning',
    warning: 'warning',
    info: 'info',
    debug: 'default'
  }
  return types[level] || 'default'
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleDateRangeChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  const logList = document.querySelector('.log-list')
  logList?.scrollTo({ top: 0, behavior: 'smooth' })
}

const loadLogs = async () => {
  loading.value = true
  try {
    const sampleLogs = generateSampleLogs()
    logs.value = sampleLogs
  } catch (error) {
    message.error(t('logViewer.loadError'))
  } finally {
    loading.value = false
  }
}

const generateSampleLogs = () => {
  const levels = ['error', 'warn', 'info', 'debug']
  const sources = ['Database', 'Connection', 'Query', 'API', 'UI', 'System']
  const messages = [
    'Connection established successfully',
    'Query executed in 125ms',
    'Failed to connect: timeout',
    'User authentication successful',
    'Cache cleared',
    'Configuration loaded',
    'Export completed',
    'Backup created',
    'Memory usage: 256MB',
    'Session expired'
  ]

  const sampleLogs = []
  const now = Date.now()

  for (let i = 0; i < 100; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]
    const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

    sampleLogs.push({
      id: i,
      timestamp,
      level,
      source,
      message
    })
  }

  return sampleLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const handleRefresh = () => {
  loadLogs()
  message.success(t('logViewer.refreshed'))
}

const handleExport = () => {
  const content = filteredLogs.value
    .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
    .join('\n')

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `unidb-logs-${new Date().toISOString().split('T')[0]}.log`
  a.click()
  URL.revokeObjectURL(url)

  message.success(t('logViewer.exported'))
}

const handleClear = () => {
  dialog.warning({
    title: t('logViewer.clearConfirm'),
    content: t('logViewer.clearConfirmMessage'),
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        logs.value = []
        message.success(t('logViewer.cleared'))
      } catch {
        message.error(t('logViewer.clearError'))
      }
    }
  })
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.log-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid var(--border-secondary);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.back-btn {
  font-size: 18px;
  margin-bottom: 8px;
  align-self: flex-start;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-disabled);
  margin: 0;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-row-hover);
  border-bottom: 1px solid var(--border-secondary);
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
  color: var(--text-disabled);
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  display: grid;
  grid-template-columns: 70px 160px 100px 1fr;
  gap: 16px;
  align-items: start;
  padding: 12px 16px;
  background: var(--bg-row-hover);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: background-color 0.15s ease;
}

.log-entry:hover {
  background: var(--bg-hover);
}

.log-entry.level-error {
  border-left-color: var(--status-error);
  background: rgba(208, 48, 80, 0.05);
}

.log-entry.level-warn {
  border-left-color: var(--status-warning);
}

.log-entry.level-info {
  border-left-color: var(--status-info);
}

.log-entry.level-debug {
  border-left-color: var(--text-disabled);
}

.log-level {
  display: flex;
  align-items: center;
}

.log-timestamp {
  font-size: 12px;
  color: var(--text-disabled);
  font-family: 'SF Mono', 'Monaco', monospace;
}

.log-source {
  font-size: 11px;
}

.log-message {
  font-size: 13px;
  color: var(--text-secondary);
}

.log-message pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}

.log-message.has-error {
  color: var(--status-error);
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid var(--border-secondary);
}
</style>
