<template>
  <div class="mysql-explorer" :class="{ 'light-mode': !isDarkTheme }">
    <!-- Toolbar -->
    <div class="explorer-toolbar">
      <n-input v-model:value="searchText" size="tiny" placeholder="搜索..." clearable class="search-input">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="loadData" :loading="loading">
        <template #icon><n-icon><RefreshOutline /></n-icon></template>
      </n-button>
    </div>

    <div class="tree-body">
      <!-- Tables -->
      <div class="section">
        <div class="section-hd" @click="toggle('tables')">
          <n-icon class="arrow" :class="{ open: exp.tables }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon tbl-c"><GridOutline /></n-icon>
          <span class="sec-label">{{ t('explorer.tables') }}</span>
          <span class="badge">{{ filteredTables.length }}</span>
          <n-button text size="tiny" class="sec-action" @click.stop="$emit('action', 'createTable')" title="新建表">
            <template #icon><n-icon><AddOutline /></n-icon></template>
          </n-button>
        </div>
        <div v-if="exp.tables" class="sec-body">
          <div v-if="!filteredTables.length" class="empty">{{ t('explorer.noTables') }}</div>
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

      <!-- Functions -->
      <div class="section">
        <div class="section-hd" @click="toggle('funcs')">
          <n-icon class="arrow" :class="{ open: exp.funcs }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon func-c"><CodeSlashOutline /></n-icon>
          <span class="sec-label">{{ t('explorer.functions') }}</span>
          <span class="badge">{{ functions.length }}</span>
        </div>
        <div v-if="exp.funcs" class="sec-body">
          <div v-if="!functions.length" class="empty">{{ t('explorer.noFunctions') }}</div>
          <div v-for="fn in functions" :key="fn.name" class="tree-item" @click="select(fn, 'function')">
            <n-icon class="item-icon func-c"><CodeSlashOutline /></n-icon>
            <span class="item-name">{{ fn.name }}</span>
            <span class="item-meta">{{ fn.type }}</span>
          </div>
        </div>
      </div>

      <!-- SQL Query (shortcut) -->
      <div class="section">
        <div class="section-hd" @click="select(null, 'query')">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NInput, NDropdown, useMessage } from 'naive-ui'
import {
  RefreshOutline, ChevronForwardOutline, GridOutline, EyeOutline,
  AddOutline, SearchOutline, CodeSlashOutline, TerminalOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

const { t } = useI18n()
const message = useMessage()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{ connection: any }>()
const emit = defineEmits<{
  (e: 'select-item', item: any, type: string): void
  (e: 'action', action: string): void
}>()

const loading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const selType = ref('')
const tables = ref<any[]>([])
const views = ref<any[]>([])
const functions = ref<any[]>([])
const exp = ref({ tables: true, views: false, funcs: false })
const ctx = ref({ show: false, x: 0, y: 0, item: null as any, type: '' })

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
  emit('select-item', item, type)
}

const openCtx = (e: MouseEvent, item: any, type: string) => {
  ctx.value = { show: true, x: e.clientX, y: e.clientY, item, type }
}

const ctxOptions = computed(() => [
  { label: '查看数据', key: 'browse' },
  { label: 'SQL 查询', key: 'query' },
  { label: '表结构', key: 'schema' },
  { type: 'divider', key: 'd1' },
  { label: '重命名', key: 'rename' },
  { label: '删除表', key: 'drop' }
])

const handleCtx = (key: string) => {
  ctx.value.show = false
  if (key === 'browse') select(ctx.value.item, 'table')
  else if (key === 'query') select(ctx.value.item, 'query')
  else if (key === 'schema') select(ctx.value.item, 'schema')
  else message.info(key)
}

const loadData = async () => {
  loading.value = true
  tables.value = [
    { name: 'users', engine: 'InnoDB', rows: 12540, columns: [
      { name: 'id', type: 'INT', notNull: true, isPrimary: true, autoIncrement: true, comment: '主键' },
      { name: 'username', type: 'VARCHAR(50)', notNull: true, isPrimary: false, autoIncrement: false, comment: '用户名' },
      { name: 'email', type: 'VARCHAR(100)', notNull: true, isPrimary: false, autoIncrement: false, comment: '邮箱' },
      { name: 'password_hash', type: 'VARCHAR(255)', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'role', type: "ENUM('admin','user','guest')", notNull: true, isPrimary: false, autoIncrement: false, comment: '角色' },
      { name: 'created_at', type: 'TIMESTAMP', notNull: false, isPrimary: false, autoIncrement: false, comment: '创建时间' }
    ], indexes: [
      { name: 'PRIMARY', type: 'BTREE', unique: true, columns: ['id'] },
      { name: 'uk_username', type: 'BTREE', unique: true, columns: ['username'] },
      { name: 'uk_email', type: 'BTREE', unique: true, columns: ['email'] }
    ]},
    { name: 'orders', engine: 'InnoDB', rows: 89200, columns: [
      { name: 'id', type: 'INT', notNull: true, isPrimary: true, autoIncrement: true, comment: '' },
      { name: 'user_id', type: 'INT', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'total', type: 'DECIMAL(10,2)', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'status', type: "ENUM('pending','paid','shipped','done')", notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'created_at', type: 'TIMESTAMP', notNull: false, isPrimary: false, autoIncrement: false, comment: '' }
    ], indexes: [
      { name: 'PRIMARY', type: 'BTREE', unique: true, columns: ['id'] },
      { name: 'idx_user_id', type: 'BTREE', unique: false, columns: ['user_id'] },
      { name: 'idx_status', type: 'BTREE', unique: false, columns: ['status'] }
    ]},
    { name: 'products', engine: 'InnoDB', rows: 3210, columns: [
      { name: 'id', type: 'INT', notNull: true, isPrimary: true, autoIncrement: true, comment: '' },
      { name: 'name', type: 'VARCHAR(200)', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'price', type: 'DECIMAL(10,2)', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'stock', type: 'INT', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'category_id', type: 'INT', notNull: false, isPrimary: false, autoIncrement: false, comment: '' }
    ], indexes: [
      { name: 'PRIMARY', type: 'BTREE', unique: true, columns: ['id'] },
      { name: 'idx_category', type: 'BTREE', unique: false, columns: ['category_id'] }
    ]},
    { name: 'categories', engine: 'InnoDB', rows: 48, columns: [
      { name: 'id', type: 'INT', notNull: true, isPrimary: true, autoIncrement: true, comment: '' },
      { name: 'name', type: 'VARCHAR(100)', notNull: true, isPrimary: false, autoIncrement: false, comment: '' },
      { name: 'parent_id', type: 'INT', notNull: false, isPrimary: false, autoIncrement: false, comment: '' }
    ], indexes: [{ name: 'PRIMARY', type: 'BTREE', unique: true, columns: ['id'] }]}
  ]
  views.value = [
    { name: 'user_orders_view' },
    { name: 'order_summary' }
  ]
  functions.value = [
    { name: 'get_order_total', type: 'FUNCTION' },
    { name: 'update_stock', type: 'PROCEDURE' }
  ]
  loading.value = false
}

watch(() => props.connection, () => { sel.value = null; loadData() }, { immediate: true })
</script>

<style scoped>
.mysql-explorer {
  display: flex; flex-direction: column; height: 100%; overflow: hidden;
  font-size: 12px;
}

.explorer-toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 8px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.light-mode .explorer-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.search-input { flex: 1; }

.tree-body { flex: 1; overflow-y: auto; padding: 4px 0; }
.tree-body::-webkit-scrollbar { width: 4px; }
.tree-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* Section */
.section { margin-bottom: 1px; }
.section-hd {
  display: flex; align-items: center; gap: 5px; padding: 6px 8px;
  cursor: pointer; transition: background 0.1s;
}
.section-hd:hover { background: rgba(255,255,255,0.04); }
.light-mode .section-hd:hover { background: rgba(0,0,0,0.04); }

.arrow { font-size: 12px; color: rgba(255,255,255,0.3); transition: transform 0.18s; flex-shrink: 0; }
.light-mode .arrow { color: rgba(0,0,0,0.3); }
.arrow.open { transform: rotate(90deg); }
.arrow.invisible { opacity: 0; }

.sec-icon { font-size: 13px; flex-shrink: 0; }
.tbl-c { color: #4db8ff; }
.view-c { color: #a78bfa; }
.func-c { color: #f59e0b; }
.query-c { color: #18a058; }

.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }
.light-mode .sec-label { color: rgba(0,0,0,0.65); }

.badge {
  font-size: 10px; color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px;
}
.light-mode .badge { color: rgba(0,0,0,0.35); background: rgba(0,0,0,0.06); }

.sec-action { opacity: 0; transition: opacity 0.1s; }
.section-hd:hover .sec-action { opacity: 1; }

.sec-body { padding-left: 18px; }

/* Items */
.tree-item {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; cursor: pointer; border-radius: 4px;
  margin: 1px 4px; transition: background 0.1s;
}
.tree-item:hover { background: rgba(77,184,255,0.1); }
.tree-item.active { background: rgba(77,184,255,0.18); }
.light-mode .tree-item:hover { background: rgba(77,184,255,0.08); }
.light-mode .tree-item.active { background: rgba(77,184,255,0.15); }

.item-icon { font-size: 12px; flex-shrink: 0; }
.item-name { flex: 1; color: rgba(255,255,255,0.82); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.light-mode .item-name { color: rgba(0,0,0,0.82); }
.item-meta { font-size: 10px; color: rgba(255,255,255,0.28); font-family: monospace; flex-shrink: 0; }
.light-mode .item-meta { color: rgba(0,0,0,0.28); }

.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
.light-mode .empty { color: rgba(0,0,0,0.25); }
</style>
