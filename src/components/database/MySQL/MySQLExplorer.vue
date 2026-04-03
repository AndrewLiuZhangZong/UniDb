<template>
  <div class="mysql-explorer" :class="{ 'light-mode': !isDarkTheme }">
    <!-- Toolbar -->
    <div class="explorer-toolbar">
      <n-input v-model:value="searchText" size="tiny" placeholder="搜索..." clearable class="search-input">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="loadAll" :loading="loading">
        <template #icon><n-icon><RefreshOutline /></n-icon></template>
      </n-button>
    </div>

    <!-- Database selector -->
    <div v-if="databases.length" class="db-selector">
      <n-select
        v-model:value="activeDb"
        :options="databases.map(d => ({ label: d, value: d }))"
        size="tiny"
        placeholder="选择数据库"
        @update:value="onDbChange"
      />
    </div>

    <div v-if="error" class="error-msg">
      <n-icon><WarningOutline /></n-icon>
      {{ error }}
    </div>

    <div class="tree-body">
      <!-- Tables -->
      <div class="section">
        <div class="section-hd" @click="toggle('tables')">
          <n-icon class="arrow" :class="{ open: exp.tables }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon tbl-c"><GridOutline /></n-icon>
          <span class="sec-label">{{ t('explorer.tables') }}</span>
          <span class="badge">{{ filteredTables.length }}</span>
          <n-button text size="tiny" class="sec-action" @click.stop="openCreateTable" title="新建表">
            <template #icon><n-icon><AddOutline /></n-icon></template>
          </n-button>
        </div>
        <div v-if="exp.tables" class="sec-body">
          <div v-if="tablesLoading" class="loading-hint">加载中...</div>
          <div v-else-if="!filteredTables.length" class="empty">{{ t('explorer.noTables') }}</div>
          <div
            v-for="tbl in filteredTables" :key="tbl.name"
            class="tree-item"
            :class="{ active: sel?.name === tbl.name && selType === 'table' }"
            @click="select(tbl, 'table')"
            @contextmenu.prevent="openCtx($event, tbl, 'table')"
          >
            <n-icon class="item-icon tbl-c"><GridOutline /></n-icon>
            <span class="item-name">{{ tbl.name }}</span>
            <span class="item-meta">{{ tbl.engine }}</span>
          </div>
        </div>
      </div>

      <!-- Views -->
      <div class="section">
        <div class="section-hd" @click="toggle('views')">
          <n-icon class="arrow" :class="{ open: exp.views }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon view-c"><EyeOutline /></n-icon>
          <span class="sec-label">{{ t('explorer.views') }}</span>
          <span class="badge">{{ filteredViews.length }}</span>
        </div>
        <div v-if="exp.views" class="sec-body">
          <div v-if="!filteredViews.length" class="empty">{{ t('explorer.noViews') }}</div>
          <div
            v-for="v in filteredViews" :key="v.name"
            class="tree-item"
            :class="{ active: sel?.name === v.name && selType === 'view' }"
            @click="select(v, 'view')"
          >
            <n-icon class="item-icon view-c"><EyeOutline /></n-icon>
            <span class="item-name">{{ v.name }}</span>
          </div>
        </div>
      </div>

      <!-- SQL Query shortcut -->
      <div class="section">
        <div class="section-hd" @click="select({ db: activeDb }, 'query')">
          <n-icon class="arrow invisible"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon query-c"><TerminalOutline /></n-icon>
          <span class="sec-label">{{ t('explorer.sqlQuery') }}</span>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <n-dropdown
      trigger="manual"
      :show="ctx.show"
      :x="ctx.x"
      :y="ctx.y"
      :options="ctxOptions"
      @select="handleCtx"
      @clickoutside="ctx.show = false"
    />

    <!-- Create Table Modal -->
    <n-modal v-model:show="showCreateTable">
      <n-card title="新建表" style="width:600px" :bordered="false" size="small">
        <template #header-extra>
          <n-button text @click="showCreateTable = false"><template #icon><n-icon><CloseOutline /></n-icon></template></n-button>
        </template>
        <p style="font-size:12px;color:rgba(150,150,150,0.8);margin:0 0 8px">编辑 CREATE TABLE 语句：</p>
        <n-input
          v-model:value="createTableSQL"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 16 }"
          style="font-family:monospace;font-size:12px"
        />
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
          <n-button @click="showCreateTable = false">取消</n-button>
          <n-button type="primary" :loading="createTableSaving" @click="executeCreateTable">执行</n-button>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NDropdown, NSelect, NModal, NCard, useMessage, useDialog } from 'naive-ui'
import {
  RefreshOutline, ChevronForwardOutline, GridOutline, EyeOutline,
  AddOutline, SearchOutline, TerminalOutline, WarningOutline, CloseOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { mysqlMeta } from '../../../api/meta'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{ connection: any }>()
const emit = defineEmits<{
  (e: 'select-item', item: any, type: string): void
  (e: 'action', action: string): void
  (e: 'db-change', db: string): void
}>()

const loading = ref(false)
const tablesLoading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const selType = ref('')
const databases = ref<string[]>([])
const activeDb = ref<string>('')
const tables = ref<any[]>([])
const views = ref<any[]>([])
const error = ref('')
const exp = ref({ tables: true, views: false })
const ctx = ref({ show: false, x: 0, y: 0, item: null as any, type: '' })
const showCreateTable = ref(false)
const createTableSQL = ref('')
const createTableSaving = ref(false)

const filteredTables = computed(() =>
  searchText.value ? tables.value.filter(t => t.name.toLowerCase().includes(searchText.value.toLowerCase())) : tables.value
)
const filteredViews = computed(() =>
  searchText.value ? views.value.filter(v => v.name.toLowerCase().includes(searchText.value.toLowerCase())) : views.value
)

const toggle = (k: keyof typeof exp.value) => { exp.value[k] = !exp.value[k] }

const select = (item: any, type: string) => {
  sel.value = item
  selType.value = type
  emit('select-item', { ...item, _db: activeDb.value }, type)
}

const openCtx = (e: MouseEvent, item: any, type: string) => {
  ctx.value = { show: true, x: e.clientX, y: e.clientY, item, type }
}

const ctxOptions = computed(() => [
  { label: '查看数据', key: 'browse' },
  { label: '表结构', key: 'schema' },
  { label: 'SQL 查询', key: 'query' },
  { type: 'divider', key: 'd1' },
  { label: '清空表数据', key: 'truncate' },
  { label: '删除表', key: 'drop' }
])

const handleCtx = (key: string) => {
  ctx.value.show = false
  if (key === 'browse') select(ctx.value.item, 'table')
  else if (key === 'query') select(ctx.value.item, 'query')
  else if (key === 'schema') select(ctx.value.item, 'schema')
  else if (key === 'drop') dropTable(ctx.value.item)
  else if (key === 'truncate') truncateTable(ctx.value.item)
}

const dropTable = (tbl: any) => {
  dialog.warning({
    title: '删除表', content: `确定删除表 "${tbl.name}"？所有数据将永久丢失！`,
    positiveText: '确定删除', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const db = activeDb.value
        const sql = db ? `DROP TABLE \`${db}\`.\`${tbl.name}\`` : `DROP TABLE \`${tbl.name}\``
        const res = await mysqlMeta.execute(props.connection.id, sql)
        if ((res as any).error) throw new Error((res as any).error)
        tables.value = tables.value.filter(t => t.name !== tbl.name)
        message.success(`已删除表 ${tbl.name}`)
      } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

const truncateTable = (tbl: any) => {
  dialog.warning({
    title: '清空表数据', content: `确定清空表 "${tbl.name}" 的所有数据？此操作不可撤销！`,
    positiveText: '确定清空', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const db = activeDb.value
        const sql = db ? `TRUNCATE TABLE \`${db}\`.\`${tbl.name}\`` : `TRUNCATE TABLE \`${tbl.name}\``
        const res = await mysqlMeta.execute(props.connection.id, sql)
        if ((res as any).error) throw new Error((res as any).error)
        message.success(`已清空表 ${tbl.name}`)
      } catch (e: any) { message.error('操作失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

const openCreateTable = () => {
  const db = activeDb.value ? `\`${activeDb.value}\`.` : ''
  createTableSQL.value = `CREATE TABLE ${db}\`new_table\` (\n  \`id\` INT NOT NULL AUTO_INCREMENT,\n  \`name\` VARCHAR(255) NOT NULL,\n  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (\`id\`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
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
    loadTablesAndViews()
  } catch (e: any) { message.error('创建失败: ' + (e?.response?.data?.error || e.message)) }
  finally { createTableSaving.value = false }
}

const loadDatabases = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await mysqlMeta.databases(props.connection.id)
    databases.value = res.databases.filter(d => !['information_schema', 'performance_schema', 'sys'].includes(d))
    if (!activeDb.value && databases.value.length) {
      activeDb.value = props.connection.config?.database || databases.value[0]
    }
    await loadTablesAndViews()
  } catch (e: any) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const loadTablesAndViews = async () => {
  if (!props.connection?.id) return
  tablesLoading.value = true
  try {
    const [tRes, vRes] = await Promise.all([
      mysqlMeta.tables(props.connection.id, activeDb.value || undefined),
      mysqlMeta.views(props.connection.id, activeDb.value || undefined)
    ])
    tables.value = tRes.tables
    views.value = vRes.views
  } catch (e: any) {
    error.value = e.message || '加载表失败'
  } finally {
    tablesLoading.value = false
  }
}

const loadAll = () => loadDatabases()

const onDbChange = () => {
  sel.value = null
  tables.value = []
  views.value = []
  emit('db-change', activeDb.value)
  loadTablesAndViews()
}

watch(() => props.connection?.id, () => {
  sel.value = null
  databases.value = []
  tables.value = []
  views.value = []
  activeDb.value = props.connection?.config?.database || ''
  loadDatabases()
}, { immediate: true })
</script>

<style scoped>
.mysql-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }

.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.search-input { flex: 1; }

.db-selector { padding: 5px 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05); }

.error-msg { display: flex; align-items: center; gap: 5px; padding: 6px 10px; font-size: 11px; color: #ef4444; background: rgba(239,68,68,0.08); }

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
.tbl-c { color: #4db8ff; }
.view-c { color: #a78bfa; }
.query-c { color: #FF6B00; }

.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }

.badge { font-size: 10px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px; }

.sec-action { opacity: 0; transition: opacity 0.1s; }
.section-hd:hover .sec-action { opacity: 1; }
.sec-body { padding-left: 18px; }

.tree-item { display: flex; align-items: center; gap: 6px; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; }
.tree-item:hover { background: rgba(77,184,255,0.1); }
.tree-item.active { background: rgba(77,184,255,0.18); }

.item-icon { font-size: 12px; flex-shrink: 0; }
.item-name { flex: 1; color: rgba(255,255,255,0.82); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta { font-size: 10px; color: rgba(255,255,255,0.28); font-family: monospace; flex-shrink: 0; }

.loading-hint { padding: 6px 10px; color: rgba(255,255,255,0.3); font-size: 11px; }
.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
</style>
