<template>
  <div class="mongo-explorer">
    <!-- Search bar -->
    <div class="explorer-toolbar">
      <n-input v-model:value="searchText" size="tiny" placeholder="搜索 Collection..." clearable class="search-input">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="loadData" :loading="loading">
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
      <div v-for="db in databases" :key="db.name" class="db-node">

        <!-- Database row -->
        <div class="tree-row db-row" :class="{ open: exp[db.name] }" @click="toggleDb(db.name)">
          <n-icon class="row-arrow" :class="{ open: exp[db.name] }">
            <ChevronForwardOutline />
          </n-icon>
          <n-icon class="row-icon db-icon"><ServerOutline /></n-icon>
          <span class="row-name" :title="db.name">{{ db.name }}</span>
          <n-button text size="tiny" class="row-action" @click.stop="openCreateColl(db.name)" :title="t('toolbar.createCollection')">
            <template #icon><n-icon><AddOutline /></n-icon></template>
          </n-button>
        </div>

        <!-- Expanded children -->
        <div v-if="exp[db.name]" class="db-children">

          <!-- Collections section -->
          <div class="section-node">
            <div class="tree-row sec-row" @click="toggleSec(db.name, 'colls')">
              <n-icon class="row-arrow" :class="{ open: secExp[db.name]?.colls }">
                <ChevronForwardOutline />
              </n-icon>
              <n-icon class="row-icon coll-icon"><LayersOutline /></n-icon>
              <span class="row-name sec-label">Collections</span>
              <span class="badge">{{ filteredColls(db.name).length }}</span>
            </div>
            <div v-if="secExp[db.name]?.colls" class="sec-children">
              <div
                v-for="coll in filteredColls(db.name)" :key="coll.name"
                class="tree-row item-row"
                :class="{ active: sel?._db === db.name && sel?.name === coll.name }"
                @click="selectItem(db.name, coll, 'collection')"
                @contextmenu.prevent="openCtx($event, db.name, coll)"
              >
                <n-icon class="row-icon item-icon coll-icon"><LayersOutline /></n-icon>
                <span class="row-name" :title="coll.name">{{ coll.name }}</span>
                <span class="item-meta">{{ coll.count > 9999 ? '9999+' : coll.count }}</span>
              </div>
              <div v-if="!filteredColls(db.name).length" class="empty-row">无 Collection</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Context menu -->
    <n-dropdown
      trigger="manual"
      :show="ctxShow"
      :x="ctxX"
      :y="ctxY"
      :options="ctxOptions"
      @select="handleCtx"
      @clickoutside="ctxShow = false"
    />

    <!-- Create Collection modal -->
    <n-modal v-model:show="showCreateColl">
      <n-card title="新建 Collection" style="width:360px" :bordered="false" size="small">
        <template #header-extra>
          <n-button text @click="showCreateColl = false">
            <template #icon><n-icon><CloseOutline /></n-icon></template>
          </n-button>
        </template>
        <n-input v-model:value="newCollName" placeholder="Collection 名称" size="small" />
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
          <n-button @click="showCreateColl = false">取消</n-button>
          <n-button type="primary" :loading="createCollSaving" @click="createCollection">创建</n-button>
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
  RefreshOutline, ChevronForwardOutline, LayersOutline, ServerOutline,
  SearchOutline, WarningOutline, CloseOutline, AddOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { mongodbMeta } from '../../../api/meta'

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
const databases = ref<any[]>([])
const collections = ref<Record<string, any[]>>({})
const error = ref('')

// expanded state
const exp = reactive<Record<string, boolean>>({})
const secExp = reactive<Record<string, { colls: boolean }>>({})

// context menu
const ctxShow = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxItem = ref<any>(null)
const ctxDb = ref('')

// create collection
const showCreateColl = ref(false)
const newCollName = ref('')
const createCollTargetDb = ref('')
const createCollSaving = ref(false)

const filteredColls = (db: string) => {
  if (!searchText.value) return collections.value[db] || []
  return (collections.value[db] || []).filter(c => c.name.toLowerCase().includes(searchText.value.toLowerCase()))
}

const toggleDb = (db: string) => {
  exp[db] = !exp[db]
  if (exp[db] && !secExp[db]) {
    secExp[db] = { colls: true }
    loadCollections(db)
  }
  if (exp[db]) emit('db-change', db)
}

const toggleSec = (db: string, _key: string) => {
  if (!secExp[db]) secExp[db] = { colls: false }
  secExp[db].colls = !secExp[db].colls
}

const selectItem = (db: string, item: any, type: string) => {
  sel.value = item ? { ...item, _db: db } : { _db: db }
  emit('select-item', sel.value, type)
}

const openCtx = (e: MouseEvent, db: string, coll: any) => {
  ctxDb.value = db
  ctxItem.value = coll
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxShow.value = true
}

const ctxOptions = [
  { label: '查看文档', key: 'browse' },
  { label: '聚合查询', key: 'aggregate' },
  { type: 'divider', key: 'd1' },
  { label: '查看索引', key: 'indexes' },
  { label: '删除 Collection', key: 'drop' }
]

const handleCtx = (key: string) => {
  ctxShow.value = false
  if (key === 'browse') selectItem(ctxDb.value, ctxItem.value, 'collection')
  else if (key === 'aggregate') selectItem(ctxDb.value, ctxItem.value, 'aggregate')
  else if (key === 'indexes') selectItem(ctxDb.value, ctxItem.value, 'indexes')
  else if (key === 'drop') dropCollection(ctxDb.value, ctxItem.value)
}

const dropCollection = (db: string, coll: any) => {
  dialog.warning({
    title: '删除 Collection', content: `确定删除 "${coll.name}"？所有文档将永久丢失！`,
    positiveText: '确定删除', negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const cmd = `dropCollection:${db}.${coll.name}:`
        const res = await mongodbMeta.execute(props.connection.id, cmd)
        if ((res as any).error) throw new Error((res as any).error)
        collections.value[db] = (collections.value[db] || []).filter(c => c.name !== coll.name)
        message.success(`已删除 ${coll.name}`)
      } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
    }
  })
}

const loadCollections = async (db: string) => {
  if (!props.connection?.id) return
  try {
    const res = await mongodbMeta.collections(props.connection.id, db)
    collections.value[db] = res.collections || []
  } catch { /* ignore */ }
}

const loadData = async () => {
  if (!props.connection?.id) return
  loading.value = true
  error.value = ''
  try {
    const dbRes = await mongodbMeta.databases(props.connection.id)
    databases.value = (dbRes.databases || []).filter((d: any) => !['admin', 'local', 'config'].includes(d.name))
    if (databases.value.length) {
      const first = props.connection.config?.database || databases.value[0]?.name
      if (first && !exp[first]) {
        exp[first] = true
        secExp[first] = { colls: true }
        loadCollections(first)
        emit('db-change', first)
      }
    }
  } catch (e: any) { error.value = e.message || '加载失败' }
  finally { loading.value = false }
}

const openCreateColl = (db: string) => {
  createCollTargetDb.value = db
  newCollName.value = ''
  showCreateColl.value = true
}

const createCollection = async () => {
  if (!newCollName.value.trim()) { message.warning('请输入 Collection 名称'); return }
  createCollSaving.value = true
  try {
    const cmd = `createCollection:${createCollTargetDb.value}.${newCollName.value}:`
    const res = await mongodbMeta.execute(props.connection.id, cmd)
    if ((res as any).error) throw new Error((res as any).error)
    showCreateColl.value = false
    message.success(`Collection "${newCollName.value}" 已创建`)
    loadCollections(createCollTargetDb.value)
  } catch (e: any) { message.error('创建失败: ' + (e?.response?.data?.error || e.message)) }
  finally { createCollSaving.value = false }
}

watch(() => props.connection?.id, () => {
  sel.value = null
  databases.value = []
  collections.value = {}
  Object.keys(exp).forEach(k => delete exp[k])
  Object.keys(secExp).forEach(k => delete secExp[k])
  loadData()
}, { immediate: true })
</script>

<style scoped>
.mongo-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }

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
.item-row.active { background: var(--type-object-bg); }

.row-arrow { font-size: 10px; color: var(--text-hint); transition: transform 0.18s; flex-shrink: 0; width: 12px; }
.row-arrow.open { transform: rotate(90deg); }
.row-arrow:empty { width: 12px; }
.row-icon { font-size: 12px; flex-shrink: 0; }
.db-icon { color: var(--type-object); }
.coll-icon { color: var(--type-array); }
.query-icon { color: var(--accent-primary); }
.row-name { flex: 1; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.sec-label { font-weight: 500; color: var(--text-tertiary); font-size: 11.5px; }
.item-meta { font-size: 10px; color: var(--text-disabled); font-family: monospace; flex-shrink: 0; }
.badge { font-size: 10px; color: var(--text-disabled); background: var(--bg-active); padding: 0 5px; border-radius: 7px; flex-shrink: 0; }

.db-children { margin-bottom: 4px; }
.sec-children { margin-bottom: 2px; }
.empty-row { padding: 4px 12px 4px 44px; color: var(--type-null); font-size: 11px; font-style: italic; }
.empty { padding: 8px 12px; color: var(--type-null); font-size: 11px; font-style: italic; }

.row-action { opacity: 0; transition: opacity 0.1s; }
.db-row:hover .row-action { opacity: 1; }
</style>
