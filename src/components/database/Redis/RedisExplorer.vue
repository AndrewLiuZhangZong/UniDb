<template>
  <div class="redis-explorer" :class="{ 'light-mode': !isDarkTheme }">
    <div class="explorer-toolbar">
      <n-input v-model:value="keyPattern" size="tiny" placeholder="key:* 搜索" @keyup.enter="searchKeys" style="flex:1">
        <template #prefix><n-icon :size="12"><SearchOutline /></n-icon></template>
      </n-input>
      <n-button text size="tiny" @click="searchKeys" :loading="loading">
        <template #icon><n-icon><RefreshOutline /></n-icon></template>
      </n-button>
    </div>

    <!-- Type filter pills -->
    <div class="type-filters">
      <span
        v-for="tf in typeFilters" :key="tf.value"
        :class="['type-pill', activeType === tf.value && 'active', tf.cls]"
        @click="activeType = activeType === tf.value ? null : tf.value"
      >{{ tf.label }}</span>
    </div>

    <div v-if="error" class="error-msg">
      <n-icon><WarningOutline /></n-icon>
      {{ error }}
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
          <div v-if="loading && !keys.length" class="loading-hint">加载中...</div>
          <div v-else-if="!filteredKeys.length" class="empty">
            {{ error ? '连接失败' : '没有匹配的 Key' }}
          </div>
          <div
            v-for="k in filteredKeys" :key="k.key"
            class="key-item"
            :class="{ active: selKey?.key === k.key }"
            @click="select(k, 'key')"
            @contextmenu.prevent="ctxItem = k; ctxShow = true; ctxX = $event.clientX; ctxY = $event.clientY"
          >
            <span :class="['type-dot', k.type]">{{ k.type ? k.type[0].toUpperCase() : '?' }}</span>
            <span class="key-name" :title="k.key">{{ k.key }}</span>
            <span v-if="k.ttl > 0" class="key-ttl">{{ formatTTL(k.ttl) }}</span>
            <span v-else-if="k.ttl === -1" class="key-ttl no-ttl">∞</span>
          </div>
          <div v-if="total > keys.length" class="more-hint">仅显示前 {{ keys.length }} / {{ total }} 个</div>
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
          <div v-if="!serverInfo.length" class="empty">点击刷新加载</div>
          <div v-for="item in serverInfo" :key="item.key" class="info-row">
            <span class="info-k">{{ item.key }}</span>
            <span class="info-v">{{ item.value }}</span>
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
import {
  RefreshOutline, ChevronForwardOutline, KeyOutline, ServerOutline,
  SearchOutline, AddOutline, WarningOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { redisMeta } from '../../../api/meta'

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
const total = ref(0)
const serverInfo = ref<{ key: string; value: string }[]>([])
const error = ref('')
const exp = ref({ keys: true, info: false })
const ctxShow = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxItem = ref<any>(null)

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

const filteredKeys = computed(() =>
  activeType.value ? keys.value.filter(k => k.type === activeType.value) : keys.value
)

const formatTTL = (ttl: number) => {
  if (ttl < 60) return `${ttl}s`
  if (ttl < 3600) return `${Math.floor(ttl / 60)}m`
  return `${Math.floor(ttl / 3600)}h`
}

const toggle = (k: keyof typeof exp.value) => {
  exp.value[k] = !exp.value[k]
  if (k === 'info' && exp.value.info && !serverInfo.value.length) loadServerInfo()
}

const select = (item: any, type: string) => {
  selKey.value = item
  emit('select-item', { ...item, _connectionId: props.connection.id }, type)
}

const handleCtx = async (key: string) => {
  ctxShow.value = false
  if (key === 'view') {
    select(ctxItem.value, 'key')
  } else if (key === 'del') {
    redisMeta.deleteKey(props.connection.id, ctxItem.value.key).then(() => {
      message.success('已删除 ' + ctxItem.value.key)
      keys.value = keys.value.filter(k => k.key !== ctxItem.value.key)
    }).catch(e => message.error(e.message))
  } else if (key === 'ttl') {
    const newTTL = window.prompt(`设置 TTL（秒，-1 表示永久）:\n当前: ${ctxItem.value.ttl ?? -1}`)
    if (newTTL === null) return
    const ttlNum = parseInt(newTTL)
    if (isNaN(ttlNum)) { message.error('请输入有效数字'); return }
    try {
      const cmd = ttlNum < 0 ? `PERSIST ${ctxItem.value.key}` : `EXPIRE ${ctxItem.value.key} ${ttlNum}`
      await redisMeta.execute(props.connection.id, cmd)
      const k = keys.value.find(k => k.key === ctxItem.value.key)
      if (k) k.ttl = ttlNum
      message.success('TTL 已更新')
    } catch (e: any) { message.error(e.message) }
  } else if (key === 'rename') {
    const newKey = window.prompt(`重命名 Key:\n当前: ${ctxItem.value.key}`)
    if (!newKey || newKey === ctxItem.value.key) return
    try {
      await redisMeta.execute(props.connection.id, `RENAME ${ctxItem.value.key} ${newKey}`)
      const k = keys.value.find(k => k.key === ctxItem.value.key)
      if (k) k.key = newKey
      message.success('已重命名')
    } catch (e: any) { message.error(e.message) }
  }
}

const searchKeys = async () => {
  if (!props.connection?.id) return
  loading.value = true
  error.value = ''
  try {
    const res = await redisMeta.keys(props.connection.id, keyPattern.value || '*')
    keys.value = res.keys
    total.value = res.total
  } catch (e: any) {
    error.value = e.message || '加载失败'
    keys.value = []
  } finally {
    loading.value = false
  }
}

const loadServerInfo = async () => {
  if (!props.connection?.id) return
  try {
    const res = await redisMeta.info(props.connection.id)
    const importantKeys = [
      'redis_version', 'uptime_in_days', 'connected_clients',
      'used_memory_human', 'maxmemory_human', 'db0', 'total_commands_processed',
      'keyspace_hits', 'keyspace_misses', 'role', 'tcp_port'
    ]
    serverInfo.value = importantKeys
      .filter(k => res.info[k])
      .map(k => ({ key: k.replace(/_/g, ' '), value: res.info[k] }))
  } catch {
    // ignore info load failure
  }
}

watch(() => props.connection?.id, () => {
  selKey.value = null
  keys.value = []
  serverInfo.value = []
  error.value = ''
  searchKeys()
}, { immediate: true })
</script>

<style scoped>
.redis-explorer { display: flex; flex-direction: column; height: 100%; overflow: hidden; font-size: 12px; }
.explorer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.05); }

.type-filters { display: flex; gap: 4px; padding: 6px 8px; flex-shrink: 0; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); }
.type-pill { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.15s; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }
.type-pill.active.str, .type-pill.str:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
.type-pill.active.hash, .type-pill.hash:hover { background: rgba(245,158,11,0.2); color: #f59e0b; }
.type-pill.active.list, .type-pill.list:hover { background: rgba(24,160,88,0.2); color: #18a058; }
.type-pill.active.set, .type-pill.set:hover { background: rgba(96,165,250,0.2); color: #60a5fa; }
.type-pill.active.zset, .type-pill.zset:hover { background: rgba(167,139,250,0.2); color: #a78bfa; }

.error-msg { display: flex; align-items: center; gap: 5px; padding: 6px 10px; font-size: 11px; color: #ef4444; background: rgba(239,68,68,0.08); }

.tree-body { flex: 1; overflow-y: auto; padding: 4px 0; }
.tree-body::-webkit-scrollbar { width: 4px; }
.tree-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.section { margin-bottom: 1px; }
.section-hd { display: flex; align-items: center; gap: 5px; padding: 6px 8px; cursor: pointer; transition: background 0.1s; }
.section-hd:hover { background: rgba(255,255,255,0.04); }
.arrow { font-size: 12px; color: rgba(255,255,255,0.3); transition: transform 0.18s; flex-shrink: 0; }
.arrow.open { transform: rotate(90deg); }
.sec-icon { font-size: 13px; flex-shrink: 0; }
.key-c { color: #ef4444; }
.info-c { color: #f59e0b; }
.sec-label { flex: 1; font-weight: 500; color: rgba(255,255,255,0.65); }
.badge { font-size: 10px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 7px; }
.sec-action { opacity: 0; transition: opacity 0.1s; }
.section-hd:hover .sec-action { opacity: 1; }
.sec-body { padding-left: 8px; }

.keys-list { max-height: 300px; overflow-y: auto; }
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
.key-ttl { font-size: 10px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
.no-ttl { color: rgba(255,255,255,0.15); }
.more-hint { padding: 4px 10px; font-size: 10px; color: rgba(255,255,255,0.3); font-style: italic; }

.info-body { padding: 4px 0 4px 8px; }
.info-row { display: flex; align-items: center; gap: 6px; padding: 3px 8px; font-size: 11px; }
.info-k { color: rgba(255,255,255,0.4); min-width: 120px; text-transform: capitalize; }
.info-v { color: rgba(255,255,255,0.75); font-family: monospace; }

.loading-hint { padding: 6px 10px; color: rgba(255,255,255,0.3); font-size: 11px; }
.empty { padding: 6px 10px; color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
</style>
