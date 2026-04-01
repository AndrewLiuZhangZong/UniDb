<template>
  <div class="redis-explorer" :class="{ 'light-mode': !isDarkTheme }">
    <div class="explorer-toolbar">
      <n-input v-model:value="keyPattern" size="tiny" placeholder="key:*" @keyup.enter="searchKeys" style="flex:1">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="searchKeys" :loading="loading">
        <template #icon><n-icon><RefreshOutline /></n-icon></template>
      </n-button>
    </div>

    <!-- Type filter pills -->
    <div class="type-filters">
      <span v-for="t in typeFilters" :key="t.value"
        :class="['type-pill', activeType === t.value && 'active', t.cls]"
        @click="activeType = activeType === t.value ? null : t.value">
        {{ t.label }}
      </span>
    </div>

    <div class="tree-body">
      <!-- Keys Section -->
      <div class="section">
        <div class="section-hd" @click="toggle('keys')">
          <n-icon class="arrow" :class="{ open: exp.keys }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon key-c"><KeyOutline /></n-icon>
          <span class="sec-label">Keys</span>
          <span class="badge">{{ filteredKeys.length }}</span>
          <n-button text size="tiny" class="sec-action" @click.stop="$emit('select-item', null, 'new-key')">
            <template #icon><n-icon><AddOutline /></n-icon></template>
          </n-button>
        </div>
        <div v-if="exp.keys" class="sec-body keys-list">
          <div v-if="!filteredKeys.length" class="empty">没有匹配的 Key</div>
          <div
            v-for="k in filteredKeys" :key="k.key"
            class="key-item"
            :class="{ active: selKey?.key === k.key }"
            @click="select(k, 'key')"
            @contextmenu.prevent="ctxItem = k; ctxShow = true; ctxX = $event.clientX; ctxY = $event.clientY"
          >
            <span :class="['type-dot', k.type]">{{ k.type[0].toUpperCase() }}</span>
            <span class="key-name" :title="k.key">{{ k.key }}</span>
            <span v-if="k.ttl > 0" class="key-ttl">{{ formatTTL(k.ttl) }}</span>
            <span v-else-if="k.ttl === -1" class="key-ttl no-ttl">∞</span>
          </div>
        </div>
      </div>

      <!-- Server Info -->
      <div class="section">
        <div class="section-hd" @click="toggle('info')">
          <n-icon class="arrow" :class="{ open: exp.info }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon info-c"><ServerOutline /></n-icon>
          <span class="sec-label">服务器信息</span>
        </div>
        <div v-if="exp.info" class="sec-body info-body">
          <div v-for="item in serverInfo" :key="item.key" class="info-row">
            <span class="info-k">{{ item.key }}</span>
            <span class="info-v">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- Cluster / Nodes -->
      <div class="section">
        <div class="section-hd" @click="toggle('cluster')">
          <n-icon class="arrow" :class="{ open: exp.cluster }"><ChevronForwardOutline /></n-icon>
          <n-icon class="sec-icon cluster-c"><GitNetworkOutline /></n-icon>
          <span class="sec-label">节点配置</span>
        </div>
        <div v-if="exp.cluster" class="sec-body">
          <div v-for="node in clusterNodes" :key="node.id"
            class="tree-item node-item"
            @click="select(node, 'node')">
            <span :class="['node-role', node.role]">{{ node.role }}</span>
            <span class="item-name">{{ node.host }}:{{ node.port }}</span>
            <span :class="['node-status', node.status]">{{ node.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <n-dropdown trigger="manual" :show="ctxShow" :x="ctxX" :y="ctxY"
      :options="ctxOptions" @select="handleCtx" @clickoutside="ctxShow = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NIcon, NButton, NInput, NDropdown, useMessage } from 'naive-ui'
import { RefreshOutline, ChevronForwardOutline, KeyOutline, ServerOutline, SearchOutline, AddOutline, GitNetworkOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

const message = useMessage()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')
const props = defineProps<{ connection: any }>()
const emit = defineEmits<{ (e: 'select-item', item: any, type: string): void }>()

const loading = ref(false)
const keyPattern = ref('*')
const activeType = ref<string | null>(null)
const selKey = ref<any>(null)
const keys = ref<any[]>([])
const serverInfo = ref<any[]>([])
const clusterNodes = ref<any[]>([])
const exp = ref({ keys: true, info: false, cluster: false })
const ctxShow = ref(false); const ctxX = ref(0); const ctxY = ref(0); const ctxItem = ref<any>(null)

const typeFilters = [
  { label: 'STR', value: 'string', cls: 'str' },
  { label: 'HASH', value: 'hash', cls: 'hash' },
  { label: 'LIST', value: 'list', cls: 'list' },
  { label: 'SET', value: 'set', cls: 'set' },
  { label: 'ZSET', value: 'zset', cls: 'zset' }
]

const ctxOptions = [
  { label: '查看/编辑值', key: 'view' },
  { label: '设置 TTL', key: 'ttl' },
  { label: '重命名 Key', key: 'rename' },
  { type: 'divider', key: 'd1' },
  { label: '删除 Key', key: 'del' }
]

const filteredKeys = computed(() => {
  let list = keys.value
  if (activeType.value) list = list.filter(k => k.type === activeType.value)
  return list
})

const formatTTL = (ttl: number) => {
  if (ttl < 60) return `${ttl}s`
  if (ttl < 3600) return `${Math.floor(ttl / 60)}m`
  return `${Math.floor(ttl / 3600)}h`
}

const toggle = (k: keyof typeof exp.value) => { exp.value[k] = !exp.value[k] }

const select = (item: any, type: string) => {
  selKey.value = item
  emit('select-item', item, type)
}

const handleCtx = (key: string) => {
  ctxShow.value = false
  if (key === 'view') select(ctxItem.value, 'key')
  else message.info(key)
}

const searchKeys = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 200))
  keys.value = [
    { key: 'user:1001', type: 'hash', ttl: -1, size: 6 },
    { key: 'user:1002', type: 'hash', ttl: -1, size: 5 },
    { key: 'session:abc123', type: 'string', ttl: 3600, size: 1 },
    { key: 'session:def456', type: 'string', ttl: 1800, size: 1 },
    { key: 'queue:emails', type: 'list', ttl: -1, size: 42 },
    { key: 'queue:jobs', type: 'list', ttl: -1, size: 8 },
    { key: 'cache:products', type: 'string', ttl: 300, size: 1 },
    { key: 'tags:popular', type: 'set', ttl: -1, size: 15 },
    { key: 'leaderboard', type: 'zset', ttl: -1, size: 100 },
    { key: 'config:app', type: 'hash', ttl: -1, size: 12 },
    { key: 'counter:visits', type: 'string', ttl: -1, size: 1 },
    { key: 'lock:payment', type: 'string', ttl: 30, size: 1 }
  ]
  serverInfo.value = [
    { key: 'version', value: '7.2.3' },
    { key: 'mode', value: 'standalone' },
    { key: 'uptime', value: '14d 2h' },
    { key: 'connected_clients', value: '12' },
    { key: 'used_memory', value: '24.5 MB' },
    { key: 'total_keys', value: '156' },
    { key: 'hits/misses', value: '4820 / 230' },
    { key: 'hit_rate', value: '95.4%' }
  ]
  clusterNodes.value = [
    { id: '1', host: '127.0.0.1', port: 6379, role: 'master', status: 'online' },
    { id: '2', host: '127.0.0.1', port: 6380, role: 'replica', status: 'online' },
    { id: '3', host: '127.0.0.1', port: 6381, role: 'replica', status: 'offline' }
  ]
  loading.value = false
}

watch(() => props.connection, () => { selKey.value = null; searchKeys() }, { immediate: true })
</script>

<style scoped>
.redis-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }
.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.light-mode .explorer-toolbar { border-bottom-color: rgba(0,0,0,0.06); }

.type-filters { display: flex; gap: 4px; padding: 6px 8px; flex-shrink: 0; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); }
.light-mode .type-filters { border-bottom-color: rgba(0,0,0,0.06); }
.type-pill { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.15s; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }
.light-mode .type-pill { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.4); }
.type-pill.active.str, .type-pill.str:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.type-pill.active.hash, .type-pill.hash:hover { background: rgba(245,158,11,0.2); color: #f59e0b; }
.type-pill.active.list, .type-pill.list:hover { background: rgba(24,160,88,0.2); color: #18a058; }
.type-pill.active.set, .type-pill.set:hover { background: rgba(96,165,250,0.2); color: #60a5fa; }
.type-pill.active.zset, .type-pill.zset:hover { background: rgba(167,139,250,0.2); color: #a78bfa; }

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
.sec-icon { font-size: 13px; flex-shrink: 0; }
.key-c { color: #ef4444; }
.info-c { color: #f59e0b; }
.cluster-c { color: #a78bfa; }
.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }
.light-mode .sec-label { color: rgba(0,0,0,0.65); }
.badge { font-size: 10px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px; }
.light-mode .badge { color: rgba(0,0,0,0.35); background: rgba(0,0,0,0.06); }
.sec-action { opacity: 0; transition: opacity 0.1s; }
.section-hd:hover .sec-action { opacity: 1; }
.sec-body { padding-left: 8px; }

/* Keys list */
.keys-list { max-height: 260px; overflow-y: auto; }
.key-item { display: flex; align-items: center; gap: 6px; padding: 4px 8px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; }
.key-item:hover { background: rgba(239,68,68,0.08); }
.key-item.active { background: rgba(239,68,68,0.15); }

.type-dot { width: 18px; height: 18px; border-radius: 3px; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.type-dot.string { background: rgba(239,68,68,0.25); color: #ef4444; }
.type-dot.hash { background: rgba(245,158,11,0.25); color: #f59e0b; }
.type-dot.list { background: rgba(24,160,88,0.25); color: #18a058; }
.type-dot.set { background: rgba(96,165,250,0.25); color: #60a5fa; }
.type-dot.zset { background: rgba(167,139,250,0.25); color: #a78bfa; }

.key-name { flex: 1; color: rgba(255,255,255,0.82); font-family: monospace; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.light-mode .key-name { color: rgba(0,0,0,0.82); }
.key-ttl { font-size: 10px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
.light-mode .key-ttl { color: rgba(0,0,0,0.3); }
.no-ttl { color: rgba(255,255,255,0.15); }

/* Info */
.info-body { padding: 4px 0 4px 8px; }
.info-row { display: flex; align-items: center; gap: 6px; padding: 3px 8px; font-size: 11px; }
.info-k { color: rgba(255,255,255,0.4); min-width: 120px; }
.light-mode .info-k { color: rgba(0,0,0,0.4); }
.info-v { color: rgba(255,255,255,0.75); font-family: monospace; }
.light-mode .info-v { color: rgba(0,0,0,0.75); }

/* Node */
.tree-item { display: flex; align-items: center; gap: 6px; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin: 1px 4px; transition: background 0.1s; }
.tree-item:hover { background: rgba(167,139,250,0.1); }
.item-name { flex: 1; color: rgba(255,255,255,0.75); font-family: monospace; font-size: 11px; }
.light-mode .item-name { color: rgba(0,0,0,0.75); }
.node-role { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; }
.node-role.master { color: #f59e0b; background: rgba(245,158,11,0.15); }
.node-role.replica { color: #60a5fa; background: rgba(96,165,250,0.12); }
.node-status { font-size: 10px; font-weight: 600; }
.node-status.online { color: #18a058; }
.node-status.offline { color: #ef4444; }

.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
.light-mode .empty { color: rgba(0,0,0,0.25); }
</style>
