<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ t('bookmarks.title') }}</h2>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        {{ t('bookmarks.add') }}
      </n-button>
    </div>

    <div class="page-content">
      <div v-if="bookmarks.length === 0" class="empty-state">
        <n-icon :size="64" class="empty-icon">
          <StarOutline />
        </n-icon>
        <p class="empty-text">{{ t('bookmarks.empty') }}</p>
      </div>

      <div v-else class="bookmarks-grid">
        <div
          v-for="item in bookmarks"
          :key="item.id"
          class="bookmark-card"
          @click="useBookmark(item)"
        >
          <div class="bookmark-header">
            <n-icon :size="20" class="bookmark-icon">
              <Star />
            </n-icon>
            <span class="bookmark-name">{{ item.name }}</span>
          </div>
          <p class="bookmark-sql">{{ item.sql }}</p>
          <div class="bookmark-footer">
            <n-tag size="small">{{ item.connectionName }}</n-tag>
            <div class="bookmark-actions">
              <n-button text size="small" @click.stop="editBookmark(item)">
                <n-icon><Create /></n-icon>
              </n-button>
              <n-button text size="small" @click.stop="deleteBookmark(item.id)">
                <n-icon><TrashOutline /></n-icon>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showAddModal" preset="card" :title="editingId ? t('bookmarks.edit') : t('bookmarks.add')" style="width: 500px;">
      <n-form :model="formData" label-placement="top">
        <n-form-item :label="t('bookmarks.name')">
          <n-input v-model:value="formData.name" :placeholder="t('bookmarks.namePlaceholder')" />
        </n-form-item>
        <n-form-item :label="t('bookmarks.sql')">
          <n-input
            v-model:value="formData.sql"
            type="textarea"
            :rows="4"
            :placeholder="t('bookmarks.sqlPlaceholder')"
          />
        </n-form-item>
        <n-form-item :label="t('bookmarks.connection')">
          <n-select
            v-model:value="formData.connectionId"
            :options="connectionOptions"
            :placeholder="t('bookmarks.connectionPlaceholder')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="closeModal">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" @click="saveBookmark">{{ t('common.save') }}</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NIcon, NTag, NModal, NForm, NFormItem, NInput, NSelect, NSpace, useMessage } from 'naive-ui'
import { AddOutline, StarOutline, Star, Create, TrashOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const message = useMessage()
const settingsStore = useSettingsStore()

const showAddModal = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  name: '',
  sql: '',
  connectionId: null as string | null
})

interface Bookmark {
  id: string
  name: string
  sql: string
  connectionId: string
  connectionName: string
}

const bookmarks = ref<Bookmark[]>([])

const connections = computed(() => settingsStore.connections || [])

const connectionOptions = computed(() =>
  connections.value.map(conn => ({
    label: conn.name,
    value: conn.id
  }))
)

const useBookmark = (item: Bookmark) => {
  message.success(t('bookmarks.used'))
  console.log('使用书签:', item.sql)
}

const editBookmark = (item: Bookmark) => {
  editingId.value = item.id
  formData.value = {
    name: item.name,
    sql: item.sql,
    connectionId: item.connectionId
  }
  showAddModal.value = true
}

const deleteBookmark = (id: string) => {
  bookmarks.value = bookmarks.value.filter(b => b.id !== id)
  message.success(t('bookmarks.deleted'))
}

const saveBookmark = () => {
  if (!formData.value.name || !formData.value.sql) {
    message.warning(t('bookmarks.fillRequired'))
    return
  }

  const conn = connections.value.find(c => c.id === formData.value.connectionId)

  if (editingId.value) {
    const index = bookmarks.value.findIndex(b => b.id === editingId.value)
    if (index !== -1) {
      bookmarks.value[index] = {
        ...bookmarks.value[index],
        ...formData.value,
        connectionName: conn?.name || ''
      }
    }
  } else {
    bookmarks.value.push({
      id: Date.now().toString(),
      ...formData.value,
      connectionName: conn?.name || ''
    })
  }

  closeModal()
  message.success(t('bookmarks.saved'))
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  formData.value = {
    name: '',
    sql: '',
    connectionId: null
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

.empty-state {
  height: 100%;
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

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.bookmark-card {
  padding: 16px;
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bookmark-card:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bookmark-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.bookmark-icon {
  color: var(--accent-primary);
}

.bookmark-name {
  font-weight: 500;
  color: var(--text-primary);
}

.bookmark-sql {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bookmark-actions {
  display: flex;
  gap: 4px;
}
</style>
