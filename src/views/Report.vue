<template>
  <div class="report-page" :class="{ 'light-mode': !isDarkTheme }">
    <div class="report-container">
      <h2 class="report-title">{{ t('help.report.title') }}</h2>

      <div class="report-tip">
        <n-icon size="16"><InformationCircleOutline /></n-icon>
        {{ t('help.report.tip') }}
      </div>

      <div class="report-form">
        <div class="form-field">
          <label class="field-label">
            {{ t('help.report.issueTitle') }} <span class="required">*</span>
          </label>
          <n-input
            v-model:value="reportForm.title"
            :placeholder="t('help.report.titlePlaceholder')"
            :maxlength="100"
            show-count
            size="large"
          />
        </div>

        <div class="form-field">
          <label class="field-label">
            {{ t('help.report.description') }} <span class="required">*</span>
          </label>
          <n-input
            v-model:value="reportForm.description"
            type="textarea"
            :placeholder="t('help.report.descPlaceholder')"
            :rows="6"
            :maxlength="2000"
            show-count
            size="large"
          />
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('help.report.email') }}</label>
          <n-input
            v-model:value="reportForm.email"
            :placeholder="t('help.report.emailPlaceholder')"
            size="large"
          />
        </div>

        <div class="report-version-info">
          <span class="version-tag">v{{ appVersion }}</span>
          <span class="version-tag">{{ platform }}</span>
          <span class="version-tag">{{ electronVersions.electron }}</span>
        </div>
      </div>

      <div class="report-actions">
        <n-button size="large" @click="goBack">
          <template #icon><n-icon><ArrowBackOutline /></n-icon></template>
          {{ t('common.cancel') }}
        </n-button>
        <n-button
          type="primary"
          size="large"
          :disabled="!reportForm.title || !reportForm.description"
          @click="submitReport"
        >
          <template #icon><n-icon><SendOutline /></n-icon></template>
          {{ t('help.report.submit') }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NIcon, NInput, NButton } from 'naive-ui'
import { InformationCircleOutline, ArrowBackOutline, SendOutline } from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()
const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const appVersion = '0.1.0'
const platform = window.electronAPI?.platform === 'darwin' ? 'macOS' : 'Windows'

const electronVersions = computed(() => ({
  electron: window.electronAPI?.versions?.electron || 'N/A',
  node: window.electronAPI?.versions?.node || 'N/A',
  chrome: window.electronAPI?.versions?.chrome || 'N/A'
}))

const reportForm = reactive({
  title: '',
  description: '',
  email: ''
})

const submitReport = () => {
  const title = encodeURIComponent(reportForm.title)
  const body = encodeURIComponent(
    `${reportForm.description}\n\n---\n**Version:** v${appVersion}\n**Platform:** ${platform}\n**Electron:** ${electronVersions.value.electron}\n**Node:** ${electronVersions.value.node}${reportForm.email ? `\n**Email:** ${reportForm.email}` : ''}`
  )
  window.open(`https://github.com/AndrewLiuZhangZong/UniDb/issues/new?title=${title}&body=${body}&labels=bug`, '_blank')
  reportForm.title = ''
  reportForm.description = ''
  reportForm.email = ''
  router.back()
}

const goBack = () => router.back()
</script>

<style scoped>
.report-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.report-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 36px 40px;
}

.report-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  text-align: center;
}

.report-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.5;
  margin-bottom: 20px;
  background: var(--accent-primary-subtle);
  color: var(--text-secondary);
}
.report-tip n-icon {
  flex-shrink: 0;
  color: var(--accent-primary);
  margin-top: 1px;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.required {
  color: #e05c5c;
}

.report-version-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.version-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: var(--font-mono);
  background: var(--bg-row-hover);
  color: var(--text-quaternary);
  border: 1px solid var(--border-secondary);
}

.report-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
</style>