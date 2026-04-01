<template>
  <div class="mongo-explorer" :class="{ 'light-mode': !isDarkTheme }">
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
          <div v-for="db in databases" :key="db.name"
            class="tree-item" :class="{ active: activeDb === db.name }"
            @click="activeDb = db.name; loadCollections(db.name)">
            <n-icon class="item-icon db-c"><ServerOutline /></n-icon>
            <span class="item-name">{{ db.name }}</span>
            <n-tag v-if="activeDb === db.name" size="tiny" type="info" class="active-tag">active</n-tag>
          </div>
        </div>
      </div>

      <!-- Collections -->
      <div class="section">
        <div class="section-hd" @click="toggle('colls')">
          <n-icon class="arrow" :class="{ open: exp.colls }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon coll-c"><LayersOutline /></n-icon>
          <span class="sec-label">Collections</span>
          <span class="badge">{{ filteredColls.length }}</span>
          <n-button text size="tiny" class="sec-action" @click.stop="message.info('新建 Collection')">
            <template #icon><n-icon><AddOutline /></n-icon></template>
          </n-button>
        </div>
        <div v-if="exp.colls" class="sec-body">
          <div v-if="!filteredColls.length" class="empty">没有 Collection</div>
          <div v-for="coll in filteredColls" :key="coll.name"
            class="tree-item" :class="{ active: sel?.name === coll.name }"
            @click="select(coll, 'collection')"
            @contextmenu.prevent="ctxItem = coll; ctxShow = true; ctxX = $event.clientX; ctxY = $event.clientY">
            <n-icon class="item-icon coll-c"><LayersOutline /></n-icon>
            <span class="item-name">{{ coll.name }}</span>
            <span class="item-meta">{{ coll.count.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Query shortcut -->
      <div class="section">
        <div class="section-hd" @click="select(null, 'query')">
          <n-icon class="arrow invisible"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon query-c"><TerminalOutline /></n-icon>
          <span class="sec-label">查询</span>
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
import { NIcon, NButton, NInput, NTag, NDropdown, useMessage } from 'naive-ui'
import { RefreshOutline, ChevronForwardOutline, LayersOutline, ServerOutline, SearchOutline, AddOutline, TerminalOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { mongodbMeta } from '../../../api/meta'

const { t } = useI18n()
const message = useMessage()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const props = defineProps<{ connection: any }>()
const emit = defineEmits<{ (e: 'select-item', item: any, type: string): void }>()

const loading = ref(false)
const searchText = ref('')
const sel = ref<any>(null)
const activeDb = ref('')
const databases = ref<any[]>([])
const collections = ref<any[]>([])
const exp = ref({ dbs: true, colls: true })
const ctxShow = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxItem = ref<any>(null)

const ctxOptions = [
  { label: '查看文档', key: 'browse' },
  { label: '聚合查询', key: 'aggregate' },
  { type: 'divider', key: 'd1' },
  { label: '查看索引', key: 'indexes' },
  { label: '删除 Collection', key: 'drop' }
]

const filteredColls = computed(() =>
  searchText.value ? collections.value.filter(c => c.name.toLowerCase().includes(searchText.value.toLowerCase())) : collections.value
)

const toggle = (k: keyof typeof exp.value) => { exp.value[k] = !exp.value[k] }
const select = (item: any, type: string) => { sel.value = item; emit('select-item', item, type) }
const handleCtx = (key: string) => {
  ctxShow.value = false
  if (key === 'browse') select(ctxItem.value, 'collection')
  else if (key === 'aggregate') select(ctxItem.value, 'aggregate')
  else if (key === 'indexes') select(ctxItem.value, 'indexes')
  else message.info(key)
}

const loadCollections = async (db?: string) => {
  try {
    const res = await mongodbMeta.collections(props.connection.id, db || activeDb.value || props.connection.config?.database)
    collections.value = res.collections
  } catch { /* ignore */ }
}

const loadData = async () => {
  loading.value = true
  try {
    const dbRes = await mongodbMeta.databases(props.connection.id)
    databases.value = dbRes.databases.filter((d: any) => !['admin','local','config'].includes(d.name))
    if (!activeDb.value && databases.value.length) {
      activeDb.value = props.connection.config?.database || databases.value[0]?.name || ''
    }
    await loadCollections()
  } catch {
    // Fall through - use empty state
  } finally {
    loading.value = false
  }
}

const _legacyLoadData = async () => {
  loading.value = true
  databases.value = [{ name: 'mydb' }, { name: 'analytics' }, { name: 'logs' }]
  collections.value = [
    { name: 'users', count: 12540, schema: [
      { name: '_id', type: 'ObjectId', required: true },
      { name: 'username', type: 'String', required: true },
      { name: 'email', type: 'String', required: true },
      { name: 'age', type: 'Number', required: false },
      { name: 'tags', type: 'Array', required: false },
      { name: 'address', type: 'Object', required: false },
      { name: 'createdAt', type: 'Date', required: false }
    ], indexes: [
      { name: '_id_', keys: { _id: 1 }, unique: true },
      { name: 'email_1', keys: { email: 1 }, unique: true },
      { name: 'username_1', keys: { username: 1 }, unique: false }
    ]},
    { name: 'orders', count: 89200, schema: [
      { name: '_id', type: 'ObjectId', required: true },
      { name: 'userId', type: 'ObjectId', required: true },
      { name: 'items', type: 'Array', required: true },
      { name: 'total', type: 'Number', required: true },
      { name: 'status', type: 'String', required: true },
      { name: 'createdAt', type: 'Date', required: false }
    ], indexes: [
      { name: '_id_', keys: { _id: 1 }, unique: true },
      { name: 'userId_1', keys: { userId: 1 }, unique: false },
      { name: 'status_1_createdAt_-1', keys: { status: 1, createdAt: -1 }, unique: false }
    ]},
    { name: 'products', count: 3210, schema: [
      { name: '_id', type: 'ObjectId', required: true },
      { name: 'name', type: 'String', required: true },
      { name: 'price', type: 'Number', required: true },
      { name: 'category', type: 'String', required: false },
      { name: 'specs', type: 'Object', required: false }
    ], indexes: [
      { name: '_id_', keys: { _id: 1 }, unique: true },
      { name: 'name_text', keys: { name: 'text' }, unique: false }
    ]}
  ]
  loading.value = false
}

watch(() => props.connection?.id, () => {
  sel.value = null
  databases.value = []
  collections.value = []
  activeDb.value = props.connection?.config?.database || ''
  loadData()
}, { immediate: true })
</script>

<style scoped>
.mongo-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }
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
.db-c { color: #34d399; }
.coll-c { color: #60a5fa; }
.query-c { color: #18a058; }
.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }
.light-mode .sec-label { color: rgba(0,0,0,0.65); }
.badge { font-size: 10px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px; }
.light-mode .badge { color: rgba(0,0,0,0.35); background: rgba(0,0,0,0.06); }
.sec-action { opacity: 0; transition: opacity 0.1s; }
.section-hd:hover .sec-action { opacity: 1; }
.sec-body { padding-left: 18px; }
.tree-item { display: flex; align-items: center; gap: 6px; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; }
.tree-item:hover { background: rgba(96,165,250,0.1); }
.tree-item.active { background: rgba(96,165,250,0.18); }
.light-mode .tree-item:hover { background: rgba(96,165,250,0.08); }
.light-mode .tree-item.active { background: rgba(96,165,250,0.15); }
.item-icon { font-size: 12px; flex-shrink: 0; }
.item-name { flex: 1; color: rgba(255,255,255,0.82); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.light-mode .item-name { color: rgba(0,0,0,0.82); }
.item-meta { font-size: 10px; color: rgba(255,255,255,0.28); font-family: monospace; flex-shrink: 0; }
.light-mode .item-meta { color: rgba(0,0,0,0.28); }
.active-tag { flex-shrink: 0; }
.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
.light-mode .empty { color: rgba(0,0,0,0.25); }
</style>
