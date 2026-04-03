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
            @contextmenu.prevent="openCtx($event, tbl)"
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
    <n-dropdown trigger="manual" :show="ctxShow" :x="ctxX" :y="ctxY"
      :options="ctxOptions" @select="handleCtx" @clickoutside="ctxShow = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NTag, NDropdown, useMessage, useDialog } from 'naive-ui'
import { RefreshOutline, ChevronForwardOutline, GridOutline, ServerOutline, SearchOutline, TerminalOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { clickhouseMeta } from '../../../api/meta'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const props = defineProps<{ connection: any }>()
const emit = defineEmits<{ (e: 'select-item', item: any, type: string): void; (e: 'db-change', db: string): void }>()

const loading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const activeDb = ref('default')
const databases = ref<any[]>([])
const tables = ref<any[]>([])
const exp = ref({ dbs: true, tables: true })
const ctxShow = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxItem = ref<any>(null)

const filteredTables = computed(() =>
  searchText.value ? tables.value.filter(t => t.name.toLowerCase().includes(searchText.value.toLowerCase())) : tables.value
)

const toggle = (k: keyof typeof exp.value) => { exp.value[k] = !exp.value[k] }

const ctxOptions = [
  { label: '数据浏览', key: 'browse' },
  { label: '表结构', key: 'schema' },
  { type: 'divider', key: 'd1' },
  { label: '删除表', key: 'drop' }
]
const openCtx = (e: MouseEvent, item: any) => { ctxItem.value = item; ctxShow.value = true; ctxX.value = e.clientX; ctxY.value = e.clientY }
const handleCtx = (key: string) => {
  ctxShow.value = false
  if (key === 'browse') select(ctxItem.value, 'table')
  else if (key === 'schema') select(ctxItem.value, 'schema')
  else if (key === 'drop') dropTable(ctxItem.value)
}
const dropTable = (tbl: any) => {
  dialog.warning({
    title: '删除表', content: `确定删除表 "${tbl.name}"？ClickHouse 此操作不可撤销！`,
    positiveText: '确定删除', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const db = activeDb.value || 'default'
        const res = await clickhouseMeta.execute(props.connection.id, `DROP TABLE \`${db}\`.\`${tbl.name}\``)
        if ((res as any).error) throw new Error((res as any).error)
        tables.value = tables.value.filter(t => t.name !== tbl.name)
        message.success(`已删除表 ${tbl.name}`)
      } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

const selectDb = async (name: string) => {
  activeDb.value = name
  emit('db-change', name)
  tables.value = []
  try {
    const tRes = await clickhouseMeta.tables(props.connection.id, name)
    tables.value = tRes.tables
  } catch { /* ignore */ }
}
const select = async (item: any, type: string) => {
  sel.value = item
  if (type === 'table' && item) await loadTableColumns(item)
  emit('select-item', { ...item, _db: activeDb.value }, type)
}

const loadData = async () => {
  loading.value = true
  try {
    const dbRes = await clickhouseMeta.databases(props.connection.id)
    databases.value = (dbRes.databases || []).filter(d => d !== 'INFORMATION_SCHEMA' && d !== 'information_schema').map((d: string) => ({ name: d }))
    if (!activeDb.value && databases.value.length) {
      activeDb.value = props.connection.config?.database || databases.value[0]?.name || 'default'
    }
    const tRes = await clickhouseMeta.tables(props.connection.id, activeDb.value)
    tables.value = tRes.tables
  } catch {
    // fall through silently - connection may not be live
  } finally {
    loading.value = false
  }
}

const loadTableColumns = async (tbl: any) => {
  if (tbl.columns) return
  try {
    const res = await clickhouseMeta.columns(props.connection.id, tbl.name, activeDb.value)
    tbl.columns = res.columns
  } catch { /* ignore */ }
}

watch(() => props.connection, () => { sel.value = null; loadData() }, { immediate: true })
</script>

<style scoped>
.ch-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }
.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.search-input { flex: 1; }
.tree-body { flex: 1; overflow-y: auto; padding: 4px 0; }
.tree-body::-webkit-scrollbar { width: 4px; }
.tree-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.section { margin-bottom: 1px; }
.section-hd { display: flex; align-items: center; gap: 5px; padding: 6px 8px; cursor: pointer; transition: background 0.1s; }
.section-hd:hover { background: rgba(255,255,255,0.04); }
.arrow { font-size: 12px; color: rgba(255,255,255,0.3); transition: transform 0.18s; flex-shrink: 0; }
.arrow.open { transform: rotate(90deg); }
.arrow.invisible { opacity: 0; }
.sec-icon { font-size: 13px; flex-shrink: 0; }
.db-c { color: #f59e0b; }
.tbl-c { color: #fb923c; }
.query-c { color: #FF6B00; }
.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }
.badge { font-size: 10px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px; }
.sec-body { padding-left: 18px; }
.tree-item { display: flex; align-items: center; gap: 6px; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; }
.tree-item:hover { background: rgba(251,146,60,0.1); }
.tree-item.active { background: rgba(251,146,60,0.18); }
.item-icon { font-size: 12px; flex-shrink: 0; }
.item-name { flex: 1; color: rgba(255,255,255,0.82); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: 10px; color: rgba(255,255,255,0.28); font-family: monospace; flex-shrink: 0; }
.active-tag { flex-shrink: 0; }
.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
</style>
