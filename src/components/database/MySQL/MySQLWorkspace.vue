<template>
  <div class="mysql-workspace" :class="{ 'light-mode': !isDarkTheme }">

    <!-- No item selected: default SQL editor -->
    <template v-if="!selectedItem || selectedItemType === 'query'">
      <SqlEditor :connection="connection" :db-type="'mysql'" />
    </template>

    <!-- Table selected: tabbed view -->
    <template v-else-if="selectedItemType === 'table' || selectedItemType === 'view'">
      <div class="tab-bar">
        <div
          v-for="tab in tabs" :key="tab.key"
          class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <n-icon :size="13">
            <component :is="tab.icon" />
          </n-icon>
          {{ tab.label }}
        </div>
      </div>

      <!-- Tab: Browse Data -->
      <div v-if="activeTab === 'browse'" class="tab-content">
        <TableBrowse :table="selectedItem" :connection="connection" />
      </div>

      <!-- Tab: Schema -->
      <div v-else-if="activeTab === 'schema'" class="tab-content">
        <TableSchema :table="selectedItem" :connection="connection" />
      </div>

      <!-- Tab: SQL Query -->
      <div v-else-if="activeTab === 'sql'" class="tab-content">
        <SqlEditor :connection="connection" :db-type="'mysql'" :initial-sql="`SELECT * FROM \`${selectedItem?.name}\` LIMIT 100;`" />
      </div>

      <!-- Tab: Indexes -->
      <div v-else-if="activeTab === 'indexes'" class="tab-content">
        <TableIndexes :table="selectedItem" />
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon, NButton, NTag, NInput, NSelect, NDataTable, NSpace, NEmpty, NTooltip, useMessage, useDialog } from 'naive-ui'
import {
  GridOutline, ListOutline, CodeSlashOutline, CreateOutline, TrashOutline,
  AddOutline, SaveOutline, RefreshOutline, DownloadOutline, SearchOutline,
  ChevronBackOutline, ChevronForwardOutline, FilterOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../../../stores/settings'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  connection: any
  selectedItem: any
  selectedItemType: string
}>()

const activeTab = ref('browse')

const tabs = [
  { key: 'browse', label: '数据浏览', icon: GridOutline },
  { key: 'schema', label: '表结构', icon: ListOutline },
  { key: 'sql', label: 'SQL 查询', icon: CodeSlashOutline },
  { key: 'indexes', label: '索引', icon: FilterOutline }
]

watch(() => props.selectedItem, () => { activeTab.value = 'browse' })

// ─── Sub-components defined inline ──────────────────────────────────────────

// SQL Editor
const SqlEditor = defineComponent({
  props: { connection: Object, dbType: String, initialSql: { type: String, default: '-- Write SQL here\nSELECT 1;' } },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const sql = ref(p.initialSql)
    const running = ref(false)
    const resultData = ref<any[]>([])
    const resultCols = ref<any[]>([])
    const resultTime = ref(0)
    const activeResultTab = ref('result')

    const runQuery = async () => {
      if (!sql.value.trim()) return
      running.value = true
      await new Promise(r => setTimeout(r, 400))
      resultCols.value = [
        { title: 'id', key: 'id', width: 80 },
        { title: 'username', key: 'username', width: 140 },
        { title: 'email', key: 'email', width: 200 },
        { title: 'role', key: 'role', width: 100 },
        { title: 'created_at', key: 'created_at', width: 160 }
      ]
      resultData.value = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        username: `user_${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i === 0 ? 'admin' : 'user',
        created_at: '2024-01-0' + (i + 1) + ' 10:00:00'
      }))
      resultTime.value = Math.floor(Math.random() * 80) + 10
      running.value = false
      message.success(`查询成功，${resultData.value.length} 行，耗时 ${resultTime.value}ms`)
    }

    return () => h('div', { class: ['sql-editor-wrap', !isDark.value && 'light-mode'] }, [
      // Toolbar
      h('div', { class: 'sql-toolbar' }, [
        h(NButton, { size: 'small', type: 'primary', loading: running.value, onClick: runQuery }, {
          default: () => '执行 (⌘↵)',
          icon: () => h(NIcon, null, { default: () => h(CodeSlashOutline) })
        }),
        h(NButton, { size: 'small', onClick: () => { sql.value = '' } }, { default: () => '清空' }),
        h('div', { class: 'sql-spacer' }),
        h('span', { class: 'sql-hint' }, `${p.connection?.config?.database || 'no db'} · MySQL`)
      ]),
      // Editor area
      h('div', { class: 'sql-area-wrap' }, [
        h('textarea', {
          class: 'sql-textarea',
          value: sql.value,
          onInput: (e: any) => { sql.value = e.target.value },
          placeholder: '-- 输入 SQL 查询...\nSELECT * FROM users LIMIT 100;',
          spellcheck: false
        })
      ]),
      // Results
      h('div', { class: 'sql-results' }, [
        h('div', { class: 'result-tabs' }, [
          h('div', { class: ['rt', activeResultTab.value === 'result' && 'active'], onClick: () => { activeResultTab.value = 'result' } }, [
            h(NIcon, null, { default: () => h(GridOutline) }), ' 结果集'
          ]),
          resultData.value.length ? h('span', { class: 'result-meta' }, `${resultData.value.length} 行 · ${resultTime.value}ms`) : null
        ]),
        resultData.value.length
          ? h(NDataTable, { columns: resultCols.value, data: resultData.value, size: 'small', maxHeight: 220, class: 'result-table', striped: true })
          : h('div', { class: 'result-empty' }, [
              h(NEmpty, { description: '执行查询后显示结果', size: 'small' })
            ])
      ])
    ])
  }
})

// Table Browse
const TableBrowse = defineComponent({
  props: { table: Object, connection: Object },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const filterText = ref('')
    const rows = ref<any[]>([])
    const cols = ref<any[]>([])

    const loadRows = async () => {
      if (!p.table) return
      loading.value = true
      await new Promise(r => setTimeout(r, 300))
      // Generate mock columns from table def
      cols.value = p.table.columns?.map((c: any) => ({
        title: c.name,
        key: c.name,
        width: c.name === 'id' ? 70 : c.type?.startsWith('VARCHAR') ? 160 : 120,
        ellipsis: { tooltip: true },
        render: (row: any) => {
          const v = row[c.name]
          if (c.isPrimary) return h('span', { style: 'color:#f0a020;font-family:monospace' }, String(v))
          if (c.type?.includes('TIMESTAMP') || c.type?.includes('DATE')) return h('span', { style: 'color:#60a5fa;font-size:11px' }, String(v))
          return h('span', null, String(v ?? 'NULL'))
        }
      })) || []
      total.value = p.table.rows || 0
      rows.value = Array.from({ length: Math.min(pageSize.value, 20) }, (_, i) => {
        const row: any = {}
        p.table.columns?.forEach((c: any) => {
          if (c.name === 'id') row[c.name] = (page.value - 1) * pageSize.value + i + 1
          else if (c.name === 'username') row[c.name] = `user_${i + 1}`
          else if (c.name === 'email') row[c.name] = `user${i + 1}@mail.com`
          else if (c.name === 'role') row[c.name] = i === 0 ? 'admin' : 'user'
          else if (c.name === 'status') row[c.name] = ['pending','paid','shipped'][i % 3]
          else if (c.type?.includes('INT')) row[c.name] = Math.floor(Math.random() * 1000)
          else if (c.type?.includes('DECIMAL')) row[c.name] = (Math.random() * 500).toFixed(2)
          else if (c.type?.includes('TIMESTAMP')) row[c.name] = '2024-0' + (i % 9 + 1) + '-01 10:00:00'
          else row[c.name] = `value_${i}`
        })
        return row
      })
      loading.value = false
    }

    watch(() => p.table, loadRows, { immediate: true })

    return () => h('div', { class: ['table-browse', !isDark.value && 'light-mode'] }, [
      // Toolbar
      h('div', { class: 'browse-toolbar' }, [
        h(NInput, { size: 'small', placeholder: '过滤...', value: filterText.value, onInput: (v: string) => { filterText.value = v }, clearable: true, style: 'width:200px' }, {
          prefix: () => h(NIcon, { size: 12 }, { default: () => h(SearchOutline) })
        }),
        h('div', { style: 'flex:1' }),
        h(NButton, { size: 'small', onClick: loadRows }, { default: () => '刷新', icon: () => h(NIcon, null, { default: () => h(RefreshOutline) }) }),
        h(NButton, { size: 'small' }, { default: () => '新增行', icon: () => h(NIcon, null, { default: () => h(AddOutline) }) }),
        h(NButton, { size: 'small' }, { default: () => '导出', icon: () => h(NIcon, null, { default: () => h(DownloadOutline) }) })
      ]),
      // Table
      h(NDataTable, {
        columns: cols.value,
        data: rows.value,
        loading: loading.value,
        size: 'small',
        maxHeight: 'calc(100vh - 280px)',
        striped: true,
        class: 'data-table',
        rowKey: (r: any) => r.id,
        pagination: false
      }),
      // Pagination bar
      h('div', { class: 'browse-pagination' }, [
        h('span', { class: 'pg-info' }, `共 ${total.value.toLocaleString()} 行`),
        h('div', { style: 'flex:1' }),
        h(NButton, { text: true, size: 'tiny', onClick: () => { if (page.value > 1) { page.value--; loadRows() } } }, {
          icon: () => h(NIcon, null, { default: () => h(ChevronBackOutline) })
        }),
        h('span', { class: 'pg-num' }, `第 ${page.value} 页`),
        h(NButton, { text: true, size: 'tiny', onClick: () => { page.value++; loadRows() } }, {
          icon: () => h(NIcon, null, { default: () => h(ChevronForwardOutline) })
        }),
      ])
    ])
  }
})

// Table Schema editor
const TableSchema = defineComponent({
  props: { table: Object, connection: Object },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const cols = computed(() => p.table?.columns || [])
    const editingIdx = ref<number | null>(null)

    const dropColumn = (name: string) => {
      dialog.warning({
        title: '删除字段',
        content: `确定要删除字段 "${name}" 吗？此操作不可撤销。`,
        positiveText: '确定删除', negativeText: '取消',
        onPositiveClick: () => message.success(`已删除字段 ${name}`)
      })
    }

    return () => h('div', { class: ['table-schema', !isDark.value && 'light-mode'] }, [
      h('div', { class: 'schema-toolbar' }, [
        h('span', { class: 'schema-title' }, `${p.table?.name} · ${cols.value.length} 个字段`),
        h('div', { style: 'flex:1' }),
        h(NButton, { size: 'small', type: 'primary' }, { default: () => '添加字段', icon: () => h(NIcon, null, { default: () => h(AddOutline) }) }),
        h(NButton, { size: 'small' }, { default: () => '保存更改', icon: () => h(NIcon, null, { default: () => h(SaveOutline) }) })
      ]),
      // Column list
      h('div', { class: 'schema-cols' }, [
        h('div', { class: 'schema-col-header' }, [
          h('span', { class: 'col-h pk' }, 'PK'),
          h('span', { class: 'col-h name' }, '字段名'),
          h('span', { class: 'col-h type' }, '类型'),
          h('span', { class: 'col-h nn' }, 'NOT NULL'),
          h('span', { class: 'col-h ai' }, 'AUTO_INCREMENT'),
          h('span', { class: 'col-h comment' }, '注释'),
          h('span', { class: 'col-h actions' }, '操作')
        ]),
        ...cols.value.map((col: any, i: number) =>
          h('div', { class: ['schema-col-row', col.isPrimary && 'is-pk', editingIdx.value === i && 'is-editing'], key: col.name }, [
            h('span', { class: 'col-h pk' }, col.isPrimary ? '🔑' : ''),
            h('span', { class: 'col-h name col-name-val' }, col.name),
            h('span', { class: 'col-h type' }, [h('code', { class: 'type-badge' }, col.type)]),
            h('span', { class: 'col-h nn' }, h('span', { class: col.notNull ? 'nn-yes' : 'nn-no' }, col.notNull ? '✓' : '—')),
            h('span', { class: 'col-h ai' }, h('span', { class: col.autoIncrement ? 'nn-yes' : 'nn-no' }, col.autoIncrement ? '✓' : '—')),
            h('span', { class: 'col-h comment' }, h('span', { class: 'comment-text' }, col.comment || '—')),
            h('span', { class: 'col-h actions' }, [
              h(NButton, { text: true, size: 'tiny', onClick: () => { editingIdx.value = i; message.info('编辑字段: ' + col.name) } }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
              h(NButton, { text: true, size: 'tiny', onClick: () => dropColumn(col.name) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
            ])
          ])
        )
      ])
    ])
  }
})

// Table Indexes
const TableIndexes = defineComponent({
  props: { table: Object },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const indexes = computed(() => p.table?.indexes || [])
    return () => h('div', { class: ['table-indexes', !isDark.value && 'light-mode'] }, [
      h('div', { class: 'idx-toolbar' }, [
        h('span', { class: 'idx-title' }, `${p.table?.name} · ${indexes.value.length} 个索引`),
        h('div', { style: 'flex:1' }),
        h(NButton, { size: 'small', type: 'primary' }, { default: () => '新建索引', icon: () => h(NIcon, null, { default: () => h(AddOutline) }) })
      ]),
      h('div', { class: 'idx-list' }, [
        h('div', { class: 'idx-header' }, [
          h('span', { class: 'idx-h name' }, '索引名'),
          h('span', { class: 'idx-h type' }, '类型'),
          h('span', { class: 'idx-h unique' }, 'UNIQUE'),
          h('span', { class: 'idx-h cols' }, '字段'),
          h('span', { class: 'idx-h actions' }, '操作')
        ]),
        ...indexes.value.map((idx: any) =>
          h('div', { class: 'idx-row', key: idx.name }, [
            h('span', { class: 'idx-h name' }, [
              idx.name === 'PRIMARY' ? h('span', { class: 'pk-badge' }, 'PRIMARY') : h('code', null, idx.name)
            ]),
            h('span', { class: 'idx-h type' }, [h('code', { class: 'type-sm' }, idx.type)]),
            h('span', { class: 'idx-h unique' }, h('span', { class: idx.unique ? 'nn-yes' : '' }, idx.unique ? '✓' : '—')),
            h('span', { class: 'idx-h cols' }, [h('code', { class: 'col-badge' }, idx.columns.join(', '))]),
            h('span', { class: 'idx-h actions' }, idx.name !== 'PRIMARY' ? [
              h(NButton, { text: true, size: 'tiny' }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
            ] : [])
          ])
        )
      ])
    ])
  }
})
</script>

<style>
/* ── Workspace shell ── */
.mysql-workspace {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  background: #13131a; color: rgba(255,255,255,0.85);
}
.mysql-workspace.light-mode { background: #f5f5f8; color: rgba(0,0,0,0.85); }

.tab-bar {
  display: flex; align-items: center; height: 38px; flex-shrink: 0;
  background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 12px; gap: 2px;
}
.mysql-workspace.light-mode .tab-bar { background: rgba(0,0,0,0.04); border-bottom-color: rgba(0,0,0,0.07); }

.tab-btn {
  display: flex; align-items: center; gap: 5px; padding: 0 12px; height: 100%;
  font-size: 12px; cursor: pointer; border-bottom: 2px solid transparent;
  color: rgba(255,255,255,0.5); transition: all 0.15s; white-space: nowrap;
}
.tab-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); }
.tab-btn.active { color: #4db8ff; border-bottom-color: #4db8ff; }
.mysql-workspace.light-mode .tab-btn { color: rgba(0,0,0,0.5); }
.mysql-workspace.light-mode .tab-btn:hover { color: rgba(0,0,0,0.85); background: rgba(0,0,0,0.04); }
.mysql-workspace.light-mode .tab-btn.active { color: #0070c0; border-bottom-color: #0070c0; }

.tab-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

/* ── SQL Editor ── */
.sql-editor-wrap {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.sql-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sql-editor-wrap.light-mode .sql-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.sql-spacer { flex: 1; }
.sql-hint { font-size: 11px; color: rgba(255,255,255,0.3); }
.sql-editor-wrap.light-mode .sql-hint { color: rgba(0,0,0,0.3); }

.sql-area-wrap { flex: 1; overflow: hidden; min-height: 140px; }
.sql-textarea {
  width: 100%; height: 100%; padding: 12px 14px; resize: none; outline: none;
  background: #1a1a24; color: #e0e0e0; font-family: 'SF Mono','Monaco','Consolas',monospace;
  font-size: 13px; line-height: 1.6; border: none; box-sizing: border-box;
}
.sql-editor-wrap.light-mode .sql-textarea { background: #fff; color: #1a1a1a; }

.sql-results { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06); }
.sql-editor-wrap.light-mode .sql-results { border-top-color: rgba(0,0,0,0.07); }

.result-tabs {
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px; height: 34px; background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.sql-editor-wrap.light-mode .result-tabs { background: rgba(0,0,0,0.03); border-bottom-color: rgba(0,0,0,0.05); }

.rt {
  display: flex; align-items: center; gap: 5px; font-size: 12px;
  color: rgba(255,255,255,0.5); cursor: pointer; padding: 0 6px; height: 100%;
  border-bottom: 2px solid transparent;
}
.rt.active { color: #4db8ff; border-bottom-color: #4db8ff; }
.result-meta { font-size: 11px; color: rgba(255,255,255,0.3); margin-left: 8px; }

.result-empty { display: flex; align-items: center; justify-content: center; height: 80px; }
.result-table { font-size: 12px; }

/* ── Browse ── */
.table-browse { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.browse-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.table-browse.light-mode .browse-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.data-table { flex: 1; }
.browse-pagination {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  border-top: 1px solid rgba(255,255,255,0.06); height: 36px; flex-shrink: 0;
}
.table-browse.light-mode .browse-pagination { border-top-color: rgba(0,0,0,0.06); }
.pg-info { font-size: 12px; color: rgba(255,255,255,0.4); }
.table-browse.light-mode .pg-info { color: rgba(0,0,0,0.4); }
.pg-num { font-size: 12px; color: rgba(255,255,255,0.6); padding: 0 4px; }
.table-browse.light-mode .pg-num { color: rgba(0,0,0,0.6); }

/* ── Schema ── */
.table-schema { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.schema-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.table-schema.light-mode .schema-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.schema-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.table-schema.light-mode .schema-title { color: rgba(0,0,0,0.8); }

.schema-cols { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
.schema-col-header, .schema-col-row {
  display: grid;
  grid-template-columns: 32px 160px 200px 90px 120px 1fr 70px;
  align-items: center; gap: 4px; padding: 6px 8px;
  border-radius: 4px;
}
.schema-col-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
.table-schema.light-mode .schema-col-header { color: rgba(0,0,0,0.3); }
.schema-col-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
.schema-col-row:hover { background: rgba(255,255,255,0.03); }
.table-schema.light-mode .schema-col-row { border-bottom-color: rgba(0,0,0,0.05); }
.schema-col-row.is-pk { background: rgba(240,160,32,0.05); }

.col-name-val { font-weight: 500; color: rgba(255,255,255,0.85); font-family: monospace; font-size: 12px; }
.table-schema.light-mode .col-name-val { color: rgba(0,0,0,0.85); }
.type-badge { font-size: 11px; color: #4db8ff; background: rgba(77,184,255,0.1); padding: 1px 6px; border-radius: 3px; font-family: monospace; }
.nn-yes { color: #18a058; font-weight: 700; }
.nn-no { color: rgba(255,255,255,0.2); }
.table-schema.light-mode .nn-no { color: rgba(0,0,0,0.2); }
.comment-text { font-size: 11px; color: rgba(255,255,255,0.4); }
.table-schema.light-mode .comment-text { color: rgba(0,0,0,0.4); }

/* ── Indexes ── */
.table-indexes { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.idx-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.table-indexes.light-mode .idx-toolbar { border-bottom-color: rgba(0,0,0,0.06); }
.idx-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.table-indexes.light-mode .idx-title { color: rgba(0,0,0,0.8); }

.idx-list { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
.idx-header, .idx-row {
  display: grid; grid-template-columns: 220px 80px 70px 1fr 60px;
  align-items: center; gap: 4px; padding: 7px 8px; border-radius: 4px;
}
.idx-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.table-indexes.light-mode .idx-header { color: rgba(0,0,0,0.3); }
.idx-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; font-size: 12px; }
.idx-row:hover { background: rgba(255,255,255,0.03); }
.table-indexes.light-mode .idx-row { border-bottom-color: rgba(0,0,0,0.04); }
.pk-badge { color: #f0a020; font-weight: 700; font-size: 11px; }
.type-sm { font-size: 11px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 3px; }
.col-badge { font-size: 11px; color: #a78bfa; background: rgba(167,139,250,0.1); padding: 1px 6px; border-radius: 3px; font-family: monospace; }
</style>
