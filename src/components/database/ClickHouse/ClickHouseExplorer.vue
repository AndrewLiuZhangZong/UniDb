<template>
  <div class="ch-explorer" :class="{ 'light-mode': !isDarkTheme }">
    <div class="explorer-toolbar">
      <n-input v-model:value="searchText" size="tiny" placeholder="搜索..." clearable class="search-input">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="loadData" :loading="loading">
        <template #icon><n-icon><RefreshOutline /></n-icon></template>
      </n-button>
    </div>

    <div class="tree-body">
      <!-- Databases -->
      <div class="section">
        <div class="section-hd" @click="toggle('dbs')">
          <n-icon class="arrow" :class="{ open: exp.dbs }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon db-c"><ServerOutline /></n-icon>
          <span class="sec-label">数据库</span>
          <span class="badge">{{ databases.length }}</span>
        </div>
        <div v-if="exp.dbs" class="sec-body">
          <div
            v-for="db in databases" :key="db.name"
            class="tree-item"
            :class="{ active: activeDb === db.name }"
            @click="selectDb(db.name)"
          >
            <n-icon class="item-icon db-c"><ServerOutline /></n-icon>
            <span class="item-name">{{ db.name }}</span>
            <n-tag v-if="activeDb === db.name" size="tiny" type="success" class="active-tag">active</n-tag>
          </div>
        </div>
      </div>

      <!-- Tables -->
      <div class="section">
        <div class="section-hd" @click="toggle('tables')">
          <n-icon class="arrow" :class="{ open: exp.tables }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon tbl-c"><GridOutline /></n-icon>
          <span class="sec-label">{{ t('explorer.tables') }}</span>
          <span class="badge">{{ filteredTables.length }}</span>
        </div>
        <div v-if="exp.tables" class="sec-body">
          <div v-if="!filteredTables.length" class="empty">{{ t('explorer.noTables') }}</div>
          <div
            v-for="tbl in filteredTables" :key="tbl.name"
            class="tree-item"
            :class="{ active: sel?.name === tbl.name }"
            @click="select(tbl, 'table')"
          >
            <n-icon class="item-icon tbl-c"><GridOutline /></n-icon>
            <span class="item-name">{{ tbl.name }}</span>
            <span class="item-meta">{{ tbl.engine }}</span>
          </div>
        </div>
      </div>

      <!-- SQL Query -->
      <div class="section">
        <div class="section-hd" @click="select(null, 'query')">
          <n-icon class="arrow invisible"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon query-c"><TerminalOutline /></n-icon>
          <span class="sec-label">SQL 查询</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NTag } from 'naive-ui'
import { RefreshOutline, ChevronForwardOutline, GridOutline, ServerOutline, SearchOutline, TerminalOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const props = defineProps<{ connection: any }>()
const emit = defineEmits<{ (e: 'select-item', item: any, type: string): void }>()

const loading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const activeDb = ref('default')
const databases = ref<any[]>([])
const tables = ref<any[]>([])
const exp = ref({ dbs: true, tables: true })

const filteredTables = computed(() =>
  searchText.value ? tables.value.filter(t => t.name.toLowerCase().includes(searchText.value.toLowerCase())) : tables.value
)

const toggle = (k: keyof typeof exp.value) => { exp.value[k] = !exp.value[k] }
const selectDb = (name: string) => { activeDb.value = name }
const select = (item: any, type: string) => { sel.value = item; emit('select-item', item, type) }

const loadData = async () => {
  loading.value = true
  databases.value = [{ name: 'default' }, { name: 'system' }, { name: 'analytics' }]
  tables.value = [
    { name: 'events', engine: 'MergeTree', columns: [
      { name: 'id', type: 'UInt64', isSortKey: false },
      { name: 'event_type', type: 'LowCardinality(String)', isSortKey: false },
      { name: 'timestamp', type: 'DateTime', isSortKey: true },
      { name: 'user_id', type: 'UInt32', isSortKey: true },
      { name: 'properties', type: 'JSON', isSortKey: false }
    ], orderBy: 'timestamp, user_id', partitionBy: "toYYYYMM(timestamp)" },
    { name: 'pageviews', engine: 'ReplicatedMergeTree', columns: [
      { name: 'id', type: 'UInt64', isSortKey: false },
      { name: 'url', type: 'String', isSortKey: false },
      { name: 'date', type: 'Date', isSortKey: true },
      { name: 'user_id', type: 'UInt32', isSortKey: false },
      { name: 'referrer', type: 'LowCardinality(String)', isSortKey: false }
    ], orderBy: 'date, url', partitionBy: "toYYYYMM(date)" },
    { name: 'metrics', engine: 'SummingMergeTree', columns: [
      { name: 'metric_name', type: 'LowCardinality(String)', isSortKey: true },
      { name: 'date', type: 'Date', isSortKey: true },
      { name: 'value', type: 'Float64', isSortKey: false }
    ], orderBy: 'metric_name, date', partitionBy: null }
  ]
  loading.value = false
}

watch(() => props.connection, () => { sel.value = null; loadData() }, { immediate: true })
</script>

<style scoped>
.ch-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }
.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.light-mode .explorer-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.search-input { flex: 1; }
.tree-body { flex: 1; overflow-y: auto; padding: 4px 0; }
.tree-body::-webkit-scrollbar { width: 4px; }
.tree-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.section { margin-bottom: 1px; }
.section-hd { display: flex; align-items: center; gap: 5px; padding: 6px 8px; cursor: pointer; transition: background 0.1s; }
.section-hd:hover { background: rgba(255,255,255,0.04); }
.light-mode .section-hd:hover { background: rgba(0,0,0,0.04); }
.arrow { font-size: 12px; color: rgba(255,255,255,0.3); transition: transform 0.18s; flex-shrink: 0; }
.light-mode .arrow { color: rgba(0,0,0,0.3); }
.arrow.open { transform: rotate(90deg); }
.arrow.invisible { opacity: 0; }
.sec-icon { font-size: 13px; flex-shrink: 0; }
.db-c { color: #f59e0b; }
.tbl-c { color: #fb923c; }
.query-c { color: #18a058; }
.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }
.light-mode .sec-label { color: rgba(0,0,0,0.65); }
.badge { font-size: 10px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px; }
.light-mode .badge { color: rgba(0,0,0,0.35); background: rgba(0,0,0,0.06); }
.sec-body { padding-left: 18px; }
.tree-item { display: flex; align-items: center; gap: 6px; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; }
.tree-item:hover { background: rgba(251,146,60,0.1); }
.tree-item.active { background: rgba(251,146,60,0.18); }
.light-mode .tree-item:hover { background: rgba(251,146,60,0.08); }
.light-mode .tree-item.active { background: rgba(251,146,60,0.15); }
.item-icon { font-size: 12px; flex-shrink: 0; }
.item-name { flex: 1; color: rgba(255,255,255,0.82); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.light-mode .item-name { color: rgba(0,0,0,0.82); }
.item-meta { font-size: 10px; color: rgba(255,255,255,0.28); font-family: monospace; flex-shrink: 0; }
.light-mode .item-meta { color: rgba(0,0,0,0.28); }
.active-tag { flex-shrink: 0; }
.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
.light-mode .empty { color: rgba(0,0,0,0.25); }
</style>
