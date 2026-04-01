<template>
  <div class="redis-workspace" :class="{ 'light-mode': !isDarkTheme }">

    <!-- No key selected: overview dashboard -->
    <template v-if="!selectedItem || selectedItemType === 'node'">
      <div class="overview">
        <!-- Stats cards -->
        <div class="stats-grid">
          <div v-for="s in statsCards" :key="s.label" class="stat-card">
            <div class="stat-icon" :class="s.cls">
              <n-icon :size="20"><component :is="s.icon" /></n-icon>
            </div>
            <div class="stat-body">
              <div class="stat-val">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- Node info when node selected -->
        <div v-if="selectedItemType === 'node' && selectedItem" class="node-panel">
          <div class="panel-title">
            <n-icon><GitNetworkOutline /></n-icon>
            节点详情 — {{ selectedItem.host }}:{{ selectedItem.port }}
          </div>
          <div class="node-info-grid">
            <div class="ni-row"><span class="ni-k">Role</span><span :class="['ni-v role', selectedItem.role]">{{ selectedItem.role }}</span></div>
            <div class="ni-row"><span class="ni-k">Status</span><span :class="['ni-v status', selectedItem.status]">{{ selectedItem.status }}</span></div>
            <div class="ni-row"><span class="ni-k">Host</span><code class="ni-code">{{ selectedItem.host }}:{{ selectedItem.port }}</code></div>
          </div>
        </div>

        <!-- Key type distribution chart -->
        <div class="dist-panel">
          <div class="panel-title"><n-icon><PieChartOutline /></n-icon> Key 类型分布</div>
          <div class="type-bars">
            <div v-for="t in typeDist" :key="t.type" class="type-bar-row">
              <span :class="['type-label', t.type]">{{ t.type.toUpperCase() }}</span>
              <div class="bar-bg">
                <div class="bar-fill" :class="t.type" :style="{ width: t.pct + '%' }"></div>
              </div>
              <span class="bar-count">{{ t.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Key selected -->
    <template v-else-if="selectedItemType === 'key'">
      <!-- Key header -->
      <div class="key-header">
        <span :class="['type-badge-lg', selectedItem.type]">{{ selectedItem.type.toUpperCase() }}</span>
        <code class="key-name-lg">{{ selectedItem.key }}</code>
        <div class="key-meta">
          <span class="key-ttl-badge" :class="selectedItem.ttl > 0 ? 'has-ttl' : 'no-ttl'">
            TTL: {{ selectedItem.ttl > 0 ? formatTTL(selectedItem.ttl) : '永久' }}
          </span>
        </div>
        <div class="key-actions">
          <n-button size="small" @click="showTTLModal = true">
            <template #icon><n-icon><TimerOutline /></n-icon></template>
            设置 TTL
          </n-button>
          <n-button size="small" type="error" ghost @click="deleteKey">
            <template #icon><n-icon><TrashOutline /></n-icon></template>
            删除
          </n-button>
        </div>
      </div>

      <!-- Value editor by type -->
      <div class="value-editor">

        <!-- STRING -->
        <template v-if="selectedItem.type === 'string'">
          <div class="val-toolbar">
            <span class="val-title">字符串值</span>
            <div class="spacer" />
            <n-button size="small" type="primary" @click="saveString">
              <template #icon><n-icon><SaveOutline /></n-icon></template>保存
            </n-button>
          </div>
          <textarea v-model="strValue" class="value-textarea" spellcheck="false" placeholder="Enter value..." />
          <div class="val-meta">字节数: {{ strValue.length }}</div>
        </template>

        <!-- HASH -->
        <template v-else-if="selectedItem.type === 'hash'">
          <div class="val-toolbar">
            <span class="val-title">Hash 字段 ({{ hashFields.length }})</span>
            <n-input v-model:value="hashFilter" size="small" placeholder="过滤字段..." style="width:160px" clearable />
            <div class="spacer" />
            <n-button size="small" @click="addHashField">
              <template #icon><n-icon><AddOutline /></n-icon></template>添加字段
            </n-button>
          </div>
          <div class="hash-table">
            <div class="hash-header">
              <span class="hh field">字段</span>
              <span class="hh value">值</span>
              <span class="hh actions"></span>
            </div>
            <div v-for="(f, i) in filteredHashFields" :key="f.field" class="hash-row">
              <span class="hh field"><code>{{ f.field }}</code></span>
              <span class="hh value" @click="editHashRow = i; editHashVal = f.value">
                <template v-if="editHashRow === i">
                  <n-input v-model:value="editHashVal" size="tiny" autosize @blur="saveHashField(f, editHashVal)" />
                </template>
                <template v-else>
                  <span class="field-val" :title="f.value">{{ f.value }}</span>
                </template>
              </span>
              <span class="hh actions">
                <n-button text size="tiny" @click="message.success('已删除字段 ' + f.field)">
                  <template #icon><n-icon><TrashOutline /></n-icon></template>
                </n-button>
              </span>
            </div>
          </div>
        </template>

        <!-- LIST -->
        <template v-else-if="selectedItem.type === 'list'">
          <div class="val-toolbar">
            <span class="val-title">List 元素 ({{ listItems.length }})</span>
            <div class="spacer" />
            <n-button size="small" @click="message.info('LPUSH')">LPUSH</n-button>
            <n-button size="small" @click="message.info('RPUSH')">RPUSH</n-button>
          </div>
          <div class="list-table">
            <div class="list-header">
              <span class="lh idx">Index</span>
              <span class="lh value">Value</span>
              <span class="lh actions"></span>
            </div>
            <div v-for="(item, i) in listItems" :key="i" class="list-row">
              <span class="lh idx"><code class="idx-badge">{{ i }}</code></span>
              <span class="lh value"><span class="list-val">{{ item }}</span></span>
              <span class="lh actions">
                <n-button text size="tiny" @click="message.info('LREM ' + item)">
                  <template #icon><n-icon><TrashOutline /></n-icon></template>
                </n-button>
              </span>
            </div>
          </div>
        </template>

        <!-- SET -->
        <template v-else-if="selectedItem.type === 'set'">
          <div class="val-toolbar">
            <span class="val-title">Set 成员 ({{ setMembers.length }})</span>
            <div class="spacer" />
            <n-button size="small">
              <template #icon><n-icon><AddOutline /></n-icon></template>SADD
            </n-button>
          </div>
          <div class="set-grid">
            <div v-for="m in setMembers" :key="m" class="set-item">
              <span>{{ m }}</span>
              <n-button text size="tiny" @click="message.info('SREM ' + m)">
                <template #icon><n-icon><CloseOutline /></n-icon></template>
              </n-button>
            </div>
          </div>
        </template>

        <!-- ZSET -->
        <template v-else-if="selectedItem.type === 'zset'">
          <div class="val-toolbar">
            <span class="val-title">Sorted Set 成员 ({{ zsetMembers.length }})</span>
            <div class="spacer" />
            <n-button size="small">
              <template #icon><n-icon><AddOutline /></n-icon></template>ZADD
            </n-button>
          </div>
          <div class="zset-table">
            <div class="zset-header">
              <span class="zh rank">Rank</span>
              <span class="zh score">Score</span>
              <span class="zh member">Member</span>
              <span class="zh actions"></span>
            </div>
            <div v-for="(z, i) in zsetMembers" :key="z.member" class="zset-row">
              <span class="zh rank"><code class="rank-badge">{{ i + 1 }}</code></span>
              <span class="zh score"><code class="score-val">{{ z.score }}</code></span>
              <span class="zh member"><span class="member-val">{{ z.member }}</span></span>
              <span class="zh actions">
                <n-button text size="tiny" @click="message.info('ZREM ' + z.member)">
                  <template #icon><n-icon><TrashOutline /></n-icon></template>
                </n-button>
              </span>
            </div>
          </div>
        </template>

      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NButton, NIcon, NInput, useMessage, useDialog } from 'naive-ui'
import {
  KeyOutline, ServerOutline, GitNetworkOutline, PieChartOutline,
  TrashOutline, SaveOutline, AddOutline, CloseOutline, TimerOutline,
  RefreshOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  connection: any
  selectedItem: any
  selectedItemType: string
}>()

// ── Overview ──
const statsCards = [
  { label: '总 Key 数', value: '156', icon: KeyOutline, cls: 'red' },
  { label: '已用内存', value: '24.5 MB', icon: ServerOutline, cls: 'yellow' },
  { label: '命中率', value: '95.4%', icon: RefreshOutline, cls: 'green' },
  { label: '连接数', value: '12', icon: GitNetworkOutline, cls: 'purple' }
]

const typeDist = [
  { type: 'string', count: 68, pct: 44 },
  { type: 'hash', count: 42, pct: 27 },
  { type: 'list', count: 20, pct: 13 },
  { type: 'set', count: 15, pct: 10 },
  { type: 'zset', count: 11, pct: 7 }
]

const formatTTL = (ttl: number) => {
  if (ttl < 60) return `${ttl}s`
  if (ttl < 3600) return `${Math.floor(ttl / 60)}m`
  return `${Math.floor(ttl / 3600)}h`
}

// ── Key value state ──
const showTTLModal = ref(false)
const strValue = ref('')
const hashFilter = ref('')
const editHashRow = ref<number | null>(null)
const editHashVal = ref('')
const hashFields = ref<any[]>([])
const listItems = ref<string[]>([])
const setMembers = ref<string[]>([])
const zsetMembers = ref<any[]>([])

const filteredHashFields = computed(() =>
  hashFilter.value ? hashFields.value.filter(f => f.field.includes(hashFilter.value)) : hashFields.value
)

const loadKeyValue = () => {
  if (!props.selectedItem || props.selectedItemType !== 'key') return
  const k = props.selectedItem
  if (k.type === 'string') strValue.value = `Hello Redis! This is the value for key "${k.key}"`
  else if (k.type === 'hash') {
    hashFields.value = [
      { field: 'username', value: 'john_doe' },
      { field: 'email', value: 'john@example.com' },
      { field: 'role', value: 'admin' },
      { field: 'score', value: '1250' },
      { field: 'last_login', value: '2024-01-15 10:30:00' },
      { field: 'created_at', value: '2023-06-01 08:00:00' }
    ]
  } else if (k.type === 'list') {
    listItems.value = ['email:user1@mail.com', 'email:user2@mail.com', 'email:user3@mail.com', 'notify:12345', 'notify:67890', 'cleanup:expired', 'sync:products', 'report:daily']
  } else if (k.type === 'set') {
    setMembers.value = ['nodejs', 'vue', 'redis', 'docker', 'typescript', 'postgres', 'nginx', 'rabbitmq', 'elasticsearch']
  } else if (k.type === 'zset') {
    zsetMembers.value = [
      { member: 'player:1001', score: 9850 },
      { member: 'player:1002', score: 8720 },
      { member: 'player:1003', score: 7630 },
      { member: 'player:1004', score: 6540 },
      { member: 'player:1005', score: 5210 }
    ]
  }
}

const saveString = () => message.success('已保存字符串值')
const addHashField = () => message.info('添加 Hash 字段')
const saveHashField = (f: any, val: string) => {
  f.value = val; editHashRow.value = null
  message.success(`HSET ${props.selectedItem?.key} ${f.field} ${val}`)
}
const deleteKey = () => {
  dialog.warning({
    title: '删除 Key', content: `确定删除 "${props.selectedItem?.key}"？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: () => message.success('已删除 Key: ' + props.selectedItem?.key)
  })
}

watch(() => props.selectedItem, loadKeyValue, { immediate: true })
</script>

<style scoped>
.redis-workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #13131a; color: rgba(255,255,255,0.85); }
.redis-workspace.light-mode { background: #f5f5f8; color: rgba(0,0,0,0.85); }
.spacer { flex: 1; }

/* Overview */
.overview { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; }
.redis-workspace.light-mode .stat-card { background: #fff; border-color: rgba(0,0,0,0.07); }
.stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon.red { background: rgba(239,68,68,0.15); color: #ef4444; }
.stat-icon.yellow { background: rgba(245,158,11,0.15); color: #f59e0b; }
.stat-icon.green { background: rgba(24,160,88,0.15); color: #18a058; }
.stat-icon.purple { background: rgba(167,139,250,0.15); color: #a78bfa; }
.stat-val { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.9); }
.redis-workspace.light-mode .stat-val { color: rgba(0,0,0,0.9); }
.stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.redis-workspace.light-mode .stat-label { color: rgba(0,0,0,0.4); }

/* Node panel */
.node-panel { background: rgba(167,139,250,0.07); border: 1px solid rgba(167,139,250,0.15); border-radius: 10px; padding: 14px; }
.panel-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); margin-bottom: 10px; }
.redis-workspace.light-mode .panel-title { color: rgba(0,0,0,0.75); }
.node-info-grid { display: flex; flex-direction: column; gap: 6px; }
.ni-row { display: flex; align-items: center; gap: 12px; font-size: 12px; }
.ni-k { color: rgba(255,255,255,0.4); min-width: 60px; }
.redis-workspace.light-mode .ni-k { color: rgba(0,0,0,0.4); }
.ni-v { color: rgba(255,255,255,0.85); font-weight: 500; }
.redis-workspace.light-mode .ni-v { color: rgba(0,0,0,0.85); }
.ni-v.role.master { color: #f59e0b; }
.ni-v.role.replica { color: #60a5fa; }
.ni-v.status.online { color: #18a058; }
.ni-v.status.offline { color: #ef4444; }
.ni-code { font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.7); }
.redis-workspace.light-mode .ni-code { color: rgba(0,0,0,0.7); }

/* Type distribution */
.dist-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; }
.redis-workspace.light-mode .dist-panel { background: #fff; border-color: rgba(0,0,0,0.07); }
.type-bars { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.type-bar-row { display: flex; align-items: center; gap: 10px; font-size: 11px; }
.type-label { min-width: 44px; font-weight: 700; font-size: 10px; }
.type-label.string { color: #ef4444; }
.type-label.hash { color: #f59e0b; }
.type-label.list { color: #18a058; }
.type-label.set { color: #60a5fa; }
.type-label.zset { color: #a78bfa; }
.bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
.redis-workspace.light-mode .bar-bg { background: rgba(0,0,0,0.08); }
.bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.bar-fill.string { background: #ef4444; }
.bar-fill.hash { background: #f59e0b; }
.bar-fill.list { background: #18a058; }
.bar-fill.set { background: #60a5fa; }
.bar-fill.zset { background: #a78bfa; }
.bar-count { font-size: 11px; color: rgba(255,255,255,0.4); min-width: 28px; text-align: right; }
.redis-workspace.light-mode .bar-count { color: rgba(0,0,0,0.4); }

/* Key header */
.key-header { display: flex; align-items: center; gap: 10px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.redis-workspace.light-mode .key-header { border-bottom-color: rgba(0,0,0,0.06); }
.type-badge-lg { font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
.type-badge-lg.string { color: #ef4444; background: rgba(239,68,68,0.15); }
.type-badge-lg.hash { color: #f59e0b; background: rgba(245,158,11,0.15); }
.type-badge-lg.list { color: #18a058; background: rgba(24,160,88,0.15); }
.type-badge-lg.set { color: #60a5fa; background: rgba(96,165,250,0.15); }
.type-badge-lg.zset { color: #a78bfa; background: rgba(167,139,250,0.15); }
.key-name-lg { font-family: 'SF Mono',monospace; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.redis-workspace.light-mode .key-name-lg { color: rgba(0,0,0,0.9); }
.key-meta { display: flex; align-items: center; gap: 6px; }
.key-ttl-badge { font-size: 11px; padding: 2px 7px; border-radius: 4px; font-family: monospace; }
.has-ttl { color: #f59e0b; background: rgba(245,158,11,0.12); }
.no-ttl { color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); }
.redis-workspace.light-mode .no-ttl { color: rgba(0,0,0,0.3); background: rgba(0,0,0,0.06); }
.key-actions { display: flex; gap: 8px; }

/* Value editor */
.value-editor { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.val-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.redis-workspace.light-mode .val-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.val-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
.redis-workspace.light-mode .val-title { color: rgba(0,0,0,0.75); }

/* String */
.value-textarea { flex: 1; width: 100%; padding: 12px 14px; resize: none; outline: none; background: #1a1a24; color: #e0e0e0; font-family: 'SF Mono','Monaco',monospace; font-size: 13px; line-height: 1.6; border: none; box-sizing: border-box; }
.redis-workspace.light-mode .value-textarea { background: #fff; color: #1a1a1a; }
.val-meta { padding: 6px 14px; font-size: 11px; color: rgba(255,255,255,0.3); border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.redis-workspace.light-mode .val-meta { color: rgba(0,0,0,0.3); border-top-color: rgba(0,0,0,0.06); }

/* Hash */
.hash-table { flex: 1; overflow-y: auto; }
.hash-header, .hash-row { display: grid; grid-template-columns: 180px 1fr 40px; align-items: center; gap: 4px; padding: 6px 14px; }
.hash-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.redis-workspace.light-mode .hash-header { color: rgba(0,0,0,0.3); border-bottom-color: rgba(0,0,0,0.05); }
.hash-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; cursor: pointer; font-size: 12px; }
.hash-row:hover { background: rgba(245,158,11,0.07); }
.redis-workspace.light-mode .hash-row { border-bottom-color: rgba(0,0,0,0.04); }
.hash-row code { font-family: monospace; font-size: 11px; color: #f59e0b; }
.field-val { color: rgba(255,255,255,0.75); font-family: monospace; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; max-width: 100%; }
.redis-workspace.light-mode .field-val { color: rgba(0,0,0,0.75); }

/* List */
.list-table { flex: 1; overflow-y: auto; }
.list-header, .list-row { display: grid; grid-template-columns: 60px 1fr 40px; align-items: center; gap: 4px; padding: 6px 14px; }
.list-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.redis-workspace.light-mode .list-header { color: rgba(0,0,0,0.3); }
.list-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; }
.list-row:hover { background: rgba(24,160,88,0.07); }
.idx-badge { font-size: 10px; color: #18a058; background: rgba(24,160,88,0.12); padding: 1px 5px; border-radius: 3px; }
.list-val { color: rgba(255,255,255,0.8); font-family: monospace; font-size: 12px; }
.redis-workspace.light-mode .list-val { color: rgba(0,0,0,0.8); }

/* Set */
.set-grid { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }
.set-item { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2); border-radius: 16px; font-size: 12px; color: #60a5fa; }

/* Zset */
.zset-table { flex: 1; overflow-y: auto; }
.zset-header, .zset-row { display: grid; grid-template-columns: 60px 100px 1fr 40px; align-items: center; gap: 4px; padding: 6px 14px; }
.zset-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
.redis-workspace.light-mode .zset-header { color: rgba(0,0,0,0.3); }
.zset-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; }
.zset-row:hover { background: rgba(167,139,250,0.07); }
.rank-badge { font-size: 10px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 3px; }
.redis-workspace.light-mode .rank-badge { color: rgba(0,0,0,0.5); background: rgba(0,0,0,0.06); }
.score-val { font-family: monospace; font-size: 12px; color: #a78bfa; font-weight: 600; }
.member-val { color: rgba(255,255,255,0.82); font-family: monospace; font-size: 12px; }
.redis-workspace.light-mode .member-val { color: rgba(0,0,0,0.82); }
</style>
