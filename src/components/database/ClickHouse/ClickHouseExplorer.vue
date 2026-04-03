<template>
  <div class="ch-explorer" :class="{ 'light-mode': !isDarkTheme }">
    <!-- Search bar -->
    <div class="explorer-toolbar">
      <n-input v-model:value="searchText" size="tiny" placeholder="搜索表..." clearable class="search-input">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="loadAll" :loading="loading">
        <template #icon><n-icon><RefreshOutline /></n-icon></template>
      </n-button>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">
      <n-icon><WarningOutline /></n-icon>
      {{ error }}
    </div>

    <div v-if="loading && !databases.length" class="loading-hint">加载中...</div>

    <!-- Database tree -->
    <div class="tree-body">
      <div v-if="!loading && !databases.length" class="empty">
        点击刷新加载数据库
      </div>

      <!-- Databases -->
      <div v-for="db in databases" :key="db" class="db-node">

        <!-- Database row -->
        <div class="tree-row db-row" :class="{ open: exp[db] }" @click="toggleDb(db)">
          <n-icon class="row-arrow" :class="{ open: exp[db] }">
            <ChevronForwardOutline />
          </n-icon>
          <n-icon class="row-icon db-icon"><ServerOutline /></n-icon>
          <span class="row-name" :title="db">{{ db }}</span>
        </div>

        <!-- Expanded children -->
        <div v-if="exp[db]" class="db-children">

          <!-- Tables section -->
          <div class="section-node">
            <div class="tree-row sec-row" @click="toggleSec(db, 'tables')">
              <n-icon class="row-arrow" :class="{ open: secExp[db]?.tables }">
                <ChevronForwardOutline />
              </n-icon>
              <n-icon class="row-icon tbl-icon"><GridOutline /></n-icon>
              <span class="row-name sec-label">Tables</span>
              <span class="badge">{{ filteredTables(db).length }}</span>
            </div>
            <div v-if="secExp[db]?.tables" class="sec-children">
              <div
                v-for="tbl in filteredTables(db)" :key="tbl.name"
                class="tree-row item-row"
                :class="{ active: sel?._db === db && sel?.name === tbl.name }"
                @click="selectItem(db, tbl, 'table')"
                @contextmenu.prevent="openCtx($event, db, tbl)"
              >
                <n-icon class="row-icon item-icon tbl-icon"><GridOutline /></n-icon>
                <span class="row-name" :title="tbl.name">{{ tbl.name }}</span>
              </div>
              <div v-if="!filteredTables(db).length" class="empty-row">无表</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <n-dropdown
      trigger="manual"
      :show="ctxShow"
      :x="ctxX"
      :y="ctxY"
      :options="ctxOptions"
      @select="handleCtx"
      @clickoutside="ctxShow = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NDropdown, useMessage, useDialog } from 'naive-ui'
import {
  RefreshOutline, ChevronForwardOutline, GridOutline,
  ServerOutline, SearchOutline, WarningOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { clickhouseMeta } from '../../../api/meta'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{ connection: any }>()
const emit = defineEmits<{
  (e: 'select-item', item: any, type: string): void
  (e: 'db-change', db: string): void
}>()

const loading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const databases = ref<string[]>([])
const tables = ref<Record<string, any[]>>({})
const error = ref('')

// expanded state
const exp = reactive<Record<string, boolean>>({})
const secExp = reactive<Record<string, { tables: boolean }>>({})

// context menu
const ctxShow = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxItem = ref<any>(null)
const ctxDb = ref('')

const filteredTables = (db: string) => {
  if (!searchText.value) return tables.value[db] || []
  return (tables.value[db] || []).filter(t => t.name.toLowerCase().includes(searchText.value.toLowerCase()))
}

const toggleDb = (db: string) => {
  exp[db] = !exp[db]
  if (exp[db] && !secExp[db]) {
    secExp[db] = { tables: true }
    loadTables(db)
  }
  if (exp[db]) emit('db-change', db)
}

const toggleSec = (db: string, _key: string) => {
  if (!secExp[db]) secExp[db] = { tables: false }
  secExp[db].tables = !secExp[db].tables
}

const selectItem = (db: string, item: any, type: string) => {
  sel.value = item ? { ...item, _db: db } : { _db: db }
  emit('select-item', sel.value, type)
}

const openCtx = (e: MouseEvent, db: string, tbl: any) => {
  ctxDb.value = db
  ctxItem.value = tbl
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxShow.value = true
}

const ctxOptions = [
  { label: '数据浏览', key: 'browse' },
  { label: '表结构', key: 'schema' },
  { type: 'divider', key: 'd1' },
  { label: '删除表', key: 'drop' }
]

const handleCtx = (key: string) => {
  ctxShow.value = false
  if (key === 'browse') selectItem(ctxDb.value, ctxItem.value, 'table')
  else if (key === 'schema') selectItem(ctxDb.value, ctxItem.value, 'schema')
  else if (key === 'drop') dropTable(ctxDb.value, ctxItem.value)
}

const dropTable = (db: string, tbl: any) => {
  dialog.warning({
    title: '删除表', content: `确定删除表 "${tbl.name}"？`,
    positiveText: '确定删除', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await clickhouseMeta.execute(props.connection.id, `DROP TABLE \`${db}\`.\`${tbl.name}\``)
        if ((res as any).error) throw new Error((res as any).error)
        tables.value[db] = (tables.value[db] || []).filter(t => t.name !== tbl.name)
        message.success(`已删除表 ${tbl.name}`)
      } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

const loadTables = async (db: string) => {
  if (!props.connection?.id) return
  try {
    const tRes = await clickhouseMeta.tables(props.connection.id, db)
    tables.value[db] = tRes.tables || []
  } catch { /* ignore */ }
}

const loadAll = async () => {
  if (!props.connection?.id) return
  loading.value = true
  error.value = ''
  try {
    const res = await clickhouseMeta.databases(props.connection.id)
    databases.value = res.databases || []
    if (databases.value.length) {
      const first = databases.value[0]
      exp[first] = true
      secExp[first] = { tables: true }
      loadTables(first)
      emit('db-change', first)
    }
  } catch (e: any) { error.value = e.message || '加载失败' }
  finally { loading.value = false }
}

watch(() => props.connection?.id, () => {
  sel.value = null
  databases.value = []
  tables.value = {}
  Object.keys(exp).forEach(k => delete exp[k])
  Object.keys(secExp).forEach(k => delete secExp[k])
  loadAll()
}, { immediate: true })
</script>

<style scoped>
.ch-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }

.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid var(--border-secondary); }
.search-input { flex: 1; }
.error-msg { display: flex; align-items: center; gap: 5px; padding: 6px 10px; font-size: 11px; color: var(--status-error); background: rgba(239,68,68,0.08); }
.loading-hint { padding: 8px 12px; color: var(--text-disabled); font-size: 11px; }

.tree-body { flex: 1; overflow-y: auto; padding: 4px 0; }
.tree-body::-webkit-scrollbar { width: 4px; }
.tree-body::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 2px; }

.tree-row { display: flex; align-items: center; gap: 4px; padding: 5px 8px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; user-select: none; }
.tree-row:hover { background: var(--bg-row-hover); }
.db-row { padding-left: 6px; }
.db-row.open { background: var(--bg-row-hover); }
.sec-row { padding-left: 16px; }
.item-row { padding-left: 28px; }
.item-row.active { background: var(--type-boolean-bg); }

.row-arrow { font-size: 10px; color: var(--text-hint); transition: transform 0.18s; flex-shrink: 0; width: 12px; }
.row-arrow.open { transform: rotate(90deg); }
.row-arrow:empty { width: 12px; }
.row-icon { font-size: 12px; flex-shrink: 0; }
.db-icon { color: var(--status-warning); }
.tbl-icon { color: var(--type-boolean); }
.query-icon { color: var(--accent-primary); }
.row-name { flex: 1; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.sec-label { font-weight: 500; color: var(--text-tertiary); font-size: 11.5px; }
.badge { font-size: 10px; color: var(--text-disabled); background: var(--bg-active); padding: 0 5px; border-radius: 7px; flex-shrink: 0; }

.db-children { margin-bottom: 4px; }
.sec-children { margin-bottom: 2px; }
.empty-row { padding: 4px 12px 4px 44px; color: var(--type-null); font-size: 11px; font-style: italic; }
.empty { padding: 8px 12px; color: var(--type-null); font-size: 11px; font-style: italic; }
</style>
