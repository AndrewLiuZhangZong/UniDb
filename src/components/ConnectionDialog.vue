<template>
  <n-modal v-model:show="visible" preset="card" :title="dialogTitle" style="width: 680px; max-width: 95vw;">
    <div class="connection-form">
      <!-- Database Type Selection -->
      <div class="form-section">
        <label class="section-label">{{ t('connection.dbType') }}</label>
        <div class="db-type-grid">
          <div
            v-for="db in dbTypes"
            :key="db.value"
            class="db-type-card"
            :class="{ 'is-selected': formData.type === db.value }"
            @click="handleDbTypeSelect(db.value)"
          >
            <DbTypeIcon :type="db.value" :size="36" />
            <span class="db-type-name">{{ db.label }}</span>
            <div v-if="formData.type === db.value" class="selected-indicator">
              <n-icon><CheckmarkCircle /></n-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Connection Name -->
      <div class="form-section">
        <label class="section-label">{{ t('connection.name') }}</label>
        <n-input
          v-model:value="formData.name"
          :placeholder="t('connection.namePlaceholder')"
          size="large"
        />
      </div>

      <!-- Dynamic Configuration Based on Database Type -->
      <div class="form-section config-section">
        <label class="section-label">{{ t('connection.connectionConfig') }}</label>

        <!-- MySQL / ClickHouse Configuration -->
        <template v-if="formData.type === 'mysql' || formData.type === 'clickhouse'">
          <div class="config-grid">
            <div class="config-item full">
              <label class="config-label">{{ t('connection.host') }}</label>
              <n-input
                v-model:value="formData.config.host"
                :placeholder="'localhost'"
                size="small"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.port') }}</label>
              <n-input-number
                v-model:value="formData.config.port"
                :min="1"
                :max="65535"
                size="small"
                style="width: 100%"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.database') }}</label>
              <n-input
                v-model:value="formData.config.database"
                :placeholder="t('connection.databasePlaceholder')"
                size="small"
              />
            </div>
          </div>
          <div class="config-grid">
            <div class="config-item">
              <label class="config-label">{{ t('connection.username') }}</label>
              <n-input
                v-model:value="formData.config.username"
                :placeholder="'root'"
                size="small"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.password') }}</label>
              <n-input
                v-model:value="formData.config.password"
                type="password"
                show-password-on="click"
                size="small"
              />
            </div>
          </div>

          <!-- Advanced Options -->
          <n-collapse-transition :show="showAdvanced">
            <div class="advanced-section">
              <div class="config-grid">
                <div class="config-item">
                  <label class="config-label">{{ t('connection.charSet') }}</label>
                  <n-select
                    v-model:value="formData.config.charset"
                    :options="charsetOptions"
                    size="small"
                  />
                </div>
                <div class="config-item">
                  <label class="config-label">{{ t('connection.timeout') }}</label>
                  <n-input-number
                    v-model:value="formData.config.timeout"
                    :min="0"
                    :max="300"
                    size="small"
                    style="width: 100%"
                  />
                </div>
              </div>
              <div class="config-item full">
                <n-checkbox v-model:checked="formData.config.ssl">
                  {{ t('connection.useSSL') }}
                </n-checkbox>
              </div>
            </div>
          </n-collapse-transition>
        </template>

        <!-- MongoDB Configuration -->
        <template v-else-if="formData.type === 'mongodb'">
          <div class="config-grid">
            <div class="config-item full">
              <label class="config-label">{{ t('connection.connectionString') }}</label>
              <n-input
                v-model:value="formData.config.connectionString"
                :placeholder="t('connection.connectionStringPlaceholder')"
                size="small"
              />
            </div>
          </div>
          <div class="config-divider">
            <span>{{ t('connection.or') }}</span>
          </div>
          <div class="config-grid">
            <div class="config-item full">
              <label class="config-label">{{ t('connection.host') }}</label>
              <n-input
                v-model:value="formData.config.host"
                :placeholder="'localhost'"
                size="small"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.port') }}</label>
              <n-input-number
                v-model:value="formData.config.port"
                :min="1"
                :max="65535"
                size="small"
                style="width: 100%"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.database') }}</label>
              <n-input
                v-model:value="formData.config.database"
                :placeholder="t('connection.databasePlaceholder')"
                size="small"
              />
            </div>
          </div>
          <div class="config-grid">
            <div class="config-item">
              <label class="config-label">{{ t('connection.username') }}</label>
              <n-input
                v-model:value="formData.config.username"
                size="small"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.password') }}</label>
              <n-input
                v-model:value="formData.config.password"
                type="password"
                show-password-on="click"
                size="small"
              />
            </div>
          </div>

          <n-collapse-transition :show="showAdvanced">
            <div class="advanced-section">
              <div class="config-item full">
                <n-checkbox v-model:checked="formData.config.directConnection">
                  {{ t('connection.directConnection') }}
                </n-checkbox>
              </div>
              <div class="config-grid">
                <div class="config-item">
                  <label class="config-label">{{ t('connection.authDatabase') }}</label>
                  <n-input
                    v-model:value="formData.config.authDatabase"
                    size="small"
                  />
                </div>
                <div class="config-item">
                  <label class="config-label">{{ t('connection.replicaSet') }}</label>
                  <n-input
                    v-model:value="formData.config.replicaSet"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </n-collapse-transition>
        </template>

        <!-- Redis Configuration -->
        <template v-else-if="formData.type === 'redis'">
          <div class="config-grid">
            <div class="config-item">
              <label class="config-label">{{ t('connection.host') }}</label>
              <n-input
                v-model:value="formData.config.host"
                :placeholder="'localhost'"
                size="small"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.port') }}</label>
              <n-input-number
                v-model:value="formData.config.port"
                :min="1"
                :max="65535"
                size="small"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="config-grid">
            <div class="config-item">
              <label class="config-label">{{ t('connection.password') }}</label>
              <n-input
                v-model:value="formData.config.password"
                type="password"
                show-password-on="click"
                size="small"
              />
            </div>
            <div class="config-item">
              <label class="config-label">{{ t('connection.database') }} (db{{ formData.config.db || 0 }})</label>
              <n-input-number
                v-model:value="formData.config.db"
                :min="0"
                :max="16"
                size="small"
                style="width: 100%"
              />
            </div>
          </div>

          <n-collapse-transition :show="showAdvanced">
            <div class="advanced-section">
              <label class="config-label">{{ t('connection.mode') }}</label>
              <n-radio-group v-model:value="formData.mode" style="margin-bottom: 12px;">
                <n-radio value="standalone">{{ t('connection.standalone') }}</n-radio>
                <n-radio value="cluster">{{ t('connection.cluster') }}</n-radio>
                <n-radio value="sentinel">{{ t('connection.sentinel') }}</n-radio>
              </n-radio-group>

              <template v-if="formData.mode === 'cluster'">
                <div class="config-item full">
                  <label class="config-label">{{ t('connection.clusterNodes') }}</label>
                  <n-dynamic-input
                    v-model:value="formData.config.clusterNodes"
                    :min="3"
                    :preset="'pair'"
                    key-placeholder="host:port"
                    value-placeholder="127.0.0.1:7000"
                  />
                </div>
              </template>

              <template v-else-if="formData.mode === 'sentinel'">
                <div class="config-grid">
                  <div class="config-item full">
                    <label class="config-label">{{ t('connection.masterName') }}</label>
                    <n-input v-model:value="formData.config.masterName" size="small" />
                  </div>
                </div>
                <div class="config-item full">
                  <label class="config-label">{{ t('connection.sentinelNodes') }}</label>
                  <n-dynamic-input
                    v-model:value="formData.config.sentinelNodes"
                    :preset="'pair'"
                    key-placeholder="host"
                    value-placeholder="port"
                  />
                </div>
              </template>

              <div class="config-grid">
                <div class="config-item">
                  <label class="config-label">{{ t('connection.connectTimeout') }}</label>
                  <n-input-number
                    v-model:value="formData.config.connectTimeout"
                    :min="0"
                    :max="60000"
                    size="small"
                    style="width: 100%"
                  />
                </div>
                <div class="config-item">
                  <label class="config-label">{{ t('connection.commandTimeout') }}</label>
                  <n-input-number
                    v-model:value="formData.config.commandTimeout"
                    :min="0"
                    :max="60000"
                    size="small"
                    style="width: 100%"
                  />
                </div>
              </div>
            </div>
          </n-collapse-transition>
        </template>

        <!-- Advanced Options Toggle -->
        <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
          <n-icon>
            <ChevronDownOutline v-if="!showAdvanced" />
            <ChevronUpOutline v-else />
          </n-icon>
          <span>{{ t('connection.advancedOptions') }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <n-button @click="visible = false" size="large">
          {{ t('common.cancel') }}
        </n-button>
        <n-button @click="testConnection" :loading="testing" size="large" type="info">
          <template #icon>
            <n-icon><FlashOutline /></n-icon>
          </template>
          {{ t('connection.testConnection') }}
        </n-button>
        <n-button type="primary" @click="handleSave" :loading="saving" size="large">
          <template #icon>
            <n-icon><SaveOutline /></n-icon>
          </template>
          {{ t('connection.save') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NModal,
  NInput,
  NInputNumber,
  NButton,
  NIcon,
  NSelect,
  NCheckbox,
  NCollapseTransition,
  NRadioGroup,
  NRadio,
  NDynamicInput,
  useMessage
} from 'naive-ui'
import {
  CheckmarkCircle,
  ChevronDownOutline,
  ChevronUpOutline,
  FlashOutline,
  SaveOutline
} from '@vicons/ionicons5'
import { useConnectionStore } from '../stores/connection'
import DbTypeIcon from './DbTypeIcon.vue'

const props = defineProps<{
  show: boolean
  editConnection?: any
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'saved'): void
}>()

const { t } = useI18n()
const message = useMessage()
const connectionStore = useConnectionStore()
const testing = ref(false)
const saving = ref(false)
const showAdvanced = ref(false)

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const dialogTitle = computed(() =>
  props.editConnection ? t('connection.editConnection') : t('connection.newConnection')
)

const dbTypes = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'ClickHouse', value: 'clickhouse' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'Redis', value: 'redis' }
]

const charsetOptions = [
  { label: 'utf8mb4', value: 'utf8mb4' },
  { label: 'utf8', value: 'utf8' },
  { label: 'latin1', value: 'latin1' },
  { label: 'gbk', value: 'gbk' },
  { label: 'gb2312', value: 'gb2312' }
]

// Default ports for each database type
const defaultPorts: Record<string, number> = {
  mysql: 3306,
  clickhouse: 8123,
  mongodb: 27017,
  redis: 6379
}

// Form data
const formData = ref({
  id: '',
  name: '',
  type: 'mysql',
  mode: 'standalone',
  config: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: '',
    charset: 'utf8mb4',
    timeout: 30,
    ssl: false,
    // MongoDB specific
    connectionString: '',
    directConnection: false,
    authDatabase: '',
    replicaSet: '',
    // Redis specific
    db: 0,
    connectTimeout: 5000,
    commandTimeout: 5000,
    clusterNodes: [] as string[],
    sentinelNodes: [] as string[],
    masterName: ''
  }
})

// Handle database type change
const handleDbTypeSelect = (type: string) => {
  formData.value.type = type
  formData.value.config.port = defaultPorts[type]
  // Reset mode based on type
  if (type !== 'redis') {
    formData.value.mode = 'standalone'
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    type: 'mysql',
    mode: 'standalone',
    config: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: '',
      charset: 'utf8mb4',
      timeout: 30,
      ssl: false,
      connectionString: '',
      directConnection: false,
      authDatabase: '',
      replicaSet: '',
      db: 0,
      connectTimeout: 5000,
      commandTimeout: 5000,
      clusterNodes: [],
      sentinelNodes: [],
      masterName: ''
    }
  }
  showAdvanced.value = false
}

// Watch for edit connection
watch(() => props.editConnection, (conn) => {
  if (conn) {
    formData.value = {
      id: conn.id,
      name: conn.name,
      type: conn.type,
      mode: conn.mode || 'standalone',
      config: { ...formData.value.config, ...conn.config }
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for modal open
watch(() => props.show, (val) => {
  if (!val && !props.editConnection) {
    resetForm()
  }
})

// Test connection
const testConnection = async () => {
  testing.value = true
  try {
    const result = await connectionStore.testConnection({
      type: formData.value.type,
      mode: formData.value.mode,
      config: formData.value.config
    })
    if (result.success) {
      message.success(t('connection.testSuccess'))
    } else {
      message.error(t('connection.testFailed') + ': ' + result.error)
    }
  } catch {
    message.error(t('connection.testError'))
  } finally {
    testing.value = false
  }
}

// Save connection
const handleSave = async () => {
  if (!formData.value.name.trim()) {
    message.warning(t('connection.nameRequired'))
    return
  }

  saving.value = true
  try {
    const data = {
      name: formData.value.name,
      type: formData.value.type,
      mode: formData.value.mode,
      config: formData.value.config
    }

    if (formData.value.id) {
      await connectionStore.updateConnection(formData.value.id, data)
      message.success(t('connection.updateSuccess'))
    } else {
      await connectionStore.createConnection(data)
      message.success(t('connection.createSuccess'))
    }

    await connectionStore.fetchConnections()
    emit('saved')
    visible.value = false
    resetForm()
  } catch {
    message.error(t('connection.saveError'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.connection-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

/* Database Type Grid */
.db-type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.db-type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.db-type-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.db-type-card.is-selected {
  background: rgba(24, 160, 88, 0.1);
  border-color: #18a058;
  box-shadow: 0 0 20px rgba(24, 160, 88, 0.2);
}

.db-type-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #18a058;
}

/* Config Section */
.config-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-item.full {
  grid-column: 1 / -1;
}

.config-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.config-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.config-divider::before,
.config-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

/* Advanced Section */
.advanced-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}

.advanced-toggle:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* Dialog Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 600px) {
  .db-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-item.full {
    grid-column: 1;
  }
}
</style>
