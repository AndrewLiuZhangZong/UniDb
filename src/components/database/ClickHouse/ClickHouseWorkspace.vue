<template>
  <div class="ch-workspace" :class="{ 'light-mode': !isDarkTheme }">
    <template v-if="!selectedItem || selectedItemType === 'query'">
      <!-- SQL Query Editor -->
      <div class="sql-editor-wrap">
        <div class="sql-toolbar">
          <n-button size="small" type="primary" :loading="running" @click="runQuery">
            <template #icon><n-icon><PlayCircleOutline /></n-icon></template>
            执行
          </n-button>
          <n-button size="small" @click="formatSql">格式化</n-button>
          <div class="spacer" />
          <n-tag size="small" type="warning">ClickHouse</n-tag>
        </div>
        <div class="sql-area-wrap">
          <textarea v-model="sql" class="sql-textarea" spellcheck="false"
            placeholder="-- ClickHouse SQL 查询&#10;SELECT * FROM events LIMIT 100;" />
        </div>
        <div class="sql-results">
          <div class="result-bar">
            <span class="result-label"><n-icon :size="13"><GridOutline /></n-icon> 结果集</span>
            <span v-if="resultData.length" class="result-meta">{{ resultData.length }} 行 · {{ resultTime }}ms</span>
          </div>
          <n-alert v-if="resultError" type="error" :title="resultError" style="margin:8px;font-size:12px" />
          <n-data-table v-else-if="resultData.length" :columns="resultCols" :data="resultData"
            size="small" :max-height="220" striped :scroll-x="resultCols.length * 140" />
          <div v-else class="result-empty">
            <n-empty description="执行查询后显示结果" size="small" />
          </div>
        </div>
      </div>
    </template>

    <!-- Table selected -->
    <template v-else-if="selectedItemType === 'table'">
      <div class="tab-bar">
        <div v-for="tab in tabs" :key="tab.key"
          class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key">
          <n-icon :size="13"><component :is="tab.icon" /></n-icon>
          {{ tab.label }}
        </div>
      </div>

      <!-- Browse -->
      <div v-if="activeTab === 'browse'" class="tab-content">
        <div class="browse-toolbar">
          <span class="browse-info">{{ selectedItem?.name }} · {{ browseRows.length }} 行</span>
          <div class="spacer" />
          <n-button size="small" :loading="browseLoading" @click="loadTableData">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>刷新
          </n-button>
          <n-button size="small" @click="exportCSV">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>导出 CSV
          </n-button>
          <n-tag type="warning" size="small" style="font-size:11px">只读模式 · 不支持 UPDATE/DELETE</n-tag>
        </div>
        <n-alert v-if="browseError" type="error" :title="browseError" style="margin:8px;font-size:12px" />
        <n-data-table :columns="browseColumns" :data="browseRows" :loading="browseLoading"
          size="small" :max-height="'calc(100vh - 285px)'" striped :scroll-x="browseColumns.length * 140" />
        <div class="pagination-bar">
          <span class="pg-info">{{ selectedItem?.engine || 'MergeTree' }} · ORDER BY {{ selectedItem?.orderBy || '—' }}</span>
          <div class="spacer" />
          <n-button text size="tiny" :disabled="browsePage <= 1" @click="browsePage--; loadTableData()">‹</n-button>
          <span :style="{ fontSize:'11px', color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', padding:'0 6px' }">第 {{ browsePage }} 页</span>
          <n-button text size="tiny" :disabled="browseRows.length < 50" @click="browsePage++; loadTableData()">›</n-button>
        </div>
      </div>

      <!-- Schema -->
      <div v-else-if="activeTab === 'schema'" class="tab-content">
        <div class="schema-header">
          <span class="schema-title">{{ selectedItem?.name }} · {{ selectedItem?.columns?.length }} 列</span>
          <div class="spacer" />
          <n-tag size="small" type="warning">{{ selectedItem?.engine }}</n-tag>
        </div>
        <div class="schema-info">
          <div class="info-row"><span class="info-key">ORDER BY</span><code>{{ selectedItem?.orderBy }}</code></div>
          <div v-if="selectedItem?.partitionBy" class="info-row">
            <span class="info-key">PARTITION BY</span><code>{{ selectedItem?.partitionBy }}</code>
          </div>
        </div>
        <div class="col-table">
          <div class="col-header">
            <span class="col-h name">字段名</span>
            <span class="col-h type">类型</span>
            <span class="col-h order">ORDER KEY</span>
          </div>
          <div v-for="col in selectedItem?.columns" :key="col.name" class="col-row">
            <span class="col-h name">
              <code class="col-name-code">{{ col.name }}</code>
            </span>
            <span class="col-h type">
              <code class="type-badge" :class="col.type.includes('LowCardinality') ? 'lc' : ''">{{ col.type }}</code>
            </span>
            <span class="col-h order">
              <span v-if="col.isSortKey" class="sort-tag">✓</span>
            </span>
          </div>
        </div>
      </div>

      <!-- SQL -->
      <div v-else-if="activeTab === 'sql'" class="tab-content">
        <div class="sql-editor-wrap">
          <div class="sql-toolbar">
            <n-button size="small" type="primary" :loading="running" @click="runQuery">
              <template #icon><n-icon><PlayCircleOutline /></n-icon></template>执行
            </n-button>
            <div class="spacer" />
            <n-tag size="small" type="warning">ClickHouse</n-tag>
          </div>
          <div class="sql-area-wrap">
            <textarea v-model="sql" class="sql-textarea" spellcheck="false" />
          </div>
          <div class="sql-results">
            <div class="result-bar">
              <span class="result-label"><n-icon :size="13"><GridOutline /></n-icon> 结果集</span>
              <span v-if="resultData.length" class="result-meta">{{ resultData.length }} 行 · {{ resultTime }}ms</span>
            </div>
            <n-alert v-if="resultError" type="error" :title="resultError" style="margin:8px;font-size:12px" />
            <n-data-table v-else-if="resultData.length" :columns="resultCols" :data="resultData"
              size="small" :max-height="180" striped :scroll-x="resultCols.length * 140" />
            <div v-else class="result-empty"><n-empty description="执行查询后显示结果" size="small" /></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NButton, NIcon, NDataTable, NTag, NEmpty, NAlert, NSpin, useMessage } from 'naive-ui'
import {
  PlayCircleOutline, GridOutline, ListOutline, CodeSlashOutline,
  RefreshOutline, DownloadOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { clickhouseMeta } from '../../../api/meta'
import { format } from 'sql-formatter'

const message = useMessage()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  connection: any
  selectedItem: any
  selectedItemType: string
  activeDb: string
}>()

const activeTab = ref('browse')
const tabs = [
  { key: 'browse', label: '数据浏览', icon: GridOutline },
  { key: 'schema', label: '表结构', icon: ListOutline },
  { key: 'sql', label: 'SQL 查询', icon: CodeSlashOutline }
]

const sql = ref('SELECT 1;')
const running = ref(false)
const resultData = ref<any[]>([])
const resultCols = ref<any[]>([])
const resultTime = ref(0)
const resultError = ref('')
const browseLoading = ref(false)
const browseError = ref('')
const browseRows = ref<any[]>([])
const browseColumns = ref<any[]>([])
const browsePage = ref(1)
const browseTotal = ref(0)

const runQuery = async () => {
  if (!sql.value.trim() || !props.connection?.id) return
  running.value = true
  resultError.value = ''
  resultData.value = []
  resultCols.value = []
  const db = props.activeDb || props.connection?.config?.database || ''
  try {
    const res = await clickhouseMeta.execute(props.connection.id, sql.value, db)
    resultTime.value = res.executionTime || 0
    if (res.error) {
      resultError.value = res.error
      message.error(`执行失败: ${res.error}`)
    } else {
      const rows: any[] = Array.isArray(res.data) ? res.data : (res.data?.rows || [])
      resultData.value = rows
      if (rows.length) {
        resultCols.value = Object.keys(rows[0]).map(k => ({
          title: k, key: k, width: 140, ellipsis: { tooltip: true }
        }))
      }
      message.success(`执行成功，${rows.length} 行，耗时 ${resultTime.value}ms`)
    }
  } catch (e: any) {
    resultError.value = e?.response?.data?.error || e.message || '执行失败'
    message.error(`执行失败: ${resultError.value}`)
  } finally {
    running.value = false
  }
}

const formatSql = () => {
  if (!sql.value.trim()) return
      sql.value = format(sql.value, { language: 'clickhouse', tabWidth: 2 })
}

const loadTableData = async () => {
  if (!props.selectedItem || !props.connection?.id) return
  browseLoading.value = true
  browseError.value = ''
  const db = props.selectedItem._db || props.connection?.config?.database
  const tbl = props.selectedItem.name
  const offset = (browsePage.value - 1) * 50
  const query = db
    ? `SELECT * FROM \`${db}\`.\`${tbl}\` LIMIT 50 OFFSET ${offset}`
    : `SELECT * FROM \`${tbl}\` LIMIT 50 OFFSET ${offset}`
  try {
    const res = await clickhouseMeta.execute(props.connection.id, query)
    const rows: any[] = Array.isArray(res.data) ? res.data : (res.data?.rows || [])
    browseRows.value = rows
    if (rows.length) {
      browseColumns.value = Object.keys(rows[0]).map(k => ({
        title: k, key: k, width: 140, ellipsis: { tooltip: true }
      }))
    } else if (props.selectedItem.columns?.length) {
      browseColumns.value = props.selectedItem.columns.map((c: any) => ({ title: c.name, key: c.name, width: 140 }))
    } else {
      browseColumns.value = []
    }
  } catch (e: any) {
    browseError.value = e?.response?.data?.error || e.message || '加载失败'
    browseColumns.value = []
    message.error(`加载表数据失败: ${browseError.value}`)
  } finally {
    browseLoading.value = false
  }
}

const exportCSV = () => {
  if (!browseRows.value.length) { message.warning('无数据可导出'); return }
  const header = Object.keys(browseRows.value[0]).join(',')
  const body = browseRows.value.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([header + '\n' + body], { type: 'text/csv' })),
    download: `${props.selectedItem?.name || 'data'}.csv`
  })
  a.click()
  message.success('已导出 CSV')
}

watch(() => props.selectedItem, () => {
  activeTab.value = 'browse'
  browsePage.value = 1
  if (props.selectedItem) {
    const db = props.selectedItem._db || props.connection?.config?.database
    sql.value = db
      ? `SELECT * FROM \`${db}\`.\`${props.selectedItem.name}\` LIMIT 100;`
      : `SELECT * FROM \`${props.selectedItem.name}\` LIMIT 100;`
    loadTableData()
  }
}, { immediate: true })
</script>

<style scoped>
.ch-workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #13131a; color: rgba(255,255,255,0.85); }

.tab-bar { display: flex; align-items: center; height: 38px; flex-shrink: 0; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 12px; gap: 2px; }
.tab-btn { display: flex; align-items: center; gap: 5px; padding: 0 12px; height: 100%; font-size: 12px; cursor: pointer; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.5); transition: all 0.15s; }
.tab-btn:hover { color: rgba(255,255,255,0.85); }
.tab-btn.active { color: #fb923c; border-bottom-color: #fb923c; }
.tab-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

.sql-editor-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.sql-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.spacer { flex: 1; }
.sql-area-wrap { flex: 1; overflow: hidden; min-height: 140px; }
.sql-textarea { width: 100%; height: 100%; padding: 12px 14px; resize: none; outline: none; background: #1a1a24; color: #e0e0e0; font-family: 'SF Mono','Monaco','Consolas',monospace; font-size: 13px; line-height: 1.6; border: none; box-sizing: border-box; }

.sql-results { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06); }
.result-bar { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 34px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); }
.result-label { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.5); }
.result-meta { font-size: 11px; color: rgba(255,255,255,0.3); }
.result-empty { display: flex; align-items: center; justify-content: center; height: 80px; }

.browse-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.browse-info { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.6); }
.pagination-bar { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-top: 1px solid rgba(255,255,255,0.06); height: 36px; flex-shrink: 0; font-size: 12px; }
.pg-info { color: rgba(255,255,255,0.4); }

.schema-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.schema-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.schema-info { padding: 8px 14px; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.info-row { display: flex; align-items: center; gap: 10px; font-size: 12px; }
.info-key { color: rgba(255,255,255,0.4); min-width: 100px; }
.info-row code { font-family: monospace; font-size: 12px; color: #fb923c; background: rgba(251,146,60,0.1); padding: 1px 6px; border-radius: 3px; }

.col-table { flex: 1; overflow-y: auto; padding: 4px 8px; }
.col-header, .col-row { display: grid; grid-template-columns: 200px 1fr 100px; align-items: center; gap: 4px; padding: 6px 8px; border-radius: 4px; }
.col-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.col-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
.col-row:hover { background: rgba(255,255,255,0.03); }
.col-name-code { font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.85); }
.type-badge { font-size: 11px; color: #fb923c; background: rgba(251,146,60,0.1); padding: 1px 6px; border-radius: 3px; font-family: monospace; }
.type-badge.lc { color: #a78bfa; background: rgba(167,139,250,0.1); }
.sort-tag { color: #FF6B00; font-weight: 700; }
</style>
