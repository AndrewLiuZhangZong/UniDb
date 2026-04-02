<template>
  <div class="database-router" :class="{ 'light-mode': !isDarkTheme }">
    <!-- No connection -->
    <div v-if="!connection" class="no-connection">
      <n-icon :size="36"><ServerOutline /></n-icon>
      <span>{{ t('explorer.noConnection') }}</span>
    </div>

    <!-- Route to the correct explorer by type -->
    <MySQLExplorer
      v-else-if="connection.type === 'mysql'"
      :connection="connection"
      @select-item="onSelectItem"
    />
    <ClickHouseExplorer
      v-else-if="connection.type === 'clickhouse'"
      :connection="connection"
      @select-item="onSelectItem"
    />
    <MongoDBExplorer
      v-else-if="connection.type === 'mongodb'"
      :connection="connection"
      @select-item="onSelectItem"
    />
    <RedisExplorer
      v-else-if="connection.type === 'redis'"
      :connection="connection"
      @select-item="onSelectItem"
    />

    <!-- Unknown type fallback -->
    <div v-else class="unsupported">
      <n-icon :size="36"><AlertCircleOutline /></n-icon>
      <span>{{ t('explorer.unsupportedType') }}: {{ connection.type }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NIcon } from 'naive-ui'
import { ServerOutline, AlertCircleOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../../stores/settings'
import MySQLExplorer from './MySQL/MySQLExplorer.vue'
import ClickHouseExplorer from './ClickHouse/ClickHouseExplorer.vue'
import MongoDBExplorer from './MongoDB/MongoDBExplorer.vue'
import RedisExplorer from './Redis/RedisExplorer.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

defineProps<{ connection: any }>()
const emit = defineEmits<{ (e: 'select-item', item: any, type: string): void }>()

const onSelectItem = (item: any, type: string) => {
  emit('select-item', item, type)
}
</script>

<style scoped>
.database-router {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(30, 30, 35, 0.3);
  border-left: 1px solid rgba(255, 255, 255, 0.06);
}

.no-connection,
.unsupported {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}
</style>
