<template>
  <div class="mysql-explorer">
    <!-- Search bar -->
    <div class="explorer-toolbar">
      <n-input v-model:value="searchText" size="tiny" placeholder="搜索表/视图..." clearable class="search-input">
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

    <!-- Loading hint -->
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
          <n-button text size="tiny" class="row-action" @click.stop="openCreateTable(db)" :title="t('toolbar.createTable')">
            <template #icon><n-icon><AddOutline /></n-icon></template>
          </n-button>
        </div>

        <!-- Expanded: Tables / Views / Indexes / SQL -->
        <div v-if="exp[db]" class="db-children">

          <!-- Tables -->
          <div class="section-node">
            <div class="tree-row sec-row" @click="toggleSec(db, 'tables')">
              <n-icon class="row-arrow" :class="{ open: secExp[db]?.tables }">
                <ChevronForwardOutline />
              </n-icon>
              <n-icon class="row-icon tbl-icon"><GridOutline /></n-icon>
              <span class="row-name sec-label">{{ t('explorer.tables') }}</span>
              <span class="badge">{{ filteredTables(db).length }}</span>
            </div>
            <div v-if="secExp[db]?.tables" class="sec-children">
              <div
                v-for="tbl in filteredTables(db)" :key="tbl.name"
                class="tree-row item-row"
                :class="{ active: sel?._db === db && sel?.name === tbl.name && selType === 'table' }"
                @click="selectItem(db, tbl, 'table')"
                @contextmenu.prevent="openCtx($event, db, tbl, 'table')"
              >
                <n-icon class="row-icon item-icon tbl-icon"><GridOutline /></n-icon>
                <span class="row-name" :title="tbl.name">{{ tbl.name }}</span>
                <span class="item-meta">{{ tbl.engine }}</span>
              </div>
              <div v-if="!filteredTables(db).length" class="empty-row">无表</div>
            </div>
          </div>

          <!-- Views -->
          <div class="section-node">
            <div class="tree-row sec-row" @click="toggleSec(db, 'views')">
              <n-icon class="row-arrow" :class="{ open: secExp[db]?.views }">
                <ChevronForwardOutline />
              </n-icon>
              <n-icon class="row-icon view-icon"><EyeOutline /></n-icon>
              <span class="row-name sec-label">{{ t('explorer.views') }}</span>
              <span class="badge">{{ filteredViews(db).length }}</span>
            </div>
            <div v-if="secExp[db]?.views" class="sec-children">
              <div
                v-for="v in filteredViews(db)" :key="v.name"
                class="tree-row item-row"
                :class="{ active: sel?._db === db && sel?.name === v.name && selType === 'view' }"
                @click="selectItem(db, v, 'view')"
              >
                <n-icon class="row-icon item-icon view-icon"><EyeOutline /></n-icon>
                <span class="row-name" :title="v.name">{{ v.name }}</span>
              </div>
              <div v-if="!filteredViews(db).length" class="empty-row">无视图</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Context menu -->
    <n-dropdown
      trigger="manual"
      :show="ctx.show"
      :x="ctx.x"
      :y="ctx.y"
      :options="ctxOptions"
      @select="handleCtx"
      @clickoutside="ctx.show = false"
    />

    <!-- Create Table modal -->
    <n-modal v-model:show="showCreateTable">
      <n-card title="新建表" style="width:600px" :bordered="false" size="small">
        <template #header-extra>
          <n-button text @click="showCreateTable = false">
            <template #icon><n-icon><CloseOutline /></n-icon></template>
          </n-button>
        </template>
        <p style="font-size:12px;color:var(--text-tertiary);margin:0 0 8px">编辑 CREATE TABLE 语句：</p>
        <n-input v-model:value="createTableSQL" type="textarea" :autosize="{ minRows: 8, maxRows: 16 }" style="font-family:monospace;font-size:12px" />
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
          <n-button @click="showCreateTable = false">取消</n-button>
          <n-button type="primary" :loading="createTableSaving" @click="executeCreateTable">执行</n-button>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NDropdown, NModal, NCard, useMessage, useDialog } from 'naive-ui'
import {
  RefreshOutline, ChevronForwardOutline, GridOutline, EyeOutline,
  AddOutline, SearchOutline, WarningOutline, CloseOutline, ServerOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { mysqlMeta } from '../../../api/meta'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()

const props = defineProps<{ connection: any }>()
const emit = defineEmits<{
  (e: 'select-item', item: any, type: string): void
  (e: 'db-change', db: string): void
}>()

const loading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const selType = ref('')
const databases = ref<string[]>([])
const tables = ref<Record<string, any[]>>({})
const views = ref<Record<string, any[]>>({})
const error = ref('')

// expanded state: exp[db] = boolean, secExp[db] = { tables: bool, views: bool }
const exp = reactive<Record<string, boolean>>({})
const secExp = reactive<Record<string, { tables: boolean; views: boolean }>>({})

// context menu
const ctx = ref({ show: false, x: 0, y: 0, db: '', item: null as any, type: '' })

// create table
const showCreateTable = ref(false)
const createTableSQL = ref('')
const createTableTargetDb = ref('')
const createTableSaving = ref(false)

// ─── Computed ───────────────────────────────────────────────────────────────
const filteredTables = (db: string) => {
  if (!searchText.value) return tables.value[db] || []
  return (tables.value[db] || []).filter(t => t.name.toLowerCase().includes(searchText.value.toLowerCase()))
}
const filteredViews = (db: string) => {
  if (!searchText.value) return views.value[db] || []
  return (views.value[db] || []).filter(v => v.name.toLowerCase().includes(searchText.value.toLowerCase()))
}

// ─── Toggle ─────────────────────────────────────────────────────────────────
const toggleDb = (db: string) => {
  exp[db] = !exp[db]
  if (exp[db] && !secExp[db]) {
    secExp[db] = { tables: true, views: false }
  }
  if (exp[db]) {
    emit('db-change', db)
    loadTablesAndViews(db)
  }
}

const toggleSec = (_db: string, key: 'tables' | 'views') => {
  const db = _db
  if (!secExp[db]) secExp[db] = { tables: false, views: false }
  secExp[db][key] = !secExp[db][key]
}

// ─── Select ─────────────────────────────────────────────────────────────────
const selectItem = (db: string, item: any, type: string) => {
  sel.value = item ? { ...item, _db: db } : { _db: db }
  selType.value = type
  emit('select-item', sel.value, type)
}

// ─── Context menu ────────────────────────────────────────────────────────────
const ctxOptions = computed(() => [
  { label: '查看数据', key: 'browse' },
  { label: '表结构', key: 'schema' },
  { label: 'SQL 查询', key: 'query' },
  { type: 'divider', key: 'd1' },
  { label: '清空表数据', key: 'truncate' },
  { label: '删除表', key: 'drop' }
])

const openCtx = (e: MouseEvent, db: string, tbl: any, type: string) => {
  ctx.value = { show: true, x: e.clientX, y: e.clientY, db, item: tbl, type }
}

const handleCtx = (key: string) => {
  ctx.value.show = false
  const { db, item, type } = ctx.value
  if (key === 'browse') selectItem(db, item, 'table')
  else if (key === 'query') selectItem(db, item, 'query')
  else if (key === 'schema') selectItem(db, item, 'schema')
  else if (key === 'drop') dropTable(db, item)
  else if (key === 'truncate') truncateTable(db, item)
}

const dropTable = (db: string, tbl: any) => {
  dialog.warning({
    title: '删除表', content: `确定删除表 "${tbl.name}"？所有数据将永久丢失！`,
    positiveText: '确定删除', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const sql = db ? `DROP TABLE \`${db}\`.\`${tbl.name}\`` : `DROP TABLE \`${tbl.name}\``
        const res = await mysqlMeta.execute(props.connection.id, sql)
        if ((res as any).error) throw new Error((res as any).error)
        tables.value[db] = (tables.value[db] || []).filter(t => t.name !== tbl.name)
        message.success(`已删除表 ${tbl.name}`)
      } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

const truncateTable = (db: string, tbl: any) => {
  dialog.warning({
    title: '清空表数据', content: `确定清空表 "${tbl.name}" 的所有数据？此操作不可撤销！`,
    positiveText: '确定清空', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const sql = db ? `TRUNCATE TABLE \`${db}\`.\`${tbl.name}\`` : `TRUNCATE TABLE \`${tbl.name}\``
        const res = await mysqlMeta.execute(props.connection.id, sql)
        if ((res as any).error) throw new Error((res as any).error)
        message.success(`已清空表 ${tbl.name}`)
      } catch (e: any) { message.error('操作失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

// ─── Create Table ────────────────────────────────────────────────────────────
const openCreateTable = (db: string) => {
  createTableTargetDb.value = db
  createTableSQL.value = `CREATE TABLE \`${db}\`.\`new_table\` (\n  \`id\` INT NOT NULL AUTO_INCREMENT,\n  \`name\` VARCHAR(255) NOT NULL,\n  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  showCreateTable.value = true
}

const executeCreateTable = async () => {
  if (!createTableSQL.value.trim()) return
  createTableSaving.value = true
  try {
    const res = await mysqlMeta.execute(props.connection.id, createTableSQL.value)
    if ((res as any).error) throw new Error((res as any).error)
    showCreateTable.value = false
    message.success('表创建成功')
    loadTablesAndViews(createTableTargetDb.value)
  } catch (e: any) { message.error('创建失败: ' + (e?.response?.data?.error || e.message)) }
  finally { createTableSaving.value = false }
}

// ─── Data loading ────────────────────────────────────────────────────────────
const loadAll = async () => {
  if (!props.connection?.id) return
  loading.value = true
  error.value = ''
  try {
    const res = await mysqlMeta.databases(props.connection.id)
    databases.value = res.databases.filter((d: string) => !['information_schema', 'performance_schema', 'sys'].includes(d))
    // auto-expand first db
    if (databases.value.length) {
      const firstDb = props.connection.config?.database || databases.value[0]
      if (!exp[firstDb]) {
        exp[firstDb] = true
        secExp[firstDb] = { tables: true, views: false }
        loadTablesAndViews(firstDb)
        emit('db-change', firstDb)
      }
    }
  } catch (e: any) { error.value = e.message || '加载失败' }
  finally { loading.value = false }
}

const loadTablesAndViews = async (db: string) => {
  if (!props.connection?.id) return
  try {
    const [tRes, vRes] = await Promise.all([
      mysqlMeta.tables(props.connection.id, db),
      mysqlMeta.views(props.connection.id, db)
    ])
    tables.value[db] = tRes.tables || []
    views.value[db] = vRes.views || []
  } catch (e: any) { /* silently fail per-db */ }
}

watch(() => props.connection?.id, () => {
  sel.value = null
  databases.value = []
  tables.value = {}
  views.value = {}
  Object.keys(exp).forEach(k => delete exp[k])
  Object.keys(secExp).forEach(k => delete secExp[k])
  loadAll()
}, { immediate: true })
</script>

<style scoped>
.mysql-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }

.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid var(--border-secondary); }
.search-input { flex: 1; }

.error-msg { display: flex; align-items: center; gap: 5px; padding: 6px 10px; font-size: 11px; color: var(--status-error); background: rgba(239,68,68,0.08); }
.loading-hint { padding: 8px 12px; color: var(--text-disabled); font-size: 11px; }

.tree-body { flex: 1; overflow-y: auto; padding: 4px 0; }
.tree-body::-webkit-scrollbar { width: 4px; }
.tree-body::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 2px; }

/* ── Generic tree row ── */
.tree-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 1px 4px;
  transition: background 0.1s;
  user-select: none;
}
.tree-row:hover { background: var(--bg-row-hover); }

/* Database row */
.db-row { padding-left: 6px; }
.db-row.open { background: var(--bg-row-hover); }

/* Section (Tables / Views) row */
.sec-row { padding-left: 16px; }

/* Item (table / view) row */
.item-row { padding-left: 28px; }
.item-row.active { background: var(--type-string-bg); }

/* ── Arrow ── */
.row-arrow { font-size: 10px; color: var(--text-hint); transition: transform 0.18s; flex-shrink: 0; width: 12px; }
.row-arrow.open { transform: rotate(90deg); }
.row-arrow:empty { width: 12px; }

/* ── Icons ── */
.row-icon { font-size: 12px; flex-shrink: 0; }
.db-icon { color: var(--status-warning); }
.tbl-icon { color: var(--type-string); }
.view-icon { color: var(--type-date); }
.query-icon { color: var(--accent-primary); }

/* ── Text ── */
.row-name { flex: 1; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.sec-label { font-weight: 500; color: var(--text-tertiary); font-size: 11.5px; }
.item-meta { font-size: 10px; color: var(--text-disabled); font-family: monospace; flex-shrink: 0; }

/* ── Badge ── */
.badge { font-size: 10px; color: var(--text-disabled); background: var(--bg-active); padding: 0 5px; border-radius: 7px; flex-shrink: 0; }

/* ── Section expand ── */
.db-children { margin-bottom: 4px; }
.sec-children { margin-bottom: 2px; }

.empty-row { padding: 4px 12px 4px 44px; color: var(--type-null); font-size: 11px; font-style: italic; }
.empty { padding: 8px 12px; color: var(--type-null); font-size: 11px; font-style: italic; }

/* ── Row action (add button) ── */
.row-action { opacity: 0; transition: opacity 0.1s; }
.db-row:hover .row-action { opacity: 1; }
</style>
