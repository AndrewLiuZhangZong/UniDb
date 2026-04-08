<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">{{ t('transfer.title') }}</h2>
    </div>

    <div class="page-content">
      <div class="transfer-config">
        <n-grid :cols="2" :x-gap="24" :y-gap="24">
          <n-gi>
            <div class="transfer-panel">
              <div class="panel-header">
                <n-icon :size="20"><ArrowDownCircleOutline /></n-icon>
                <span>{{ t('transfer.source') }}</span>
              </div>
              <div class="panel-content">
                <n-form :model="sourceConfig" label-placement="top">
                  <n-form-item :label="t('transfer.connection')">
                    <n-select
                      v-model:value="sourceConfig.connectionId"
                      :options="connectionOptions"
                      :placeholder="t('transfer.selectConnection')"
                      @update:value="loadSourceTables"
                    />
                  </n-form-item>
                  <n-form-item :label="t('transfer.sourceTable')">
                    <n-select
                      v-model:value="sourceConfig.tableName"
                      :options="sourceTableOptions"
                      :placeholder="t('transfer.selectTable')"
                      :loading="loadingSourceTables"
                      :disabled="!sourceConfig.connectionId"
                      @update:value="loadSourceColumns"
                    />
                  </n-form-item>
                  <n-form-item :label="t('transfer.columns')">
                    <n-select
                      v-model:value="sourceConfig.columns"
                      multiple
                      :options="sourceColumnOptions"
                      :placeholder="t('transfer.selectColumns')"
                      :disabled="!sourceConfig.tableName"
                      :max-tag-count="3"
                    />
                  </n-form-item>
                </n-form>
              </div>
            </div>
          </n-gi>

          <n-gi>
            <div class="transfer-panel">
              <div class="panel-header target">
                <n-icon :size="20"><ArrowUpCircleOutline /></n-icon>
                <span>{{ t('transfer.target') }}</span>
              </div>
              <div class="panel-content">
                <n-form :model="targetConfig" label-placement="top">
                  <n-form-item :label="t('transfer.connection')">
                    <n-select
                      v-model:value="targetConfig.connectionId"
                      :options="connectionOptions"
                      :placeholder="t('transfer.selectConnection')"
                      @update:value="loadTargetTables"
                    />
                  </n-form-item>
                  <n-form-item :label="t('transfer.targetTable')">
                    <n-select
                      v-model:value="targetConfig.tableName"
                      :options="targetTableOptions"
                      :placeholder="t('transfer.selectTable')"
                      :loading="loadingTargetTables"
                      :disabled="!targetConfig.connectionId"
                    />
                  </n-form-item>
                  <n-form-item :label="t('transfer.mode')">
                    <n-radio-group v-model:value="targetConfig.mode">
                      <n-space>
                        <n-radio value="insert">{{ t('transfer.modeInsert') }}</n-radio>
                        <n-radio value="upsert">{{ t('transfer.modeUpsert') }}</n-radio>
                        <n-radio value="replace">{{ t('transfer.modeReplace') }}</n-radio>
                      </n-space>
                    </n-radio-group>
                  </n-form-item>
                </n-form>
              </div>
            </div>
          </n-gi>
        </n-grid>

        <div class="transfer-actions">
          <n-space justify="center">
            <n-button
              type="primary"
              size="large"
              :disabled="!canTransfer"
              :loading="transferring"
              @click="startTransfer"
            >
              <template #icon>
                <n-icon><SwapHorizontalOutline /></n-icon>
              </template>
              {{ t('transfer.start') }}
            </n-button>
          </n-space>
        </div>

        <div v-if="transferResult" class="transfer-result">
          <n-alert :type="transferResult.success ? 'success' : 'error'" :title="transferResult.message">
            <template v-if="transferResult.success">
              <p>{{ t('transfer.affectedRows') }}: {{ transferResult.affectedRows }}</p>
            </template>
          </n-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NButton, NIcon, NGrid, NGi, NForm, NFormItem, NInput,
  NSelect, NRadio, NRadioGroup, NSpace, NAlert, useMessage
} from 'naive-ui'
import { ArrowDownCircleOutline, ArrowUpCircleOutline, SwapHorizontalOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const message = useMessage()
const settingsStore = useSettingsStore()

const sourceConfig = ref({
  connectionId: null as string | null,
  tableName: null as string | null,
  columns: [] as string[]
})

const targetConfig = ref({
  connectionId: null as string | null,
  tableName: null as string | null,
  mode: 'insert' as 'insert' | 'upsert' | 'replace'
})

const loadingSourceTables = ref(false)
const loadingTargetTables = ref(false)
const transferring = ref(false)
const transferResult = ref<{ success: boolean; message: string; affectedRows?: number } | null>(null)

const sourceTableOptions = ref<{ label: string; value: string }[]>([])
const targetTableOptions = ref<{ label: string; value: string }[]>([])
const sourceColumnOptions = ref<{ label: string; value: string }[]>([])

const connections = computed(() => settingsStore.connections || [])

const connectionOptions = computed(() =>
  connections.value.map(conn => ({
    label: `${conn.name} (${conn.type})`,
    value: conn.id
  }))
)

const canTransfer = computed(() =>
  sourceConfig.value.connectionId &&
  sourceConfig.value.tableName &&
  targetConfig.value.connectionId &&
  targetConfig.value.tableName
)

const loadSourceTables = async () => {
  if (!sourceConfig.value.connectionId) return

  loadingSourceTables.value = true
  sourceConfig.value.tableName = null
  sourceConfig.value.columns = []

  setTimeout(() => {
    sourceTableOptions.value = [
      { label: 'users', value: 'users' },
      { label: 'orders', value: 'orders' },
      { label: 'products', value: 'products' }
    ]
    loadingSourceTables.value = false
  }, 500)
}

const loadSourceColumns = async () => {
  if (!sourceConfig.value.tableName) return

  setTimeout(() => {
    sourceColumnOptions.value = [
      { label: 'id', value: 'id' },
      { label: 'name', value: 'name' },
      { label: 'email', value: 'email' },
      { label: 'created_at', value: 'created_at' }
    ]
  }, 300)
}

const loadTargetTables = async () => {
  if (!targetConfig.value.connectionId) return

  loadingTargetTables.value = true
  targetConfig.value.tableName = null

  setTimeout(() => {
    targetTableOptions.value = [
      { label: 'users_backup', value: 'users_backup' },
      { label: 'orders_archive', value: 'orders_archive' }
    ]
    loadingTargetTables.value = false
  }, 500)
}

const startTransfer = async () => {
  transferring.value = true
  transferResult.value = null

  setTimeout(() => {
    transferring.value = false
    transferResult.value = {
      success: true,
      message: t('transfer.success'),
      affectedRows: 150
    }
    message.success(t('transfer.success'))
  }, 2000)
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

.transfer-config {
  max-width: 1000px;
  margin: 0 auto;
}

.transfer-panel {
  background: var(--bg-row-hover);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  font-weight: 500;
  color: var(--text-primary);
}

.panel-header.target {
  color: var(--accent-primary);
}

.panel-content {
  padding: 16px;
}

.transfer-actions {
  margin-top: 32px;
}

.transfer-result {
  margin-top: 24px;
}
</style>
