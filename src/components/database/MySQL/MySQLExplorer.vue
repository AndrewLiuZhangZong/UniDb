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
      placement="bottom-start"
      :show="ctx.show"
      :x="ctx.x"
      :y="ctx.y"
      :options="ctxOptions"
      :dropdown-props="{ scrollable: true }"
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

    <!-- Rename table -->
    <n-modal v-model:show="renameModal.show">
      <n-card :title="t('mysqlTable.renameTitle')" style="width:420px" :bordered="false" size="small">
        <template #header-extra>
          <n-button text @click="renameModal.show = false">
            <template #icon><n-icon><CloseOutline /></n-icon></template>
          </n-button>
        </template>
        <p style="font-size:12px;color:var(--text-tertiary);margin:0 0 8px">{{ renameModal.oldName }} →</p>
        <n-input v-model:value="renameModal.newName" :placeholder="t('mysqlTable.renamePlaceholder')" />
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
          <n-button @click="renameModal.show = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="renameModal.saving" @click="confirmRename">{{ t('common.confirm') }}</n-button>
        </div>
      </n-card>
    </n-modal>

    <!-- Copy table -->
    <n-modal v-model:show="copyModal.show">
      <n-card :title="t('mysqlTable.copyTableTitle')" style="width:420px" :bordered="false" size="small">
        <template #header-extra>
          <n-button text @click="copyModal.show = false">
            <template #icon><n-icon><CloseOutline /></n-icon></template>
          </n-button>
        </template>
        <p style="font-size:12px;color:var(--text-tertiary);margin:0 0 8px">
          {{ copyModal.sourceName }} · {{ copyModal.mode === 'full' ? t('mysqlTable.ctx.copyStructureData') : t('mysqlTable.ctx.copyStructureOnly') }}
        </p>
        <n-input v-model:value="copyModal.newName" :placeholder="t('mysqlTable.copyTablePlaceholder')" />
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
          <n-button @click="copyModal.show = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="copyModal.saving" @click="confirmCopyTable">{{ t('common.confirm') }}</n-button>
        </div>
      </n-card>
    </n-modal>

    <!-- Dump SQL -->
    <n-modal v-model:show="dumpModal.show">
      <n-card :title="dumpModal.table ? `${t('mysqlTable.dumpSqlTitle')}: \`${dumpModal.db}\`.\`${dumpModal.table}\`` : t('mysqlTable.dumpSqlTitle')" style="width:720px;max-width:92vw" :bordered="false" size="small">
        <template #header-extra>
          <n-button text @click="dumpModal.show = false">
            <template #icon><n-icon><CloseOutline /></n-icon></template>
          </n-button>
        </template>
        <n-spin v-if="dumpModal.loading" style="min-height:120px;display:flex;align-items:center;justify-content:center" />
        <template v-else>
          <n-input v-model:value="dumpModal.sql" type="textarea" :autosize="{ minRows: 14, maxRows: 28 }" style="font-family:monospace;font-size:11px" readonly />
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
            <n-button @click="copyDumpToClipboard">{{ t('menu.copy') }}</n-button>
            <n-button type="primary" @click="dumpModal.show = false">{{ t('common.close') }}</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NDropdown, NModal, NCard, NSpin, useMessage, useDialog } from 'naive-ui'
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

const renameModal = reactive({
  show: false,
  db: '',
  oldName: '',
  newName: '',
  saving: false
})

const copyModal = reactive({
  show: false,
  db: '',
  sourceName: '',
  newName: '',
  mode: 'structure' as 'structure' | 'full',
  saving: false
})

const dumpModal = reactive({
  show: false,
  sql: '',
  loading: false,
  db: '',
  table: ''
})

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
  { label: t('mysqlTable.ctx.openTable'), key: 'open-table' },
  { label: t('mysqlTable.ctx.designTable'), key: 'design-table' },
  { label: t('explorer.sqlQuery'), key: 'sql-tab' },
  { label: t('mysqlTable.ctx.newTable'), key: 'new-table' },
  { type: 'divider', key: 'd1' },
  { label: t('mysqlTable.ctx.emptyTable'), key: 'empty-table' },
  { label: t('mysqlTable.ctx.truncateTable'), key: 'truncate-table' },
  { label: t('mysqlTable.ctx.deleteTable'), key: 'delete-table' },
  { type: 'divider', key: 'd2' },
  {
    label: t('mysqlTable.ctx.copyTable'),
    key: 'copy-table',
    children: [
      { label: t('mysqlTable.ctx.copyStructureOnly'), key: 'copy-structure' },
      { label: t('mysqlTable.ctx.copyStructureData'), key: 'copy-full' }
    ]
  },
  {
    label: t('mysqlTable.ctx.dumpSql'),
    key: 'dump-sql',
    children: [
      { label: t('mysqlTable.ctx.dumpStructure'), key: 'dump-structure' },
      { label: t('mysqlTable.ctx.dumpStructureData'), key: 'dump-structure-data' }
    ]
  },
  { type: 'divider', key: 'd3' },
  { label: t('mysqlTable.ctx.copy'), key: 'copy-name' },
  { label: t('mysqlTable.ctx.rename'), key: 'rename-table' },
  { type: 'divider', key: 'd4' },
  { label: t('mysqlTable.ctx.refresh'), key: 'refresh-tree' }
])

const openCtx = (e: MouseEvent, db: string, tbl: any, type: string) => {
  ctx.value = { show: true, x: e.clientX, y: e.clientY, db, item: tbl, type }
}

function assertSafeIdent(name: string) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    message.error(t('mysqlTable.invalidName'))
    return false
  }
  return true
}

function rowsFromExec(res: any): any[] {
  const d = res?.data
  return Array.isArray(d) ? d : (d?.rows || [])
}

async function runSql(sql: string, database: string) {
  const res = await mysqlMeta.execute(props.connection.id, sql, database)
  if ((res as any).error) throw new Error((res as any).error)
  return res
}

function sqlLiteral(v: any): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'boolean') return v ? '1' : '0'
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function openWorkspaceTab(tab: string) {
  window.dispatchEvent(new CustomEvent('mysql-workspace-tab', { detail: { tab } }))
}

const handleCtx = async (key: string) => {
  ctx.value.show = false
  const { db, item } = ctx.value
  const tbl = item
  if (!db || !tbl?.name) return

  try {
    if (key === 'open-table') {
      selectItem(db, tbl, 'table')
    } else if (key === 'design-table') {
      selectItem(db, tbl, 'table')
      await nextTick()
      openWorkspaceTab('schema')
    } else if (key === 'sql-tab') {
      selectItem(db, tbl, 'table')
      await nextTick()
      openWorkspaceTab('sql')
    } else if (key === 'new-table') {
      openCreateTable(db)
    } else if (key === 'empty-table') {
      emptyTable(db, tbl)
    } else if (key === 'truncate-table') {
      truncateTable(db, tbl)
    } else if (key === 'delete-table') {
      dropTable(db, tbl)
    } else if (key === 'copy-structure') {
      copyModal.db = db
      copyModal.sourceName = tbl.name
      copyModal.newName = `${tbl.name}_copy`
      copyModal.mode = 'structure'
      copyModal.show = true
    } else if (key === 'copy-full') {
      copyModal.db = db
      copyModal.sourceName = tbl.name
      copyModal.newName = `${tbl.name}_copy`
      copyModal.mode = 'full'
      copyModal.show = true
    } else if (key === 'dump-structure') {
      doDump(db, tbl.name, false)
    } else if (key === 'dump-structure-data') {
      doDump(db, tbl.name, true)
    } else if (key === 'copy-name') {
      try {
        await navigator.clipboard.writeText(tbl.name)
        message.success(t('mysqlTable.copiedName'))
      } catch {
        message.error(t('mysqlTable.copyNameFailed'))
      }
    } else if (key === 'rename-table') {
      renameModal.db = db
      renameModal.oldName = tbl.name
      renameModal.newName = tbl.name
      renameModal.show = true
    } else if (key === 'refresh-tree') {
      await loadTablesAndViews(db)
      message.success(t('explorer.refreshing'))
    }
  } catch (e: any) {
    message.error((e?.response?.data?.error || e.message) as string)
  }
}

async function doDump(database: string, table: string, withData: boolean) {
  dumpModal.show = true
  dumpModal.db = database
  dumpModal.table = table
  dumpModal.loading = true
  dumpModal.sql = ''
  try {
    const fq = `\`${database}\`.\`${table}\``
    const cr = await runSql(`SHOW CREATE TABLE ${fq}`, database)
    const rows = rowsFromExec(cr)
    const row0 = rows[0] || {}
    const create =
      row0['Create Table'] ?? row0.CREATE_TABLE ?? (row0 && Object.values(row0)[0])
    let out = `-- Dump: ${fq}  [${withData ? 'FULL' : 'STRUCTURE'}]\n${create};\n\n`
    if (withData) {
      const dr = await runSql(`SELECT * FROM ${fq} LIMIT 3000`, database)
      const dataRows = rowsFromExec(dr)
      if (dataRows.length) {
        const cols = Object.keys(dataRows[0])
        const colList = cols.map(c => `\`${c}\``).join(', ')
        const values = dataRows.map(
          r => `(${cols.map(c => sqlLiteral((r as any)[c])).join(', ')})`
        )
        out += `-- Data (max 3000 rows)\nINSERT INTO ${fq} (${colList}) VALUES\n${values.join(',\n')};\n`
      }
    }
    dumpModal.sql = out
  } catch (e: any) {
    dumpModal.sql = `-- Error: ${e?.message || e}`
  } finally {
    dumpModal.loading = false
  }
}

function copyDumpToClipboard() {
  if (!dumpModal.sql) return
  navigator.clipboard.writeText(dumpModal.sql).then(
    () => message.success(t('mysqlTable.copiedName')),
    () => message.error(t('mysqlTable.copyNameFailed'))
  )
}

function emptyTable(db: string, tbl: any) {
  dialog.warning({
    title: t('mysqlTable.confirmEmpty'),
    content: t('mysqlTable.confirmEmptyMsg', { name: tbl.name }),
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await runSql(`DELETE FROM \`${db}\`.\`${tbl.name}\``, db)
        message.success(t('mysqlTable.emptyOk'))
      } catch (e: any) {
        message.error(e?.message || String(e))
      }
    }
  })
}

async function confirmRename() {
  const { db, oldName, newName } = renameModal
  if (!assertSafeIdent(newName) || newName === oldName) return
  renameModal.saving = true
  try {
    await runSql(`RENAME TABLE \`${db}\`.\`${oldName}\` TO \`${db}\`.\`${newName}\``, db)
    renameModal.show = false
    message.success(t('mysqlTable.renameOk'))
    await loadTablesAndViews(db)
    selectItem(db, { name: newName, engine: '', rows: null, comment: '' }, 'table')
  } catch (e: any) {
    message.error(e?.message || String(e))
  } finally {
    renameModal.saving = false
  }
}

async function confirmCopyTable() {
  const { db, sourceName, newName, mode } = copyModal
  if (!assertSafeIdent(newName) || newName === sourceName) return
  copyModal.saving = true
  try {
    await runSql(`CREATE TABLE \`${db}\`.\`${newName}\` LIKE \`${db}\`.\`${sourceName}\``, db)
    if (mode === 'full') {
      await runSql(
        `INSERT INTO \`${db}\`.\`${newName}\` SELECT * FROM \`${db}\`.\`${sourceName}\``,
        db
      )
    }
    copyModal.show = false
    message.success(t('mysqlTable.copyOk'))
    await loadTablesAndViews(db)
    selectItem(db, { name: newName, engine: '', rows: null, comment: '' }, 'table')
  } catch (e: any) {
    message.error(e?.message || String(e))
  } finally {
    copyModal.saving = false
  }
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
