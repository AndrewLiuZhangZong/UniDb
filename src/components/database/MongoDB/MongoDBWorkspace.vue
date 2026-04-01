<template>
  <div class="mongo-workspace" :class="{ 'light-mode': !isDarkTheme }">
    <template v-if="!selectedItem || selectedItemType === 'query'">
      <!-- JS / MQL query editor -->
      <div class="query-editor-wrap">
        <div class="q-toolbar">
          <n-select v-model:value="queryCollection" :options="collectionOptions" size="small"
            placeholder="选择 Collection" style="width:180px" />
          <n-button size="small" type="primary" :loading="running" @click="runQuery">
            <template #icon><n-icon><PlayCircleOutline /></n-icon></template>
            执行
          </n-button>
          <div class="spacer" />
          <n-tag size="small" type="info">MongoDB</n-tag>
        </div>
        <div class="q-area-wrap">
          <textarea v-model="queryText" class="q-textarea" spellcheck="false"
            placeholder="// find with filter&#10;db.users.find({ role: 'admin' }).limit(20)" />
        </div>
        <div class="q-results">
          <div class="result-bar">
            <div class="view-toggle">
              <span :class="['view-btn', viewMode==='table' && 'active']" @click="viewMode='table'">
                <n-icon :size="12"><GridOutline /></n-icon> 表格
              </span>
              <span :class="['view-btn', viewMode==='json' && 'active']" @click="viewMode='json'">
                <n-icon :size="12"><DocumentOutline /></n-icon> JSON
              </span>
            </div>
            <span v-if="resultDocs.length" class="result-meta">{{ resultDocs.length }} 文档 · {{ resultTime }}ms</span>
          </div>
          <div v-if="viewMode === 'table'" class="doc-table-wrap">
            <n-data-table v-if="resultDocs.length" :columns="resultCols" :data="resultDocs"
              size="small" :max-height="200" striped />
            <div v-else class="result-empty"><n-empty description="执行查询后显示结果" size="small" /></div>
          </div>
          <div v-else class="json-view-wrap">
            <pre v-if="resultDocs.length" class="json-pre">{{ JSON.stringify(resultDocs.slice(0, 3), null, 2) }}</pre>
            <div v-else class="result-empty"><n-empty description="执行查询后显示结果" size="small" /></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Collection selected -->
    <template v-else-if="selectedItemType === 'collection' || selectedItemType === 'aggregate' || selectedItemType === 'indexes'">
      <div class="tab-bar">
        <div v-for="tab in tabs" :key="tab.key"
          class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key">
          <n-icon :size="13"><component :is="tab.icon" /></n-icon>
          {{ tab.label }}
        </div>
      </div>

      <!-- Browse documents -->
      <div v-if="activeTab === 'browse'" class="tab-content">
        <div class="browse-toolbar">
          <n-input v-model:value="filterQuery" size="small" placeholder='{ "role": "admin" }' style="flex:1;font-family:monospace;font-size:12px">
            <template #prefix><span style="color:rgba(255,255,255,0.3);font-size:11px;margin-right:4px">filter:</span></template>
          </n-input>
          <n-button size="small" type="primary" :loading="browseLoading" @click="loadDocs">
            <template #icon><n-icon><SearchOutline /></n-icon></template>查询
          </n-button>
          <n-button size="small">
            <template #icon><n-icon><AddOutline /></n-icon></template>插入文档
          </n-button>
          <div class="spacer" />
          <div class="view-toggle-sm">
            <span :class="['vt', viewMode==='table' && 'active']" @click="viewMode='table'">表格</span>
            <span :class="['vt', viewMode==='json' && 'active']" @click="viewMode='json'">JSON</span>
          </div>
        </div>

        <div v-if="viewMode === 'table'" class="browse-table">
          <n-data-table :columns="docCols" :data="docs" :loading="browseLoading"
            size="small" :max-height="'calc(100vh - 340px)'" striped />
        </div>
        <div v-else class="json-scroll">
          <div v-for="(doc, i) in docs" :key="i" class="json-doc">
            <div class="json-doc-actions">
              <n-button text size="tiny" @click="message.info('编辑文档')">
                <template #icon><n-icon><CreateOutline /></n-icon></template>
              </n-button>
              <n-button text size="tiny" @click="message.warning('删除文档')">
                <template #icon><n-icon><TrashOutline /></n-icon></template>
              </n-button>
            </div>
            <pre class="json-pre-sm">{{ JSON.stringify(doc, null, 2) }}</pre>
          </div>
        </div>

        <div class="pagination-bar">
          <span class="pg-info">{{ selectedItem?.name }} · {{ selectedItem?.count?.toLocaleString() }} 文档</span>
          <div class="spacer" />
          <n-button text size="tiny" @click="prevPage"><template #icon><n-icon><ChevronBackOutline /></n-icon></template></n-button>
          <span class="pg-num">第 {{ page }} 页</span>
          <n-button text size="tiny" @click="nextPage"><template #icon><n-icon><ChevronForwardOutline /></n-icon></template></n-button>
        </div>
      </div>

      <!-- Aggregate -->
      <div v-else-if="activeTab === 'aggregate'" class="tab-content">
        <div class="agg-toolbar">
          <n-button size="small" type="primary" :loading="running" @click="runAgg">
            <template #icon><n-icon><PlayCircleOutline /></n-icon></template>执行聚合
          </n-button>
          <n-button size="small" @click="aggPipeline = samplePipeline">示例</n-button>
        </div>
        <div class="agg-area">
          <textarea v-model="aggPipeline" class="q-textarea" spellcheck="false"
            placeholder="// Aggregation Pipeline&#10;[&#10;  { $match: { status: 'active' } },&#10;  { $group: { _id: '$role', count: { $sum: 1 } } }&#10;]" />
        </div>
        <div class="q-results">
          <div class="result-bar">
            <span class="result-label"><n-icon :size="13"><GridOutline /></n-icon> 聚合结果</span>
          </div>
          <n-data-table v-if="aggResult.length" :columns="aggCols" :data="aggResult"
            size="small" :max-height="200" striped />
          <div v-else class="result-empty"><n-empty description="执行聚合管道后显示结果" size="small" /></div>
        </div>
      </div>

      <!-- Schema -->
      <div v-else-if="activeTab === 'schema'" class="tab-content">
        <div class="schema-header">
          <span class="schema-title">{{ selectedItem?.name }} · 字段结构（采样）</span>
        </div>
        <div class="schema-list">
          <div class="schema-row header">
            <span class="sh name">字段名</span>
            <span class="sh type">类型</span>
            <span class="sh req">必填</span>
          </div>
          <div v-for="f in selectedItem?.schema" :key="f.name" class="schema-row">
            <span class="sh name"><code class="field-name">{{ f.name }}</code></span>
            <span class="sh type"><code class="type-badge" :class="f.type.toLowerCase()">{{ f.type }}</code></span>
            <span class="sh req"><span :class="f.required ? 'req-yes' : 'req-no'">{{ f.required ? '✓' : '—' }}</span></span>
          </div>
        </div>
      </div>

      <!-- Indexes -->
      <div v-else-if="activeTab === 'indexes'" class="tab-content">
        <div class="idx-toolbar">
          <span class="idx-title">{{ selectedItem?.name }} · {{ selectedItem?.indexes?.length }} 个索引</span>
          <div class="spacer" />
          <n-button size="small" type="primary">
            <template #icon><n-icon><AddOutline /></n-icon></template>新建索引
          </n-button>
        </div>
        <div class="idx-list">
          <div class="idx-row header">
            <span class="ih name">索引名</span>
            <span class="ih keys">Key</span>
            <span class="ih unique">UNIQUE</span>
            <span class="ih actions"></span>
          </div>
          <div v-for="idx in selectedItem?.indexes" :key="idx.name" class="idx-row">
            <span class="ih name"><code>{{ idx.name }}</code></span>
            <span class="ih keys"><code class="keys-badge">{{ JSON.stringify(idx.keys) }}</code></span>
            <span class="ih unique"><span :class="idx.unique ? 'req-yes' : ''">{{ idx.unique ? '✓' : '—' }}</span></span>
            <span class="ih actions">
              <n-button v-if="idx.name !== '_id_'" text size="tiny">
                <template #icon><n-icon><TrashOutline /></n-icon></template>
              </n-button>
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NButton, NIcon, NInput, NSelect, NDataTable, NTag, NEmpty, useMessage } from 'naive-ui'
import {
  PlayCircleOutline, GridOutline, DocumentOutline, ListOutline, FilterOutline,
  SearchOutline, AddOutline, CreateOutline, TrashOutline,
  ChevronBackOutline, ChevronForwardOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

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
  { key: 'browse', label: '文档浏览', icon: DocumentOutline },
  { key: 'aggregate', label: '聚合', icon: FilterOutline },
  { key: 'schema', label: '字段结构', icon: ListOutline },
  { key: 'indexes', label: '索引', icon: GridOutline }
]

const viewMode = ref<'table' | 'json'>('table')
const queryCollection = ref<string | null>(null)
const queryText = ref("db.users.find({ role: 'admin' }).limit(20)")
const running = ref(false)
const resultDocs = ref<any[]>([])
const resultCols = ref<any[]>([])
const resultTime = ref(0)

const filterQuery = ref('{}')
const browseLoading = ref(false)
const docs = ref<any[]>([])
const docCols = ref<any[]>([])
const page = ref(1)

const aggPipeline = ref('')
const aggResult = ref<any[]>([])
const aggCols = ref<any[]>([])
const samplePipeline = `[
  { "$match": { "status": "active" } },
  { "$group": { "_id": "$role", "count": { "$sum": 1 } } },
  { "$sort": { "count": -1 } }
]`

const collectionOptions = [
  { label: 'users', value: 'users' },
  { label: 'orders', value: 'orders' },
  { label: 'products', value: 'products' }
]

const runQuery = async () => {
  running.value = true
  await new Promise(r => setTimeout(r, 350))
  resultCols.value = [
    { title: '_id', key: '_id', width: 90 },
    { title: 'username', key: 'username', width: 130 },
    { title: 'email', key: 'email', width: 200 },
    { title: 'role', key: 'role', width: 90 }
  ]
  resultDocs.value = Array.from({ length: 8 }, (_, i) => ({
    _id: `ObjectId("${Math.random().toString(16).slice(2, 26)}")`,
    username: `user_${i + 1}`, email: `user${i + 1}@mail.com`,
    role: i === 0 ? 'admin' : 'user'
  }))
  resultTime.value = Math.floor(Math.random() * 30) + 5
  running.value = false
}

const loadDocs = async () => {
  if (!props.selectedItem) return
  browseLoading.value = true
  await new Promise(r => setTimeout(r, 300))
  const schema = props.selectedItem.schema || []
  docCols.value = schema.map((f: any) => ({
    title: f.name, key: f.name, width: f.name === '_id' ? 80 : 140, ellipsis: { tooltip: true }
  }))
  docs.value = Array.from({ length: 12 }, (_, i) => {
    const doc: any = {}
    schema.forEach((f: any) => {
      if (f.name === '_id') doc[f.name] = `obj_${i}`
      else if (f.type === 'String') doc[f.name] = `${f.name}_${i}`
      else if (f.type === 'Number') doc[f.name] = Math.floor(Math.random() * 100)
      else if (f.type === 'Date') doc[f.name] = `2024-0${(i % 9) + 1}-01`
      else if (f.type === 'Array') doc[f.name] = ['a', 'b']
      else if (f.type === 'Object') doc[f.name] = { key: 'value' }
      else doc[f.name] = null
    })
    return doc
  })
  browseLoading.value = false
}

const runAgg = async () => {
  running.value = true
  await new Promise(r => setTimeout(r, 400))
  aggCols.value = [{ title: '_id', key: '_id', width: 120 }, { title: 'count', key: 'count', width: 100 }]
  aggResult.value = [{ _id: 'admin', count: 3 }, { _id: 'user', count: 47 }, { _id: 'guest', count: 12 }]
  running.value = false
}

const prevPage = () => { if (page.value > 1) { page.value--; loadDocs() } }
const nextPage = () => { page.value++; loadDocs() }

watch(() => props.selectedItem, () => {
  activeTab.value = 'browse'
  if (props.selectedItemType === 'indexes') activeTab.value = 'indexes'
  else if (props.selectedItemType === 'aggregate') activeTab.value = 'aggregate'
  if (props.selectedItem) loadDocs()
}, { immediate: true })
</script>

<style scoped>
.mongo-workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #13131a; color: rgba(255,255,255,0.85); }
.mongo-workspace.light-mode { background: #f5f5f8; color: rgba(0,0,0,0.85); }

.tab-bar { display: flex; align-items: center; height: 38px; flex-shrink: 0; background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 12px; gap: 2px; }
.mongo-workspace.light-mode .tab-bar { background: rgba(0,0,0,0.04); border-bottom-color: rgba(0,0,0,0.07); }
.tab-btn { display: flex; align-items: center; gap: 5px; padding: 0 12px; height: 100%; font-size: 12px; cursor: pointer; border-bottom: 2px solid transparent; color: rgba(255,255,255,0.5); transition: all 0.15s; }
.tab-btn:hover { color: rgba(255,255,255,0.85); }
.tab-btn.active { color: #60a5fa; border-bottom-color: #60a5fa; }
.mongo-workspace.light-mode .tab-btn { color: rgba(0,0,0,0.5); }
.mongo-workspace.light-mode .tab-btn.active { color: #1d6fa4; border-bottom-color: #1d6fa4; }
.tab-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.spacer { flex: 1; }

/* Query editor */
.query-editor-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.q-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mongo-workspace.light-mode .q-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.q-area-wrap { flex: 1; overflow: hidden; min-height: 120px; }
.q-textarea { width: 100%; height: 100%; padding: 12px 14px; resize: none; outline: none; background: #1a1a24; color: #e0e0e0; font-family: 'SF Mono','Monaco','Consolas',monospace; font-size: 12px; line-height: 1.6; border: none; box-sizing: border-box; }
.mongo-workspace.light-mode .q-textarea { background: #fff; color: #1a1a1a; }
.agg-area { flex: 1; overflow: hidden; min-height: 120px; }

.q-results { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06); }
.result-bar { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 34px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.05); }
.result-label { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.5); }
.result-meta { font-size: 11px; color: rgba(255,255,255,0.3); }
.result-empty { display: flex; align-items: center; justify-content: center; height: 80px; }

.view-toggle { display: flex; gap: 2px; }
.view-btn { display: flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; color: rgba(255,255,255,0.4); }
.view-btn.active { color: #60a5fa; background: rgba(96,165,250,0.12); }

/* Browse */
.browse-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mongo-workspace.light-mode .browse-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.view-toggle-sm { display: flex; gap: 2px; flex-shrink: 0; }
.vt { padding: 2px 8px; border-radius: 3px; font-size: 11px; cursor: pointer; color: rgba(255,255,255,0.35); }
.vt.active { color: #60a5fa; background: rgba(96,165,250,0.12); }

.browse-table { flex: 1; overflow: hidden; }
.json-scroll { flex: 1; overflow-y: auto; padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; }
.json-scroll::-webkit-scrollbar { width: 4px; }
.json-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.json-doc { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px; position: relative; }
.mongo-workspace.light-mode .json-doc { background: #fff; border-color: rgba(0,0,0,0.08); }
.json-doc-actions { position: absolute; top: 6px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.1s; }
.json-doc:hover .json-doc-actions { opacity: 1; }
.json-pre { margin: 0; font-family: 'SF Mono',monospace; font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.75); white-space: pre-wrap; }
.mongo-workspace.light-mode .json-pre { color: rgba(0,0,0,0.75); }
.json-pre-sm { margin: 0; font-family: 'SF Mono',monospace; font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.75); white-space: pre-wrap; }
.mongo-workspace.light-mode .json-pre-sm { color: rgba(0,0,0,0.75); }

.agg-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mongo-workspace.light-mode .agg-toolbar { border-bottom-color: rgba(0,0,0,0.06); }

.pagination-bar { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-top: 1px solid rgba(255,255,255,0.06); height: 36px; flex-shrink: 0; }
.mongo-workspace.light-mode .pagination-bar { border-top-color: rgba(0,0,0,0.06); }
.pg-info { font-size: 12px; color: rgba(255,255,255,0.4); }
.mongo-workspace.light-mode .pg-info { color: rgba(0,0,0,0.4); }
.pg-num { font-size: 12px; color: rgba(255,255,255,0.6); padding: 0 4px; }
.mongo-workspace.light-mode .pg-num { color: rgba(0,0,0,0.6); }

/* Schema */
.schema-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mongo-workspace.light-mode .schema-header { border-bottom-color: rgba(0,0,0,0.06); }
.schema-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.mongo-workspace.light-mode .schema-title { color: rgba(0,0,0,0.8); }
.schema-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
.schema-row { display: grid; grid-template-columns: 180px 200px 60px; align-items: center; gap: 4px; padding: 6px 8px; border-radius: 4px; }
.schema-row.header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.mongo-workspace.light-mode .schema-row.header { color: rgba(0,0,0,0.3); }
.schema-row:not(.header) { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
.schema-row:not(.header):hover { background: rgba(255,255,255,0.03); }
.field-name { font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.85); }
.mongo-workspace.light-mode .field-name { color: rgba(0,0,0,0.85); }
.type-badge { font-size: 11px; padding: 1px 6px; border-radius: 3px; font-family: monospace; }
.type-badge.objectid { color: #f59e0b; background: rgba(245,158,11,0.1); }
.type-badge.string { color: #4db8ff; background: rgba(77,184,255,0.1); }
.type-badge.number { color: #18a058; background: rgba(24,160,88,0.1); }
.type-badge.date { color: #a78bfa; background: rgba(167,139,250,0.1); }
.type-badge.array { color: #fb923c; background: rgba(251,146,60,0.1); }
.type-badge.object { color: #60a5fa; background: rgba(96,165,250,0.1); }
.req-yes { color: #18a058; font-weight: 700; }
.req-no { color: rgba(255,255,255,0.2); }
.mongo-workspace.light-mode .req-no { color: rgba(0,0,0,0.2); }

/* Indexes */
.idx-toolbar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mongo-workspace.light-mode .idx-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.idx-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.mongo-workspace.light-mode .idx-title { color: rgba(0,0,0,0.8); }
.idx-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
.idx-row { display: grid; grid-template-columns: 220px 1fr 70px 40px; align-items: center; gap: 4px; padding: 7px 8px; border-radius: 4px; }
.idx-row.header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.mongo-workspace.light-mode .idx-row.header { color: rgba(0,0,0,0.3); }
.idx-row:not(.header) { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; }
.idx-row:not(.header):hover { background: rgba(255,255,255,0.03); }
.idx-row code { font-family: monospace; font-size: 11px; color: rgba(255,255,255,0.7); }
.keys-badge { color: #60a5fa !important; background: rgba(96,165,250,0.1); padding: 1px 6px; border-radius: 3px; }
</style>
