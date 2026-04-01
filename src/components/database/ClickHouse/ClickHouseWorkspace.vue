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
          <n-data-table v-if="resultData.length" :columns="resultCols" :data="resultData"
            size="small" :max-height="220" striped />
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
          <n-input v-model:value="filterText" size="small" placeholder="过滤..." clearable style="width:200px">
            <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
          </n-input>
          <div class="spacer" />
          <n-button size="small" @click="loadTableData">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>
            刷新
          </n-button>
          <n-button size="small">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            导出
          </n-button>
        </div>
        <n-data-table :columns="browseColumns" :data="browseRows" :loading="browseLoading"
          size="small" :max-height="'calc(100vh - 280px)'" striped />
        <div class="pagination-bar">
          <span class="pg-info">MergeTree · {{ selectedItem?.name }}</span>
          <div class="spacer" />
          <n-text depth="3" style="font-size:11px;">ORDER BY {{ selectedItem?.orderBy }}</n-text>
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
            <n-data-table v-if="resultData.length" :columns="resultCols" :data="resultData"
              size="small" :max-height="180" striped />
            <div v-else class="result-empty"><n-empty description="执行查询后显示结果" size="small" /></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon, NInput, NDataTable, NTag, NText, NEmpty, useMessage } from 'naive-ui'
import {
  PlayCircleOutline, GridOutline, ListOutline, CodeSlashOutline,
  SearchOutline, RefreshOutline, DownloadOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

const { t } = useI18n()
const message = useMessage()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  connection: any
  selectedItem: any
  selectedItemType: string
}>()

const activeTab = ref('browse')
const tabs = [
  { key: 'browse', label: '数据浏览', icon: GridOutline },
  { key: 'schema', label: '表结构', icon: ListOutline },
  { key: 'sql', label: 'SQL 查询', icon: CodeSlashOutline }
]

const sql = ref('SELECT * FROM events LIMIT 100;')
const running = ref(false)
const resultData = ref<any[]>([])
const resultCols = ref<any[]>([])
const resultTime = ref(0)
const filterText = ref('')
const browseLoading = ref(false)
const browseRows = ref<any[]>([])
const browseColumns = ref<any[]>([])

const runQuery = async () => {
  if (!sql.value.trim()) return
  running.value = true
  await new Promise(r => setTimeout(r, 350))
  resultCols.value = [
    { title: 'event_type', key: 'event_type', width: 140 },
    { title: 'timestamp', key: 'timestamp', width: 160 },
    { title: 'user_id', key: 'user_id', width: 100 }
  ]
  resultData.value = Array.from({ length: 10 }, (_, i) => ({
    event_type: ['click','view','purchase'][i % 3],
    timestamp: `2024-0${(i % 9) + 1}-01 10:${String(i * 5).padStart(2,'0')}:00`,
    user_id: 1000 + i
  }))
  resultTime.value = Math.floor(Math.random() * 50) + 5
  running.value = false
}

const formatSql = () => { message.info('格式化 SQL') }

const loadTableData = async () => {
  if (!props.selectedItem) return
  browseLoading.value = true
  await new Promise(r => setTimeout(r, 300))
  const cols = props.selectedItem.columns || []
  browseColumns.value = cols.map((c: any) => ({
    title: c.name, key: c.name, width: c.name.length < 10 ? 100 : 160, ellipsis: { tooltip: true }
  }))
  browseRows.value = Array.from({ length: 15 }, (_, i) => {
    const row: any = {}
    cols.forEach((c: any) => {
      if (c.type.includes('UInt')) row[c.name] = 1000 + i
      else if (c.type.includes('String')) row[c.name] = `value_${i}`
      else if (c.type.includes('Date')) row[c.name] = `2024-0${(i % 9) + 1}-01`
      else if (c.type.includes('Float')) row[c.name] = (Math.random() * 100).toFixed(2)
      else row[c.name] = `data_${i}`
    })
    return row
  })
  browseLoading.value = false
}

watch(() => props.selectedItem, () => {
  activeTab.value = 'browse'
  if (props.selectedItem) {
    sql.value = `SELECT * FROM \`${props.selectedItem.name}\` LIMIT 100;`
    loadTableData()
  }
}, { immediate: true })
</script>

<style scoped>
.ch-workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #13131a; color: rgba(255,255,255,0.85); }
.ch-workspace.light-mode { background: #f5f5f8; color: rgba(0,0,0,0.85); }

.tab-bar { display: flex; align-items: center; height: 38px; flex-shrink: 0; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 12px; gap: 2px; }
.ch-workspace.light-mode .tab-bar { background: rgba(0,0,0,0.04); border-bottom-color: rgba(0,0,0,0.07); }
.tab-btn { display: flex; align-items: center; gap: 5px; padding: 0 12px; height: 100%; font-size: 12px; cursor: pointer; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.5); transition: all 0.15s; }
.tab-btn:hover { color: rgba(255,255,255,0.85); }
.tab-btn.active { color: #fb923c; border-bottom-color: #fb923c; }
.ch-workspace.light-mode .tab-btn { color: rgba(0,0,0,0.5); }
.ch-workspace.light-mode .tab-btn.active { color: #c2410c; border-bottom-color: #c2410c; }
.tab-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

.sql-editor-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.sql-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.ch-workspace.light-mode .sql-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.spacer { flex: 1; }
.sql-area-wrap { flex: 1; overflow: hidden; min-height: 140px; }
.sql-textarea { width: 100%; height: 100%; padding: 12px 14px; resize: none; outline: none; background: #1a1a24; color: #e0e0e0; font-family: 'SF Mono','Monaco','Consolas',monospace; font-size: 13px; line-height: 1.6; border: none; box-sizing: border-box; }
.ch-workspace.light-mode .sql-textarea { background: #fff; color: #1a1a1a; }

.sql-results { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06); }
.result-bar { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 34px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); }
.result-label { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.5); }
.result-meta { font-size: 11px; color: rgba(255,255,255,0.3); }
.result-empty { display: flex; align-items: center; justify-content: center; height: 80px; }

.browse-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.ch-workspace.light-mode .browse-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.pagination-bar { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-top: 1px solid rgba(255,255,255,0.06); height: 36px; flex-shrink: 0; font-size: 12px; }
.pg-info { color: rgba(255,255,255,0.4); }
.ch-workspace.light-mode .pg-info { color: rgba(0,0,0,0.4); }

.schema-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.ch-workspace.light-mode .schema-header { border-bottom-color: rgba(0,0,0,0.06); }
.schema-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.ch-workspace.light-mode .schema-title { color: rgba(0,0,0,0.8); }
.schema-info { padding: 8px 14px; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.ch-workspace.light-mode .schema-info { border-bottom-color: rgba(0,0,0,0.06); }
.info-row { display: flex; align-items: center; gap: 10px; font-size: 12px; }
.info-key { color: rgba(255,255,255,0.4); min-width: 100px; }
.ch-workspace.light-mode .info-key { color: rgba(0,0,0,0.4); }
.info-row code { font-family: monospace; font-size: 12px; color: #fb923c; background: rgba(251,146,60,0.1); padding: 1px 6px; border-radius: 3px; }

.col-table { flex: 1; overflow-y: auto; padding: 4px 8px; }
.col-header, .col-row { display: grid; grid-template-columns: 200px 1fr 100px; align-items: center; gap: 4px; padding: 6px 8px; border-radius: 4px; }
.col-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.ch-workspace.light-mode .col-header { color: rgba(0,0,0,0.3); }
.col-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
.col-row:hover { background: rgba(255,255,255,0.03); }
.col-name-code { font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.85); }
.ch-workspace.light-mode .col-name-code { color: rgba(0,0,0,0.85); }
.type-badge { font-size: 11px; color: #fb923c; background: rgba(251,146,60,0.1); padding: 1px 6px; border-radius: 3px; font-family: monospace; }
.type-badge.lc { color: #a78bfa; background: rgba(167,139,250,0.1); }
.sort-tag { color: #18a058; font-weight: 700; }
</style>
