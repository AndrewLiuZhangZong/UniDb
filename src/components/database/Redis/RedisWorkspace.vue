<template>
  <div class="redis-workspace">

    <!-- Overview when no key selected -->
    <template v-if="!selectedItem || selectedItemType === 'node'">
      <div class="overview">
        <div class="overview-header">
          <span class="ov-title">Redis 概览</span>
          <n-button size="small" :loading="infoLoading" @click="loadInfo">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>刷新
          </n-button>
        </div>

        <div v-if="infoError" class="error-block">{{ infoError }}</div>

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

        <!-- Type distribution bars -->
        <div v-if="typeDist.length" class="dist-panel">
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

        <!-- Raw INFO -->
        <div class="info-panel">
          <div class="panel-title"><n-icon><ServerOutline /></n-icon> 服务器详情</div>
          <div class="info-rows">
            <div v-for="item in infoRows" :key="item.k" class="info-row">
              <span class="info-k">{{ item.k }}</span>
              <span class="info-v">{{ item.v }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Key selected -->
    <template v-else-if="selectedItemType === 'key'">
      <div class="key-header">
        <span :class="['type-badge-lg', keyDetail?.type || selectedItem.type]">
          {{ (keyDetail?.type || selectedItem.type || '?').toUpperCase() }}
        </span>
        <code class="key-name-lg">{{ selectedItem.key }}</code>
        <div class="key-meta">
          <span class="key-ttl-badge" :class="(keyDetail?.ttl ?? selectedItem.ttl) > 0 ? 'has-ttl' : 'no-ttl'">
            TTL: {{ (keyDetail?.ttl ?? selectedItem.ttl) > 0 ? formatTTL(keyDetail?.ttl ?? selectedItem.ttl) : '永久' }}
          </span>
        </div>
        <n-button size="small" :loading="valueLoading" @click="loadValue">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
        </n-button>
        <n-button size="small" type="error" ghost @click="deleteKey">
          <template #icon><n-icon><TrashOutline /></n-icon></template>删除
        </n-button>
      </div>

      <div v-if="valueLoading && !keyDetail" class="loading-center">加载中...</div>
      <div v-else-if="valueError" class="error-block">{{ valueError }}</div>

      <div v-else-if="keyDetail" class="value-editor">

        <!-- STRING -->
        <template v-if="keyDetail.type === 'string'">
          <div class="val-toolbar">
            <span class="val-title">字符串值</span>
            <span class="val-size">{{ String(keyDetail.value ?? '').length }} 字节</span>
            <div class="spacer" />
            <n-button size="small" type="primary" @click="saveString">
              <template #icon><n-icon><SaveOutline /></n-icon></template>保存
            </n-button>
          </div>
          <textarea v-model="strValue" class="value-textarea" spellcheck="false" />
        </template>

        <!-- HASH -->
        <template v-else-if="keyDetail.type === 'hash'">
          <div class="val-toolbar">
            <span class="val-title">Hash 字段 ({{ keyDetail.value?.length ?? 0 }})</span>
            <n-input v-model:value="hashFilter" size="small" placeholder="过滤字段..." style="width:140px" clearable />
            <div class="spacer" />
            <n-button size="small" @click="showAddHash = !showAddHash">
              <template #icon><n-icon><AddOutline /></n-icon></template>添加
            </n-button>
          </div>
          <div v-if="showAddHash" class="add-hash-row">
            <n-input v-model:value="newHashField" size="small" placeholder="Field" style="width:140px" />
            <n-input v-model:value="newHashValue" size="small" placeholder="Value" style="flex:1" />
            <n-button size="small" type="primary" @click="addHashField">确认</n-button>
            <n-button size="small" @click="showAddHash=false;newHashField='';newHashValue=''">取消</n-button>
          </div>
          <div class="hash-table">
            <div class="hash-header">
              <span class="hh field">字段</span>
              <span class="hh value">值</span>
              <span class="hh actions"></span>
            </div>
            <div v-for="(f, i) in filteredHash" :key="f.field" class="hash-row">
              <span class="hh field"><code>{{ f.field }}</code></span>
              <span class="hh value" @click="editIdx = i; editVal = f.value">
                <n-input v-if="editIdx === i" v-model:value="editVal" size="tiny"
                  @blur="saveHashField(f)" @keyup.enter="saveHashField(f)" autosize />
                <span v-else class="field-val">{{ f.value }}</span>
              </span>
              <span class="hh actions">
                <n-button text size="tiny" @click="deleteHashField(f.field)">
                  <template #icon><n-icon><TrashOutline /></n-icon></template>
                </n-button>
              </span>
            </div>
          </div>
        </template>

        <!-- LIST -->
        <template v-else-if="keyDetail.type === 'list'">
          <div class="val-toolbar">
            <span class="val-title">List 元素 ({{ keyDetail.value?.length ?? 0 }})</span>
            <div class="spacer" />
            <n-button size="small" @click="lpush">LPUSH</n-button>
            <n-button size="small" @click="rpush">RPUSH</n-button>
          </div>
          <div class="list-table">
            <div class="list-header">
              <span class="lh idx">Index</span>
              <span class="lh value">Value</span>
              <span class="lh actions"></span>
            </div>
            <div v-for="(item, i) in keyDetail.value" :key="i" class="list-row">
              <span class="lh idx"><code class="idx-badge">{{ i }}</code></span>
              <span class="lh value"><span class="list-val">{{ item }}</span></span>
              <span class="lh actions">
                <n-button text size="tiny" @click="lrem(item)">
                  <template #icon><n-icon><TrashOutline /></n-icon></template>
                </n-button>
              </span>
            </div>
          </div>
        </template>

        <!-- SET -->
        <template v-else-if="keyDetail.type === 'set'">
          <div class="val-toolbar">
            <span class="val-title">Set 成员 ({{ keyDetail.value?.length ?? 0 }})</span>
            <div class="spacer" />
            <n-button size="small" @click="sadd">SADD</n-button>
          </div>
          <div class="set-grid">
            <div v-for="m in keyDetail.value" :key="m" class="set-item">
              <span>{{ m }}</span>
              <n-button text size="tiny" @click="srem(m)">
                <template #icon><n-icon><CloseOutline /></n-icon></template>
              </n-button>
            </div>
          </div>
        </template>

        <!-- ZSET -->
        <template v-else-if="keyDetail.type === 'zset'">
          <div class="val-toolbar">
            <span class="val-title">Sorted Set ({{ keyDetail.value?.length ?? 0 }})</span>
            <div class="spacer" />
            <n-button size="small" @click="zadd">ZADD</n-button>
          </div>
          <div class="zset-table">
            <div class="zset-header">
              <span class="zh rank">Rank</span>
              <span class="zh score">Score</span>
              <span class="zh member">Member</span>
              <span class="zh actions"></span>
            </div>
            <div v-for="(z, i) in keyDetail.value" :key="z.member" class="zset-row">
              <span class="zh rank"><code class="rank-badge">{{ i + 1 }}</code></span>
              <span class="zh score"><code class="score-val">{{ z.score }}</code></span>
              <span class="zh member"><span class="member-val">{{ z.member }}</span></span>
              <span class="zh actions">
                <n-button text size="tiny" @click="zrem(z.member)">
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
  KeyOutline, ServerOutline, PieChartOutline, TrashOutline, SaveOutline,
  AddOutline, CloseOutline, RefreshOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'
import { redisMeta } from '../../../api/meta'

const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()

const props = defineProps<{
  connection: any
  selectedItem: any
  selectedItemType: string
}>()

// ── Overview ──────────────────────────────────────────────────────────────
const infoLoading = ref(false)
const infoError = ref('')
const rawInfo = ref<Record<string, string>>({})
const typeDist = ref<{ type: string; count: number; pct: number }[]>([])

const statsCards = computed(() => [
  { label: 'Redis 版本', value: rawInfo.value['redis_version'] || '—', icon: KeyOutline, cls: 'red' },
  { label: '已用内存', value: rawInfo.value['used_memory_human'] || '—', icon: ServerOutline, cls: 'yellow' },
  { label: '连接数', value: rawInfo.value['connected_clients'] || '—', icon: RefreshOutline, cls: 'green' },
  { label: '运行天数', value: rawInfo.value['uptime_in_days'] ? rawInfo.value['uptime_in_days'] + 'd' : '—', icon: PieChartOutline, cls: 'purple' }
])

const infoRows = computed(() => {
  const keys = ['redis_version', 'redis_mode', 'role', 'tcp_port', 'uptime_in_seconds', 'connected_clients',
    'used_memory_human', 'used_memory_peak_human', 'maxmemory_human', 'total_commands_processed',
    'keyspace_hits', 'keyspace_misses', 'total_keys_count']
  return keys.filter(k => rawInfo.value[k]).map(k => ({ k: k.replace(/_/g, ' '), v: rawInfo.value[k] }))
})

const loadInfo = async () => {
  if (!props.connection?.id) return
  infoLoading.value = true
  infoError.value = ''
  try {
    const res = await redisMeta.info(props.connection.id)
    rawInfo.value = res.info
    // Build typeDist from keyspace + sampled keys
    await buildTypeDist()
  } catch (e: any) {
    infoError.value = e.message || '加载失败'
  } finally {
    infoLoading.value = false
  }
}

const buildTypeDist = async () => {
  if (!props.connection?.id) return
  try {
    const res = await redisMeta.keys(props.connection.id, '*', 500)
    const typeCount: Record<string, number> = {}
    for (const k of res.keys) {
      const t = k.type || 'string'
      typeCount[t] = (typeCount[t] || 0) + 1
    }
    const total = Object.values(typeCount).reduce((a, b) => a + b, 0)
    typeDist.value = Object.entries(typeCount).map(([type, count]) => ({
      type, count, pct: total ? Math.round(count / total * 100) : 0
    })).sort((a, b) => b.count - a.count)
  } catch {
    // typeDist is optional, silently ignore
  }
}

// ── Key value ─────────────────────────────────────────────────────────────
const valueLoading = ref(false)
const valueError = ref('')
const keyDetail = ref<any>(null)
const strValue = ref('')
const hashFilter = ref('')
const editIdx = ref<number | null>(null)
const editVal = ref('')

const filteredHash = computed(() => {
  const fields: any[] = keyDetail.value?.value || []
  return hashFilter.value ? fields.filter(f => f.field.includes(hashFilter.value)) : fields
})

const formatTTL = (ttl: number) => {
  if (ttl < 60) return `${ttl}s`
  if (ttl < 3600) return `${Math.floor(ttl / 60)}m`
  return `${Math.floor(ttl / 3600)}h`
}

const loadValue = async () => {
  if (!props.selectedItem?.key || !props.connection?.id) return
  const id = props.selectedItem._connectionId || props.connection.id
  valueLoading.value = true
  valueError.value = ''
  try {
    const res = await redisMeta.value(id, props.selectedItem.key)
    keyDetail.value = res
    if (res.type === 'string') strValue.value = res.value ?? ''
  } catch (e: any) {
    valueError.value = e.message || '加载值失败'
  } finally {
    valueLoading.value = false
  }
}

const saveString = async () => {
  const id = props.selectedItem._connectionId || props.connection.id
  try {
    await redisMeta.set(id, { key: props.selectedItem.key, type: 'string', value: strValue.value, ttl: keyDetail.value?.ttl > 0 ? keyDetail.value.ttl : undefined })
    message.success('已保存')
    keyDetail.value!.value = strValue.value
  } catch (e: any) { message.error(e.message) }
}

const saveHashField = async (f: any) => {
  const id = props.selectedItem._connectionId || props.connection.id
  f.value = editVal.value
  editIdx.value = null
  try {
    await redisMeta.execute(id, `HSET ${props.selectedItem.key} ${f.field} ${f.value}`)
    message.success(`已更新字段 ${f.field}`)
  } catch (e: any) { message.error(e.message) }
}

const getId = () => props.selectedItem?._connectionId || props.connection?.id

// Hash ops
const newHashField = ref('')
const newHashValue = ref('')
const showAddHash = ref(false)

const addHashField = async () => {
  if (!newHashField.value.trim()) { showAddHash.value = true; return }
  const id = getId()
  try {
    await redisMeta.execute(id, `HSET ${props.selectedItem.key} ${newHashField.value} ${newHashValue.value}`)
    keyDetail.value!.value.push({ field: newHashField.value, value: newHashValue.value })
    message.success(`已添加字段 ${newHashField.value}`)
    newHashField.value = ''; newHashValue.value = ''; showAddHash.value = false
  } catch (e: any) { message.error(e.message) }
}

const deleteHashField = async (field: string) => {
  const id = getId()
  try {
    await redisMeta.execute(id, `HDEL ${props.selectedItem.key} ${field}`)
    keyDetail.value!.value = keyDetail.value!.value.filter((f: any) => f.field !== field)
    message.success('已删除字段 ' + field)
  } catch (e: any) { message.error(e.message) }
}

// List ops
const newListVal = ref('')
const lpush = async () => {
  const v = window.prompt('LPUSH 值:')
  if (v === null) return
  const id = getId()
  try {
    await redisMeta.execute(id, `LPUSH ${props.selectedItem.key} ${v}`)
    keyDetail.value!.value.unshift(v)
    message.success('LPUSH 成功')
  } catch (e: any) { message.error(e.message) }
}
const rpush = async () => {
  const v = window.prompt('RPUSH 值:')
  if (v === null) return
  const id = getId()
  try {
    await redisMeta.execute(id, `RPUSH ${props.selectedItem.key} ${v}`)
    keyDetail.value!.value.push(v)
    message.success('RPUSH 成功')
  } catch (e: any) { message.error(e.message) }
}
const lrem = async (v: string) => {
  dialog.warning({
    title: '删除元素', content: `删除列表中值为 "${v}" 的元素？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => {
      const id = getId()
      try {
        await redisMeta.execute(id, `LREM ${props.selectedItem.key} 1 ${v}`)
        const idx = keyDetail.value!.value.indexOf(v)
        if (idx !== -1) keyDetail.value!.value.splice(idx, 1)
        message.success('已删除元素')
      } catch (e: any) { message.error(e.message) }
    }
  })
}

// Set ops
const sadd = async () => {
  const v = window.prompt('SADD 成员:')
  if (v === null) return
  const id = getId()
  try {
    await redisMeta.execute(id, `SADD ${props.selectedItem.key} ${v}`)
    if (!keyDetail.value!.value.includes(v)) keyDetail.value!.value.push(v)
    message.success('SADD 成功')
  } catch (e: any) { message.error(e.message) }
}
const srem = async (m: string) => {
  const id = getId()
  try {
    await redisMeta.execute(id, `SREM ${props.selectedItem.key} ${m}`)
    keyDetail.value!.value = keyDetail.value!.value.filter((x: string) => x !== m)
    message.success('已移除成员')
  } catch (e: any) { message.error(e.message) }
}

// ZSet ops
const zadd = async () => {
  const score = window.prompt('Score (数字):')
  if (score === null) return
  const member = window.prompt('Member:')
  if (member === null) return
  const id = getId()
  try {
    await redisMeta.execute(id, `ZADD ${props.selectedItem.key} ${score} ${member}`)
    keyDetail.value!.value.push({ score: Number(score), member })
    keyDetail.value!.value.sort((a: any, b: any) => a.score - b.score)
    message.success('ZADD 成功')
  } catch (e: any) { message.error(e.message) }
}
const zrem = async (m: string) => {
  const id = getId()
  try {
    await redisMeta.execute(id, `ZREM ${props.selectedItem.key} ${m}`)
    keyDetail.value!.value = keyDetail.value!.value.filter((z: any) => z.member !== m)
    message.success('已移除成员')
  } catch (e: any) { message.error(e.message) }
}

const deleteKey = () => {
  dialog.warning({
    title: '删除 Key', content: `确定删除 "${props.selectedItem?.key}"？`,
    positiveText: '确定', negativeText: '取消',
    onPositiveClick: async () => {
      const id = props.selectedItem._connectionId || props.connection.id
      try {
        await redisMeta.deleteKey(id, props.selectedItem.key)
        message.success('已删除 Key')
      } catch (e: any) { message.error(e.message) }
    }
  })
}

watch(() => props.selectedItem?.key, () => {
  keyDetail.value = null
  if (props.selectedItemType === 'key' && props.selectedItem?.key) loadValue()
}, { immediate: true })

watch(() => props.connection?.id, () => {
  rawInfo.value = {}
  keyDetail.value = null
  typeDist.value = []
  loadInfo()
}, { immediate: true })
</script>

<style scoped>
.redis-workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-primary); color: var(--text-secondary); }
.spacer { flex: 1; }

/* Overview */
.overview { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.overview::-webkit-scrollbar { width: 4px; }
.overview::-webkit-scrollbar-thumb { background: var(--border-primary); border-radius: 2px; }
.overview-header { display: flex; align-items: center; justify-content: space-between; }
.ov-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); }

.error-block { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; color: var(--status-error); font-size: 12px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--bg-row-hover); border: 1px solid var(--border-primary); border-radius: 10px; }
.stat-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon.red { background: rgba(239,68,68,0.15); color: var(--status-error); }
.stat-icon.yellow { background: var(--type-binary-bg); color: var(--type-binary); }
.stat-icon.green { background: var(--accent-primary-subtle); color: var(--accent-primary); }
.stat-icon.purple { background: var(--type-date-bg); color: var(--type-date); }
.stat-val { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 11px; color: var(--text-disabled); }

.dist-panel, .info-panel {
  background: var(--bg-row-hover); border: 1px solid var(--border-secondary);
  border-radius: 10px; padding: 14px;
}
.panel-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-tertiary); margin-bottom: 10px; }
.type-bars { display: flex; flex-direction: column; gap: 7px; }
.type-bar-row { display: flex; align-items: center; gap: 10px; font-size: 11px; }
.type-label { min-width: 42px; font-weight: 700; font-size: 10px; }
.type-label.string { color: var(--status-error); } .type-label.hash { color: var(--type-binary); }
.type-label.list { color: var(--accent-primary); } .type-label.set { color: var(--type-array); } .type-label.zset { color: var(--type-date); }
.bar-bg { flex: 1; height: 5px; background: var(--border-primary); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.bar-fill.string { background: var(--status-error); } .bar-fill.hash { background: var(--type-binary); }
.bar-fill.list { background: var(--accent-primary); } .bar-fill.set { background: var(--type-array); } .bar-fill.zset { background: var(--type-date); }
.bar-count { font-size: 11px; color: var(--text-hint); min-width: 24px; text-align: right; }

.info-rows { display: flex; flex-direction: column; gap: 3px; }
.info-row { display: flex; gap: 10px; font-size: 11px; }
.info-k { color: var(--text-disabled); min-width: 160px; text-transform: capitalize; }
.info-v { color: var(--text-tertiary); font-family: monospace; }

/* Key header */
.key-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0; border-bottom: 1px solid var(--border-secondary); flex-wrap: wrap; }
.type-badge-lg { font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; flex-shrink: 0; }
.type-badge-lg.string { color: var(--status-error); background: rgba(239,68,68,0.15); }
.type-badge-lg.hash { color: var(--type-binary); background: var(--type-binary-bg); }
.type-badge-lg.list { color: var(--accent-primary); background: var(--accent-primary-subtle); }
.type-badge-lg.set { color: var(--type-array); background: var(--type-array-bg); }
.type-badge-lg.zset { color: var(--type-date); background: var(--type-date-bg); }
.key-name-lg { font-family: monospace; font-size: 13px; font-weight: 600; color: var(--text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.key-ttl-badge { font-size: 11px; padding: 2px 7px; border-radius: 4px; font-family: monospace; }
.has-ttl { color: var(--type-binary); background: var(--type-binary-bg); }
.no-ttl { color: var(--text-disabled); background: var(--bg-hover); }

.loading-center { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--text-disabled); }

/* Value editor */
.value-editor { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.val-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; flex-shrink: 0; border-bottom: 1px solid var(--border-secondary); }
.val-title { font-size: 13px; font-weight: 600; color: var(--text-tertiary); }
.val-size { font-size: 11px; color: var(--text-hint); }

.value-textarea { flex: 1; width: 100%; padding: 12px 14px; resize: none; outline: none; background: var(--code-bg); color: var(--text-secondary); font-family: 'SF Mono','Monaco',monospace; font-size: 13px; line-height: 1.6; border: none; box-sizing: border-box; }

/* Hash */
.add-hash-row { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--accent-primary-subtle); border-bottom: 1px solid var(--border-secondary); flex-shrink: 0; }
.hash-table { flex: 1; overflow-y: auto; }
.hash-header, .hash-row { display: grid; grid-template-columns: 180px 1fr 36px; align-items: center; gap: 4px; padding: 6px 14px; }
.hash-header { font-size: 10px; font-weight: 700; color: var(--text-disabled); text-transform: uppercase; border-bottom: 1px solid var(--border-secondary); }
.hash-row { border-bottom: 1px solid var(--border-secondary); cursor: pointer; font-size: 12px; }
.hash-row:hover { background: var(--type-binary-bg); }
.hash-row code { font-family: monospace; font-size: 11px; color: var(--type-binary); }
.field-val { color: var(--text-tertiary); font-family: monospace; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }

/* List */
.list-table { flex: 1; overflow-y: auto; }
.list-header, .list-row { display: grid; grid-template-columns: 56px 1fr 36px; align-items: center; gap: 4px; padding: 6px 14px; }
.list-header { font-size: 10px; font-weight: 700; color: var(--text-disabled); text-transform: uppercase; border-bottom: 1px solid var(--border-secondary); }
.list-row { border-bottom: 1px solid var(--border-secondary); font-size: 12px; }
.list-row:hover { background: var(--accent-primary-subtle); }
.idx-badge { font-size: 10px; color: var(--accent-primary); background: var(--accent-primary-subtle); padding: 1px 5px; border-radius: 3px; }
.list-val { color: var(--text-secondary); font-family: monospace; font-size: 12px; }

/* Set */
.set-grid { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }
.set-item { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--type-array-bg); border: 1px solid var(--border-secondary); border-radius: 16px; font-size: 12px; color: var(--type-array); }

/* ZSet */
.zset-table { flex: 1; overflow-y: auto; }
.zset-header, .zset-row { display: grid; grid-template-columns: 56px 100px 1fr 36px; align-items: center; gap: 4px; padding: 6px 14px; }
.zset-header { font-size: 10px; font-weight: 700; color: var(--text-disabled); text-transform: uppercase; border-bottom: 1px solid var(--border-secondary); }
.zset-row { border-bottom: 1px solid var(--border-secondary); font-size: 12px; }
.zset-row:hover { background: var(--type-date-bg); }
.rank-badge { font-size: 10px; color: var(--text-quaternary); background: var(--bg-hover); padding: 1px 5px; border-radius: 3px; }
.score-val { font-family: monospace; font-size: 12px; color: var(--type-date); font-weight: 600; }
.member-val { color: var(--text-secondary); font-family: monospace; font-size: 12px; }
</style>
