<template>
  <div class="mysql-workspace" :class="{ 'light-mode': !isDarkTheme }">

    <!-- No item selected: default SQL editor -->
    <template v-if="!selectedItem || selectedItemType === 'query'">
      <SqlEditor :connection="connection" :db-type="'mysql'" :active-db="activeDb" />
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
        <SqlEditor :connection="connection" :db-type="'mysql'" :active-db="activeDb" :initial-sql="`SELECT * FROM \`${selectedItem?.name}\` LIMIT 100;`" />
      </div>

      <!-- Tab: Indexes -->
      <div v-else-if="activeTab === 'indexes'" class="tab-content">
        <TableIndexes :table="selectedItem" :connection="connection" />
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h } from 'vue'
import { NIcon, NButton, NInput, NSelect, NDataTable, NEmpty, NSpin, NAlert, NModal, NCard, useMessage, useDialog } from 'naive-ui'
import {
  GridOutline, ListOutline, CodeSlashOutline, CreateOutline, TrashOutline,
  AddOutline, RefreshOutline, DownloadOutline, ChevronBackOutline,
  ChevronForwardOutline, FilterOutline, CloseOutline, PlayCircleOutline
} from '@vicons/ionicons5'
import { mysqlMeta } from '../../../api/meta'
import { format } from 'sql-formatter'
import { Parser } from 'node-sql-parser'
import { useSettingsStore } from '../../../stores/settings'

const mysqlParser = new Parser()

const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const props = defineProps<{
  connection: any
  selectedItem: any
  selectedItemType: string
  activeDb: string
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
  props: { connection: Object, dbType: String, initialSql: { type: String, default: '-- Write SQL here\nSELECT 1;' }, activeDb: { type: String, default: '' as string } },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const sql = ref(p.initialSql)
    const running = ref(false)
    const resultData = ref<any[]>([])
    const resultCols = ref<any[]>([])
    const resultTime = ref(0)
    const resultError = ref('')
    const activeResultTab = ref('result')
    let _textareaEl: HTMLTextAreaElement | null = null

    const currentDb = () => p.activeDb || p.connection?.config?.database || ''

    const getSelectedSql = (): string => {
      const el = _textareaEl
      if (!el) return sql.value
      const start = el.selectionStart
      const end = el.selectionEnd
      if (start !== end) return sql.value.slice(start, end)
      return sql.value
    }

    const runQuery = async () => {
      const raw = getSelectedSql().trim()
      if (!raw || !p.connection?.id) return
      const db = currentDb()
      if (!db) { message.warning('请先在左侧选择数据库'); return }
      running.value = true
      resultError.value = ''
      resultData.value = []
      resultCols.value = []
      resultTime.value = 0
      try {
        let statements: string[] = [raw]
        try {
          const ast = mysqlParser.astify(raw, { database: 'MySQL' })
          const list = Array.isArray(ast) ? ast : [ast]
          statements = list.map((node: any) => {
            const sql = mysqlParser.sqlify(node, { database: 'MySQL' })
            return sql.trim()
          }).filter(Boolean)
        } catch {
          // 解析失败时降级为正则拆分
          statements = raw.split(/;/).map(s => s.trim()).filter(s => s && !s.startsWith('--') && !s.startsWith('/*'))
        }
        let lastTime = 0
        if (statements.length > 1) {
          // 多语句：逐条执行，只显示最后一条结果
          for (const stmt of statements) {
            const res = await mysqlMeta.execute(p.connection.id, stmt, db)
            lastTime = res.executionTime || 0
            if (res.error) throw new Error(res.error)
          }
          resultTime.value = lastTime
          message.success(`执行成功，共 ${statements.length} 条语句`)
        } else {
          const res = await mysqlMeta.execute(p.connection.id, raw, db)
          resultTime.value = res.executionTime || 0
          if (res.error) throw new Error(res.error)
          const rows: any[] = Array.isArray(res.data) ? res.data : (res.data?.rows || [])
          resultData.value = rows
          if (rows.length) {
            resultCols.value = Object.keys(rows[0]).map(k => ({
              title: k, key: k, width: 140, ellipsis: { tooltip: true },
              render: (row: any) => {
                const v = row[k]
                if (v === null || v === undefined) return h('span', { style: 'color:rgba(255,255,255,0.25);font-style:italic' }, 'NULL')
                return h('span', null, String(v))
              }
            }))
          }
          message.success(`执行成功，${rows.length} 行，耗时 ${resultTime.value}ms`)
        }
      } catch (e: any) {
        resultError.value = e?.response?.data?.error || e.message || '执行失败'
        message.error(`执行失败: ${resultError.value}`)
      } finally {
        running.value = false
      }
    }

    const formatSql = () => {
      if (!sql.value.trim()) return
      sql.value = format(sql.value, { language: 'mysql', tabWidth: 2 })
    }

    return () => h('div', { class: ['sql-editor-wrap', !isDark.value && 'light-mode'] }, [
      // Toolbar
      h('div', { class: 'sql-toolbar' }, [
        h(NButton, { size: 'small', type: 'primary', loading: running.value, onClick: runQuery }, {
          default: () => '执行 (⌘↵)',
          icon: () => h(NIcon, null, { default: () => h(PlayCircleOutline) })
        }),
        h(NButton, { size: 'small', onClick: () => { sql.value = '' } }, { default: () => '清空' }),
        h('div', { class: 'sql-spacer' }),
        h(NButton, { size: 'small', onClick: formatSql }, { default: () => '格式化' }),
        h('span', { class: 'sql-hint' }, `${currentDb() || 'no db'} · MySQL`)
      ]),
      // Editor area
      h('div', { class: 'sql-area-wrap' }, [
        h('textarea', {
          class: 'sql-textarea',
          ref: (el: any) => { _textareaEl = el },
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
        resultError.value
          ? h(NAlert, { type: 'error', style: 'margin:8px;font-size:12px' }, { default: () => resultError.value })
          : resultData.value.length
            ? h(NDataTable, { columns: resultCols.value, data: resultData.value, size: 'small', maxHeight: 220, class: 'result-table', striped: true, scrollX: resultCols.value.length * 140 })
            : h('div', { class: 'result-empty' }, [h(NEmpty, { description: '执行查询后显示结果', size: 'small' })])
      ])
    ])
  }
})

// Table Browse — full row CRUD
const TableBrowse = defineComponent({
  props: { table: Object, connection: Object },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const loading = ref(false)
    const saving = ref(false)
    const error = ref('')
    const page = ref(1)
    const pageSize = ref(50)
    const total = ref(0)
    const rows = ref<any[]>([])
    const fields = ref<any[]>([]) // raw field defs from API
    const cols = ref<any[]>([])

    // editing state
    const editingRow = ref<any>(null)   // original row being edited
    const editingData = ref<any>({})    // mutable copy
    const showEditModal = ref(false)
    const showInsertModal = ref(false)
    const insertData = ref<any>({})

    const dbName = () => p.table?._db || p.connection?.config?.database
    const tblFull = () => {
      const db = dbName()
      return db ? `\`${db}\`.\`${p.table?.name}\`` : `\`${p.table?.name}\``
    }

    const loadRows = async () => {
      if (!p.table || !p.connection?.id) return
      loading.value = true; error.value = ''
      try {
        const res = await mysqlMeta.tableData(p.connection.id, p.table.name, dbName(), page.value, pageSize.value)
        total.value = res.total || 0
        rows.value = res.rows || []
        fields.value = res.fields || []
        buildCols(res.fields || [])
      } catch (e: any) {
        error.value = e?.response?.data?.error || e.message
        message.error('加载失败: ' + error.value)
      } finally { loading.value = false }
    }

    const buildCols = (flds: any[]) => {
      const dataCols = (flds.length ? flds : (rows.value.length ? Object.keys(rows.value[0]).map(k => ({ name: k })) : [])).map((f: any) => ({
        title: f.name, key: f.name,
        width: f.name === 'id' ? 70 : 140,
        ellipsis: { tooltip: true },
        render: (row: any) => {
          const v = row[f.name]
          if (v === null || v === undefined) return h('span', { class: 'null-val' }, 'NULL')
          if (f.name === 'id') return h('span', { class: 'id-val' }, String(v))
          return h('span', null, String(v))
        }
      }))
      // action column
      const actCol = {
        title: '操作', key: '__actions', width: 90, fixed: 'right' as const,
        render: (row: any) => h('div', { class: 'row-actions' }, [
          h(NButton, { text: true, size: 'tiny', onClick: () => { editingRow.value = row; editingData.value = { ...row }; showEditModal.value = true } }, {
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
          }),
          h(NButton, { text: true, size: 'tiny', type: 'error', onClick: () => confirmDeleteRow(row) }, {
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
          })
        ])
      }
      cols.value = [...dataCols, actCol]
    }

    const confirmDeleteRow = (row: any) => {
      const pk = findPK(row)
      dialog.warning({
        title: '删除行', content: `确定删除此行？${pk ? `（${pk.col} = ${pk.val}）` : ''}`,
        positiveText: '删除', negativeText: '取消',
        onPositiveClick: () => deleteRow(row)
      })
    }

    const findPK = (row: any) => {
      if (row.id !== undefined) return { col: 'id', val: row.id }
      const pkField = fields.value.find((f: any) => f.name === 'id' || f.key === 'PRI')
      if (pkField) return { col: pkField.name, val: row[pkField.name] }
      const first = Object.keys(row)[0]
      return first ? { col: first, val: row[first] } : null
    }

    const buildWhereClause = (row: any) => {
      const pk = findPK(row)
      if (!pk) return ''
      return `WHERE \`${pk.col}\` = ${typeof pk.val === 'string' ? `'${pk.val.replace(/'/g, "''")}'` : pk.val}`
    }

    const deleteRow = async (row: any) => {
      const where = buildWhereClause(row)
      if (!where) { message.error('无法确定主键，无法删除'); return }
      saving.value = true
      try {
        const sql = `DELETE FROM ${tblFull()} ${where} LIMIT 1`
        const res = await mysqlMeta.execute(p.connection!.id, sql)
        if (res.error) throw new Error(res.error)
        message.success('已删除')
        rows.value = rows.value.filter(r => r !== row)
        total.value = Math.max(0, total.value - 1)
      } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
      finally { saving.value = false }
    }

    const saveEdit = async () => {
      const where = buildWhereClause(editingRow.value)
      if (!where) { message.error('无法确定主键，无法更新'); return }
      const setClauses = Object.keys(editingData.value)
        .filter(k => editingData.value[k] !== editingRow.value[k])
        .map(k => {
          const v = editingData.value[k]
          return `\`${k}\` = ${v === null || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`}`
        })
      if (!setClauses.length) { showEditModal.value = false; return }
      saving.value = true
      try {
        const sql = `UPDATE ${tblFull()} SET ${setClauses.join(', ')} ${where}`
        const res = await mysqlMeta.execute(p.connection!.id, sql)
        if (res.error) throw new Error(res.error)
        Object.assign(editingRow.value, editingData.value)
        showEditModal.value = false
        message.success('已更新')
      } catch (e: any) { message.error('更新失败: ' + (e?.response?.data?.error || e.message)) }
      finally { saving.value = false }
    }

    const openInsert = () => {
      insertData.value = {}
      fields.value.forEach((f: any) => { insertData.value[f.name] = '' })
      showInsertModal.value = true
    }

    const saveInsert = async () => {
      const flds = Object.keys(insertData.value).filter(k => insertData.value[k] !== '' && insertData.value[k] !== null)
      if (!flds.length) { message.warning('请至少填写一个字段'); return }
      const colPart = flds.map(k => `\`${k}\``).join(', ')
      const valPart = flds.map(k => `'${String(insertData.value[k]).replace(/'/g, "''")}'`).join(', ')
      saving.value = true
      try {
        const sql = `INSERT INTO ${tblFull()} (${colPart}) VALUES (${valPart})`
        const res = await mysqlMeta.execute(p.connection!.id, sql)
        if (res.error) throw new Error(res.error)
        showInsertModal.value = false
        message.success('插入成功')
        loadRows()
      } catch (e: any) { message.error('插入失败: ' + (e?.response?.data?.error || e.message)) }
      finally { saving.value = false }
    }

    const exportCSV = () => {
      if (!rows.value.length) { message.warning('无数据可导出'); return }
      const header = Object.keys(rows.value[0]).join(',')
      const body = rows.value.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([header + '\n' + body], { type: 'text/csv' })),
        download: `${p.table?.name || 'data'}.csv`
      })
      a.click()
      message.success('已导出 CSV')
    }

    watch(() => [p.table?.name, p.table?._db], () => { page.value = 1; loadRows() }, { immediate: true })

    const modalFields = computed(() => fields.value.length ? fields.value : (rows.value.length ? Object.keys(rows.value[0]).map(k => ({ name: k })) : []))

    return () => h('div', { class: ['table-browse', !isDark.value && 'light-mode'] }, [
      // Toolbar
      h('div', { class: 'browse-toolbar' }, [
        h('span', { class: 'browse-title' }, `${p.table?.name || ''}  ·  ${total.value.toLocaleString()} 行`),
        h('div', { style: 'flex:1' }),
        h(NButton, { size: 'small', type: 'primary', onClick: openInsert },
          { default: () => '新增行', icon: () => h(NIcon, null, { default: () => h(AddOutline) }) }),
        h(NButton, { size: 'small', onClick: loadRows, loading: loading.value },
          { default: () => '刷新', icon: () => h(NIcon, null, { default: () => h(RefreshOutline) }) }),
        h(NButton, { size: 'small', onClick: exportCSV },
          { default: () => '导出 CSV', icon: () => h(NIcon, null, { default: () => h(DownloadOutline) }) }),
      ]),
      error.value ? h(NAlert, { type: 'error', title: '加载失败', style: 'margin:8px 12px;font-size:12px' }, { default: () => error.value }) : null,
      h(NDataTable, {
        columns: cols.value, data: rows.value, loading: loading.value,
        size: 'small', maxHeight: 'calc(100vh - 285px)', striped: true,
        pagination: false, scrollX: (cols.value.length) * 140
      }),
      h('div', { class: 'browse-pagination' }, [
        h('span', { class: 'pg-info' }, `共 ${total.value.toLocaleString()} 行 · 每页 ${pageSize.value}`),
        h('div', { style: 'flex:1' }),
        h(NButton, { text: true, size: 'tiny', disabled: page.value <= 1, onClick: () => { page.value--; loadRows() } },
          { icon: () => h(NIcon, null, { default: () => h(ChevronBackOutline) }) }),
        h('span', { class: 'pg-num' }, `第 ${page.value} 页`),
        h(NButton, { text: true, size: 'tiny', disabled: rows.value.length < pageSize.value, onClick: () => { page.value++; loadRows() } },
          { icon: () => h(NIcon, null, { default: () => h(ChevronForwardOutline) }) }),
      ]),

      // ── Edit Modal ──
      h(NModal, { show: showEditModal.value, 'onUpdate:show': (v: boolean) => { showEditModal.value = v } }, {
        default: () => h(NCard, {
          title: `编辑行 — ${p.table?.name}`, style: 'width:520px;max-height:80vh;overflow-y:auto',
          bordered: false, size: 'small',
          headerExtra: () => h(NButton, { text: true, onClick: () => { showEditModal.value = false } }, { icon: () => h(NIcon, null, { default: () => h(CloseOutline) }) })
        }, {
          default: () => h('div', { class: 'form-grid' }, [
            ...modalFields.value.map((f: any) =>
              h('div', { class: 'form-row', key: f.name }, [
                h('label', { class: 'form-label' }, f.name),
                h(NInput, {
                  value: editingData.value[f.name] == null ? '' : String(editingData.value[f.name]),
                  onUpdateValue: (v: string) => { editingData.value[f.name] = v },
                  size: 'small', placeholder: 'NULL'
                })
              ])
            ),
            h('div', { class: 'form-actions' }, [
              h(NButton, { type: 'primary', loading: saving.value, onClick: saveEdit }, { default: () => '保存' }),
              h(NButton, { onClick: () => { showEditModal.value = false } }, { default: () => '取消' })
            ])
          ])
        })
      }),

      // ── Insert Modal ──
      h(NModal, { show: showInsertModal.value, 'onUpdate:show': (v: boolean) => { showInsertModal.value = v } }, {
        default: () => h(NCard, {
          title: `新增行 — ${p.table?.name}`, style: 'width:520px;max-height:80vh;overflow-y:auto',
          bordered: false, size: 'small',
          headerExtra: () => h(NButton, { text: true, onClick: () => { showInsertModal.value = false } }, { icon: () => h(NIcon, null, { default: () => h(CloseOutline) }) })
        }, {
          default: () => h('div', { class: 'form-grid' }, [
            ...modalFields.value.map((f: any) =>
              h('div', { class: 'form-row', key: f.name }, [
                h('label', { class: 'form-label' }, f.name),
                h(NInput, {
                  value: insertData.value[f.name] ?? '',
                  onUpdateValue: (v: string) => { insertData.value[f.name] = v },
                  size: 'small', placeholder: '留空则为 NULL'
                })
              ])
            ),
            h('div', { class: 'form-actions' }, [
              h(NButton, { type: 'primary', loading: saving.value, onClick: saveInsert }, { default: () => '插入' }),
              h(NButton, { onClick: () => { showInsertModal.value = false } }, { default: () => '取消' })
            ])
          ])
        })
      })
    ])
  }
})

// Table Schema editor — with ADD/MODIFY/DROP COLUMN
const TableSchema = defineComponent({
  props: { table: Object, connection: Object },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const cols = ref<any[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref('')

    // modal state
    const showColModal = ref(false)
    const colModalMode = ref<'add' | 'modify'>('add')
    const colForm = ref({ name: '', type: 'VARCHAR(255)', notNull: false, defaultValue: '', comment: '', after: '' })
    const editingCol = ref<any>(null)

    const dbName = () => p.table?._db || p.connection?.config?.database
    const tblFull = () => {
      const db = dbName()
      return db ? `\`${db}\`.\`${p.table?.name}\`` : `\`${p.table?.name}\``
    }

    const loadCols = async () => {
      if (!p.table || !p.connection?.id) return
      loading.value = true; error.value = ''
      try {
        const res = await mysqlMeta.columns(p.connection.id, p.table.name, dbName())
        cols.value = res.columns || []
      } catch (e: any) {
        error.value = e?.response?.data?.error || e.message
        message.error('加载表结构失败: ' + error.value)
      } finally { loading.value = false }
    }

    const openAdd = () => {
      colModalMode.value = 'add'
      colForm.value = { name: '', type: 'VARCHAR(255)', notNull: false, defaultValue: '', comment: '', after: '' }
      showColModal.value = true
    }

    const openModify = (col: any) => {
      colModalMode.value = 'modify'
      editingCol.value = col
      colForm.value = { name: col.name, type: col.type, notNull: col.notNull, defaultValue: col.defaultValue ?? '', comment: col.comment ?? '', after: '' }
      showColModal.value = true
    }

    const buildColDef = () => {
      const f = colForm.value
      let def = `\`${f.name}\` ${f.type}`
      if (f.notNull) def += ' NOT NULL'
      if (f.defaultValue !== '') def += ` DEFAULT '${f.defaultValue.replace(/'/g, "''")}'`
      if (f.comment) def += ` COMMENT '${f.comment.replace(/'/g, "''")}'`
      return def
    }

    const saveColModal = async () => {
      if (!colForm.value.name.trim()) { message.warning('字段名不能为空'); return }
      saving.value = true
      try {
        let sql = ''
        if (colModalMode.value === 'add') {
          sql = `ALTER TABLE ${tblFull()} ADD COLUMN ${buildColDef()}`
          if (colForm.value.after) sql += ` AFTER \`${colForm.value.after}\``
        } else {
          sql = `ALTER TABLE ${tblFull()} MODIFY COLUMN ${buildColDef()}`
        }
        const res = await mysqlMeta.execute(p.connection!.id, sql)
        if (res.error) throw new Error(res.error)
        showColModal.value = false
        message.success(colModalMode.value === 'add' ? '字段已添加' : '字段已修改')
        loadCols()
      } catch (e: any) { message.error('操作失败: ' + (e?.response?.data?.error || e.message)) }
      finally { saving.value = false }
    }

    const dropColumn = (col: any) => {
      if (col.isPrimary) { message.warning('不能删除主键字段'); return }
      dialog.warning({
        title: '删除字段', content: `确定删除字段 "${col.name}"？此操作不可撤销！`,
        positiveText: '确定删除', negativeText: '取消',
        onPositiveClick: async () => {
          saving.value = true
          try {
            const sql = `ALTER TABLE ${tblFull()} DROP COLUMN \`${col.name}\``
            const res = await mysqlMeta.execute(p.connection!.id, sql)
            if (res.error) throw new Error(res.error)
            cols.value = cols.value.filter(c => c.name !== col.name)
            message.success(`已删除字段 ${col.name}`)
          } catch (e: any) { message.error('删除失败: ' + (e?.response?.data?.error || e.message)) }
          finally { saving.value = false }
        }
      })
    }

    const typeOptions = ['INT', 'BIGINT', 'TINYINT', 'SMALLINT', 'FLOAT', 'DOUBLE', 'DECIMAL(10,2)',
      'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(255)', 'TEXT', 'LONGTEXT',
      'DATE', 'DATETIME', 'TIMESTAMP', 'JSON', 'BOOLEAN'].map(v => ({ label: v, value: v }))

    watch(() => [p.table?.name, p.table?._db], loadCols, { immediate: true })

    return () => h('div', { class: ['table-schema', !isDark.value && 'light-mode'] }, [
      h('div', { class: 'schema-toolbar' }, [
        h('span', { class: 'schema-title' }, loading.value ? '加载中...' : `${p.table?.name} · ${cols.value.length} 个字段`),
        h('div', { style: 'flex:1' }),
        h(NButton, { size: 'small', type: 'primary', onClick: openAdd },
          { default: () => '添加字段', icon: () => h(NIcon, null, { default: () => h(AddOutline) }) }),
        h(NButton, { size: 'small', onClick: loadCols, loading: loading.value },
          { default: () => '刷新', icon: () => h(NIcon, null, { default: () => h(RefreshOutline) }) }),
      ]),
      error.value ? h(NAlert, { type: 'error', title: '错误', style: 'margin:8px 12px;font-size:12px' }, { default: () => error.value }) : null,
      loading.value
        ? h('div', { style: 'display:flex;align-items:center;justify-content:center;height:120px' }, [h(NSpin, { size: 'medium' })])
        : h('div', { class: 'schema-cols' }, [
            h('div', { class: 'schema-col-header' }, [
              h('span', { class: 'col-h pk' }, 'PK'),
              h('span', { class: 'col-h name' }, '字段名'),
              h('span', { class: 'col-h type' }, '类型'),
              h('span', { class: 'col-h nn' }, 'NOT NULL'),
              h('span', { class: 'col-h ai' }, 'AUTO INC'),
              h('span', { class: 'col-h def' }, '默认值'),
              h('span', { class: 'col-h comment' }, '注释'),
              h('span', { class: 'col-h actions' }, '操作'),
            ]),
            cols.value.length === 0 ? h('div', { style: 'padding:20px;text-align:center;color:rgba(255,255,255,0.3)' }, '无字段') : null,
            ...cols.value.map((col: any) =>
              h('div', { class: ['schema-col-row', col.isPrimary && 'is-pk'], key: col.name }, [
                h('span', { class: 'col-h pk' }, col.isPrimary ? '🔑' : ''),
                h('span', { class: 'col-h name col-name-val' }, col.name),
                h('span', { class: 'col-h type' }, [h('code', { class: 'type-badge' }, col.type)]),
                h('span', { class: 'col-h nn' }, h('span', { class: col.notNull ? 'nn-yes' : 'nn-no' }, col.notNull ? '✓' : '—')),
                h('span', { class: 'col-h ai' }, h('span', { class: col.autoIncrement ? 'nn-yes' : 'nn-no' }, col.autoIncrement ? '✓' : '—')),
                h('span', { class: 'col-h def' }, h('code', { class: 'def-val' }, col.defaultValue != null ? String(col.defaultValue) : '—')),
                h('span', { class: 'col-h comment' }, h('span', { class: 'comment-text' }, col.comment || '—')),
                h('span', { class: 'col-h actions' }, [
                  h(NButton, { text: true, size: 'tiny', onClick: () => openModify(col) },
                    { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
                  col.isPrimary ? null : h(NButton, { text: true, size: 'tiny', type: 'error', onClick: () => dropColumn(col) },
                    { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
                ]),
              ])
            )
          ]),

      // ── Column Modal ──
      h(NModal, { show: showColModal.value, 'onUpdate:show': (v: boolean) => { showColModal.value = v } }, {
        default: () => h(NCard, {
          title: colModalMode.value === 'add' ? '添加字段' : `修改字段 — ${editingCol.value?.name}`,
          style: 'width:460px', bordered: false, size: 'small',
          headerExtra: () => h(NButton, { text: true, onClick: () => { showColModal.value = false } }, { icon: () => h(NIcon, null, { default: () => h(CloseOutline) }) })
        }, {
          default: () => h('div', { class: 'form-grid' }, [
            h('div', { class: 'form-row' }, [
              h('label', { class: 'form-label' }, '字段名'),
              h(NInput, { value: colForm.value.name, onUpdateValue: (v: string) => { colForm.value.name = v }, size: 'small', disabled: colModalMode.value === 'modify' })
            ]),
            h('div', { class: 'form-row' }, [
              h('label', { class: 'form-label' }, '类型'),
              h(NSelect, { value: colForm.value.type, options: typeOptions, onUpdateValue: (v: string) => { colForm.value.type = v }, size: 'small', filterable: true, tag: true })
            ]),
            h('div', { class: 'form-row' }, [
              h('label', { class: 'form-label' }, '默认值'),
              h(NInput, { value: colForm.value.defaultValue, onUpdateValue: (v: string) => { colForm.value.defaultValue = v }, size: 'small', placeholder: '留空则无默认值' })
            ]),
            h('div', { class: 'form-row' }, [
              h('label', { class: 'form-label' }, '注释'),
              h(NInput, { value: colForm.value.comment, onUpdateValue: (v: string) => { colForm.value.comment = v }, size: 'small', placeholder: '字段注释（可选）' })
            ]),
            colModalMode.value === 'add' ? h('div', { class: 'form-row' }, [
              h('label', { class: 'form-label' }, '位于字段后'),
              h(NSelect, {
                value: colForm.value.after, onUpdateValue: (v: string) => { colForm.value.after = v },
                options: [{ label: '（末尾）', value: '' }, ...cols.value.map((c: any) => ({ label: c.name, value: c.name }))],
                size: 'small', clearable: true
              })
            ]) : null,
            h('div', { class: 'form-actions' }, [
              h(NButton, { type: 'primary', loading: saving.value, onClick: saveColModal }, { default: () => colModalMode.value === 'add' ? '添加' : '保存' }),
              h(NButton, { onClick: () => { showColModal.value = false } }, { default: () => '取消' })
            ])
          ])
        })
      })
    ])
  }
})

// Table Indexes
const TableIndexes = defineComponent({
  props: { table: Object, connection: Object },
  setup(p) {
    const isDark = computed(() => settingsStore.settings.theme === 'dark')
    const indexes = ref<any[]>([])
    const loading = ref(false)
    const error = ref('')

    const loadIndexes = async () => {
      if (!p.table || !p.connection?.id) return
      loading.value = true
      error.value = ''
      try {
        const dbName = p.table._db || p.connection?.config?.database
        const res = await mysqlMeta.indexes(p.connection.id, p.table.name, dbName)
        indexes.value = res.indexes || []
      } catch (e: any) {
        error.value = e?.response?.data?.error || e.message || '加载索引失败'
        message.error(`加载索引失败: ${error.value}`)
      } finally {
        loading.value = false
      }
    }

    watch(() => [p.table?.name, p.table?._db], loadIndexes, { immediate: true })

    return () => h('div', { class: ['table-indexes', !isDark.value && 'light-mode'] }, [
      h('div', { class: 'idx-toolbar' }, [
        h('span', { class: 'idx-title' }, loading.value ? '加载中...' : `${p.table?.name} · ${indexes.value.length} 个索引`),
        h('div', { style: 'flex:1' }),
        h(NButton, { size: 'small', onClick: loadIndexes, loading: loading.value }, { default: () => '刷新', icon: () => h(NIcon, null, { default: () => h(RefreshOutline) }) }),
      ]),
      error.value
        ? h(NAlert, { type: 'error', title: '接口错误', style: 'margin:8px 12px;font-size:12px' }, { default: () => error.value })
        : null,
      loading.value
        ? h('div', { style: 'display:flex;align-items:center;justify-content:center;height:120px' }, [h(NSpin, { size: 'medium' })])
        : h('div', { class: 'idx-list' }, [
            h('div', { class: 'idx-header' }, [
              h('span', { class: 'idx-h name' }, '索引名'),
              h('span', { class: 'idx-h type' }, '类型'),
              h('span', { class: 'idx-h unique' }, 'UNIQUE'),
              h('span', { class: 'idx-h cols' }, '字段'),
            ]),
            indexes.value.length === 0
              ? h('div', { style: 'padding:24px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px' }, '暂无索引')
              : indexes.value.map((idx: any) =>
                  h('div', { class: 'idx-row', key: idx.name }, [
                    h('span', { class: 'idx-h name' }, [
                      idx.name === 'PRIMARY' ? h('span', { class: 'pk-badge' }, 'PRIMARY') : h('code', null, idx.name)
                    ]),
                    h('span', { class: 'idx-h type' }, [h('code', { class: 'type-sm' }, idx.type || 'BTREE')]),
                    h('span', { class: 'idx-h unique' }, h('span', { class: idx.unique ? 'nn-yes' : '' }, idx.unique ? '✓' : '—')),
                    h('span', { class: 'idx-h cols' }, [h('code', { class: 'col-badge' }, Array.isArray(idx.columns) ? idx.columns.join(', ') : idx.columns)]),
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

.tab-bar {
  display: flex; align-items: center; height: 38px; flex-shrink: 0;
  background: rgba(0,0,0,0.25); border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 12px; gap: 2px;
}

.tab-btn {
  display: flex; align-items: center; gap: 5px; padding: 0 12px; height: 100%;
  font-size: 12px; cursor: pointer; border-bottom: 2px solid transparent;
  color: rgba(255,255,255,0.5); transition: all 0.15s; white-space: nowrap;
}
.tab-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); }
.tab-btn.active { color: #4db8ff; border-bottom-color: #4db8ff; }

.tab-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

/* ── SQL Editor ── */
.sql-editor-wrap {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.sql-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sql-spacer { flex: 1; }
.sql-hint { font-size: 11px; color: rgba(255,255,255,0.3); }

.sql-area-wrap { flex: 1; overflow: hidden; min-height: 140px; }
.sql-textarea {
  width: 100%; height: 100%; padding: 12px 14px; resize: none; outline: none;
  background: #1a1a24; color: #e0e0e0; font-family: 'SF Mono','Monaco','Consolas',monospace;
  font-size: 13px; line-height: 1.6; border: none; box-sizing: border-box;
}

.sql-results { flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06); }

.result-tabs {
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px; height: 34px; background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

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
.data-table { flex: 1; }
.browse-pagination {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  border-top: 1px solid rgba(255,255,255,0.06); height: 36px; flex-shrink: 0;
}
.pg-info { font-size: 12px; color: rgba(255,255,255,0.4); }
.pg-num { font-size: 12px; color: rgba(255,255,255,0.6); padding: 0 4px; }

/* ── Schema ── */
.table-schema { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.schema-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.schema-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }

.schema-cols { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
.schema-col-header, .schema-col-row {
  display: grid;
  grid-template-columns: 32px 160px 200px 70px 70px 120px 1fr;
  align-items: center; gap: 4px; padding: 6px 8px;
  border-radius: 4px;
}
.schema-col-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
.schema-col-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; }
.schema-col-row:hover { background: rgba(255,255,255,0.03); }
.schema-col-row.is-pk { background: rgba(240,160,32,0.05); }

.col-name-val { font-weight: 500; color: rgba(255,255,255,0.85); font-family: monospace; font-size: 12px; }
.type-badge { font-size: 11px; color: #4db8ff; background: rgba(77,184,255,0.1); padding: 1px 6px; border-radius: 3px; font-family: monospace; }
.nn-yes { color: #FF6B00; font-weight: 700; }
.nn-no { color: rgba(255,255,255,0.2); }
.comment-text { font-size: 11px; color: rgba(255,255,255,0.4); }
.def-val { font-size: 11px; color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 3px; font-family: monospace; }
.browse-title { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); }

/* ── Row action buttons ── */
.row-actions { display: flex; gap: 2px; justify-content: center; }
.null-val { color: rgba(255,255,255,0.25); font-style: italic; font-size: 11px; }
.id-val { color: #f0a020; font-family: monospace; font-size: 11px; }

/* ── Form modal ── */
.form-grid { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
.form-row { display: flex; align-items: center; gap: 12px; }
.form-label { font-size: 13px; color: rgba(255,255,255,0.7); min-width: 80px; flex-shrink: 0; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px; }

/* schema actions col */
.schema-col-header, .schema-col-row {
  grid-template-columns: 32px 160px 200px 70px 70px 120px 1fr 70px !important;
}

/* ── Indexes ── */
.table-indexes { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.idx-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.idx-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }

.idx-list { flex: 1; overflow-y: auto; padding: 0 8px 8px; }
.idx-header, .idx-row {
  display: grid; grid-template-columns: 220px 80px 70px 1fr;
  align-items: center; gap: 4px; padding: 7px 8px; border-radius: 4px;
}
.idx-header { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }
.idx-row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s; font-size: 12px; }
.idx-row:hover { background: rgba(255,255,255,0.03); }
.pk-badge { color: #f0a020; font-weight: 700; font-size: 11px; }
.type-sm { font-size: 11px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 3px; }
.col-badge { font-size: 11px; color: #a78bfa; background: rgba(167,139,250,0.1); padding: 1px 6px; border-radius: 3px; font-family: monospace; }
</style>
