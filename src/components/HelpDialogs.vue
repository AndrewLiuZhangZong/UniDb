<template>
  <!-- Check Update Dialog -->
  <n-modal v-model:show="checkUpdateVisible" :mask-closable="true">
    <n-card
      class="check-update-card"
      :bordered="false"
      size="large"
      :content-style="{ padding: '0' }"
    >
      <div class="check-update-body">
        <div class="update-icon-wrap" :class="{ 'checking': isChecking }">
          <n-icon v-if="isChecking" class="spinning" size="36"><ReloadOutline /></n-icon>
          <n-icon v-else-if="hasUpdate" size="36" color="#FF6B00"><CloudDoneOutline /></n-icon>
          <n-icon v-else size="36" color="#FF6B00"><CheckmarkCircleOutline /></n-icon>
        </div>

        <div v-if="isChecking" class="update-checking">
          <h3 class="update-title">{{ t('help.checkUpdates.checking') }}</h3>
        </div>

        <div v-else-if="!hasUpdate" class="update-status">
          <h3 class="update-title">{{ t('help.checkUpdates.upToDate') }}</h3>
          <p class="update-desc">{{ t('help.checkUpdates.upToDateDesc', { version: appVersion }) }}</p>
          <div class="update-version-badge">
            <span class="version-tag">v{{ appVersion }}</span>
          </div>
        </div>

        <div v-else class="update-status">
          <h3 class="update-title new-version">{{ t('help.checkUpdates.newVersion') }}</h3>
          <p class="update-desc">{{ t('help.checkUpdates.newVersionDesc', { version: latestVersion }) }}</p>
          <div class="update-actions">
            <n-button type="primary" size="large" @click="downloadUpdate">
              <template #icon><n-icon><CloudDownloadOutline /></n-icon></template>
              {{ t('help.checkUpdates.download') }}
            </n-button>
          </div>
        </div>

        <div class="update-actions-row">
          <n-button v-if="!isChecking" @click="checkUpdateVisible = false">{{ t('common.close') }}</n-button>
          <n-button v-if="!isChecking && !hasUpdate" @click="doCheckUpdate">
            <template #icon><n-icon><ReloadOutline /></n-icon></template>
            {{ t('help.checkUpdates.checkAgain') }}
          </n-button>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NCard, NIcon, NButton } from 'naive-ui'
import {
  CheckmarkCircleOutline,
  CloudDoneOutline, CloudDownloadOutline, ReloadOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const checkUpdateVisible = ref(false)
const isChecking = ref(false)
const hasUpdate = ref(false)
const latestVersion = ref('')

const appVersion = '0.1.0'

const doCheckUpdate = () => {
  isChecking.value = true
  hasUpdate.value = false
  latestVersion.value = ''
  setTimeout(() => {
    isChecking.value = false
    hasUpdate.value = false
  }, 2000)
}

const downloadUpdate = () => {
  window.open('https://github.com/AndrewLiuZhangZong/UniDb/releases', '_blank')
  checkUpdateVisible.value = false
}

const showCheckUpdates = () => {
  checkUpdateVisible.value = true
  doCheckUpdate()
}

defineExpose({ showCheckUpdates })
</script>

<style scoped>
.check-update-card {
  width: 400px;
  border-radius: 16px;
}

.check-update-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.update-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 0, 0.1);
  color: #FF6B00;
  margin-bottom: 4px;
}
.update-icon-wrap.checking {
  background: rgba(255, 107, 0, 0.08);
  color: #FF6B00;
}

.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.update-checking .update-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.update-status { width: 100%; }

.update-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 8px;
}
.update-title.new-version {
  color: #FF6B00;
}

.update-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 12px;
}

.update-version-badge {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.version-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', monospace;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.4);
}

.update-actions { width: 100%; }
.update-actions n-button { width: 100%; }

.update-actions-row {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
}
</style>