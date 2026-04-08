<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ t('templates.title') }}</h2>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        {{ t('templates.add') }}
      </n-button>
    </div>

    <div class="page-content">
      <div class="template-categories">
        <n-tabs v-model:value="activeCategory" type="line">
          <n-tab-pane
            v-for="cat in categories"
            :key="cat.key"
            :name="cat.key"
            :tab="cat.label"
          >
            <div v-if="getTemplatesByCategory(cat.key).length === 0" class="empty-state">
              <n-icon :size="64" class="empty-icon">
                <DocumentTextOutline />
              </n-icon>
              <p class="empty-text">{{ t('templates.empty') }}</p>
            </div>

            <div v-else class="templates-grid">
              <div
                v-for="item in getTemplatesByCategory(cat.key)"
                :key="item.id"
                class="template-card"
                @click="useTemplate(item)"
              >
                <div class="template-header">
                  <n-icon :size="20" class="template-icon">
                    <DocumentTextOutline />
                  </n-icon>
                  <span class="template-name">{{ item.name }}</span>
                </div>
                <p class="template-desc">{{ item.description }}</p>
                <code class="template-preview">{{ item.sql }}</code>
                <div class="template-footer">
                  <div class="template-actions">
                    <n-button text size="small" @click.stop="copyTemplate(item)">
                      <n-icon><CopyOutline /></n-icon>
                      {{ t('templates.copy') }}
                    </n-button>
                    <n-button text size="small" @click.stop="editTemplate(item)" v-if="item.isCustom">
                      <n-icon><Create /></n-icon>
                    </n-button>
                    <n-button text size="small" @click.stop="deleteTemplate(item.id)" v-if="item.isCustom">
                      <n-icon><TrashOutline /></n-icon>
                    </n-button>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <n-modal v-model:show="showAddModal" preset="card" :title="editingId ? t('templates.edit') : t('templates.add')" style="width: 600px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item :label="t('templates.name')">
          <n-input v-model:value="formData.name" :placeholder="t('templates.namePlaceholder')" />
        </n-form-item>
        <n-form-item :label="t('templates.category')">
          <n-select
            v-model:value="formData.category"
            :options="categoryOptions"
            :placeholder="t('templates.categoryPlaceholder')"
          />
        </n-form-item>
        <n-form-item :label="t('templates.description')">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            :rows="2"
            :placeholder="t('templates.descPlaceholder')"
          />
        </n-form-item>
        <n-form-item :label="t('templates.sql')">
          <n-input
            v-model:value="formData.sql"
            type="textarea"
            :rows="6"
            :placeholder="t('templates.sqlPlaceholder')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="closeModal">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" @click="saveTemplate">{{ t('common.save') }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon, NTabs, NTabPane, NTag, NModal, NForm, NFormItem, NInput, NSelect, NSpace, useMessage } from 'naive-ui'
import { AddOutline, DocumentTextOutline, CopyOutline, Create, TrashOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const message = useMessage()
const settingsStore = useSettingsStore()

const showAddModal = ref(false)
const editingId = ref<string | null>(null)
const activeCategory = ref('common')

const formData = ref({
  name: '',
  category: 'common',
  description: '',
  sql: ''
})

interface Template {
  id: string
  name: string
  category: string
  description: string
  sql: string
  isCustom: boolean
}

const categories = computed(() => [
  { key: 'common', label: t('templates.categories.common') },
  { key: 'query', label: t('templates.categories.query') },
  { key: 'structure', label: t('templates.categories.structure') },
  { key: 'custom', label: t('templates.categories.custom') }
])

const categoryOptions = computed(() => categories.value.map(c => ({
  label: c.label,
  value: c.key
})))

const builtInTemplates: Template[] = [
  {
    id: 'pagination',
    name: t('templates.builtIn.pagination.name'),
    category: 'common',
    description: t('templates.builtIn.pagination.desc'),
    sql: 'SELECT * FROM {{table_name}} LIMIT {{limit}} OFFSET {{offset}}',
    isCustom: false
  },
  {
    id: 'count',
    name: t('templates.builtIn.count.name'),
    category: 'common',
    description: t('templates.builtIn.count.desc'),
    sql: 'SELECT COUNT(*) as total FROM {{table_name}} WHERE {{condition}}',
    isCustom: false
  },
  {
    id: 'describe',
    name: t('templates.builtIn.describe.name'),
    category: 'structure',
    description: t('templates.builtIn.describe.desc'),
    sql: 'DESCRIBE {{table_name}}',
    isCustom: false
  },
  {
    id: 'duplicate',
    name: t('templates.builtIn.duplicate.name'),
    category: 'query',
    description: t('templates.builtIn.duplicate.desc'),
    sql: 'SELECT {{column}}, COUNT(*) as count FROM {{table_name}} GROUP BY {{column}} HAVING count > 1',
    isCustom: false
  },
  {
    id: 'random',
    name: t('templates.builtIn.random.name'),
    category: 'common',
    description: t('templates.builtIn.random.desc'),
    sql: 'SELECT * FROM {{table_name}} ORDER BY RAND() LIMIT {{limit}}',
    isCustom: false
  }
]

const customTemplates = ref<Template[]>([])

const templates = computed(() => [...builtInTemplates, ...customTemplates.value])

const getTemplatesByCategory = (category: string) => {
  if (category === 'custom') {
    return customTemplates.value
  }
  return templates.value.filter(t => t.category === category)
}

const useTemplate = (item: Template) => {
  message.success(t('templates.copied'))
  navigator.clipboard.writeText(item.sql)
}

const copyTemplate = (item: Template) => {
  navigator.clipboard.writeText(item.sql)
  message.success(t('templates.copied'))
}

const editTemplate = (item: Template) => {
  editingId.value = item.id
  formData.value = {
    name: item.name,
    category: item.category,
    description: item.description,
    sql: item.sql
  }
  showAddModal.value = true
}

const deleteTemplate = (id: string) => {
  customTemplates.value = customTemplates.value.filter(t => t.id !== id)
  message.success(t('templates.deleted'))
}

const saveTemplate = () => {
  if (!formData.value.name || !formData.value.sql) {
    message.warning(t('templates.fillRequired'))
    return
  }

  if (editingId.value) {
    const index = customTemplates.value.findIndex(t => t.id === editingId.value)
    if (index !== -1) {
      customTemplates.value[index] = {
        ...customTemplates.value[index],
        ...formData.value
      }
    }
  } else {
    customTemplates.value.push({
      id: Date.now().toString(),
      ...formData.value,
      isCustom: true
    })
  }

  closeModal()
  message.success(t('templates.saved'))
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  formData.value = {
    name: '',
    category: 'common',
    description: '',
    sql: ''
  }
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.template-categories {
  height: 100%;
}

.empty-state {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.template-card {
  padding: 16px;
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.template-icon {
  color: var(--accent-primary);
}

.template-name {
  font-weight: 500;
  color: var(--text-primary);
}

.template-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0 0 12px;
}

.template-preview {
  display: block;
  font-size: 11px;
  font-family: monospace;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.template-actions {
  display: flex;
  gap: 4px;
}
</style>
