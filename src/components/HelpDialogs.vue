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
          <n-icon v-else-if="hasUpdate" size="36" color="#18a058"><CloudDoneOutline /></n-icon>
          <n-icon v-else size="36" color="#18a058"><CheckmarkCircleOutline /></n-icon>
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

  <!-- About Dialog -->
  <n-modal v-model:show="aboutVisible" :mask-closable="true">
    <n-card
      class="about-card"
      :bordered="false"
      size="large"
      :content-style="{ padding: '0' }"
      :style="{ background: isDarkTheme ? cardBgDark : cardBgLight }"
    >
      <div class="about-body">
        <div class="about-logo">
          <svg width="72" height="72" viewBox="0 0 256 256" fill="none">
            <circle cx="128" cy="128" r="100" fill="url(#aboutGrad2)"/>
            <ellipse cx="128" cy="88" rx="50" ry="20" fill="rgba(255,255,255,0.3)"/>
            <ellipse cx="128" cy="128" rx="50" ry="20" fill="rgba(255,255,255,0.2)"/>
            <ellipse cx="128" cy="168" rx="50" ry="20" fill="rgba(255,255,255,0.1)"/>
            <defs>
              <linearGradient id="aboutGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#18a058"/>
                <stop offset="100%" stop-color="#36b374"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 class="about-name" :style="{ color: isDarkTheme ? '#fff' : '#1a1a1f' }">UniDb</h2>
        <p class="about-tagline" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }">{{ t('help.about.tagline') }}</p>

        <div class="about-version-row">
          <span class="version-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ t('help.about.version') }}</span>
          <span class="version-value" :style="versionBadgeStyle">v{{ appVersion }}</span>
        </div>

        <div class="about-meta-grid">
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.electron') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ electronVersions.electron }}</span>
          </div>
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.node') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ electronVersions.node }}</span>
          </div>
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.chrome') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ electronVersions.chrome }}</span>
          </div>
          <div class="meta-item" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }">
            <span class="meta-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }">{{ t('help.about.platform') }}</span>
            <span class="meta-value" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }">{{ platform }}</span>
          </div>
        </div>

        <div class="about-links">
          <button class="about-link-btn" :style="linkBtnStyle" @click="openLink('docs')">
            <n-icon><BookOutline /></n-icon>
            {{ t('help.about.viewDocs') }}
          </button>
          <button class="about-link-btn" :style="linkBtnStyle" @click="openLink('github')">
            <n-icon><LogoGithub /></n-icon>
            GitHub
          </button>
          <button class="about-link-btn" :style="linkBtnStyle" @click="openLink('issues')">
            <n-icon><BugOutline /></n-icon>
            {{ t('help.about.reportIssue') }}
          </button>
        </div>

        <p class="about-copyright" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }">© 2024–{{ currentYear }} UniDb</p>
      </div>
    </n-card>
  </n-modal>

  <!-- Documentation Dialog -->
  <n-modal v-model:show="docsVisible" :mask-closable="true">
    <n-card
      class="docs-card"
      :bordered="false"
      size="large"
      :title="t('help.docs.title')"
      :content-style="{ padding: '0 24px 24px' }"
      :style="{ background: isDarkTheme ? cardBgDark : cardBgLight }"
    >
      <div class="docs-grid">
        <div class="doc-item" :style="docItemStyle" @click="openLink('docs')">
          <n-icon class="doc-icon" size="28" :style="{ color: isDarkTheme ? '#18a058' : '#2080f0' }"><BookOutline /></n-icon>
          <div class="doc-info">
            <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">{{ t('help.docs.userGuide') }}</h4>
            <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ t('help.docs.userGuideDesc') }}</p>
          </div>
          <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="doc-item" :style="docItemStyle" @click="openLink('api')">
          <n-icon class="doc-icon" size="28" :style="{ color: isDarkTheme ? '#18a058' : '#2080f0' }"><CodeSlashOutline /></n-icon>
          <div class="doc-info">
            <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">{{ t('help.docs.apiRef') }}</h4>
            <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ t('help.docs.apiRefDesc') }}</p>
          </div>
          <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="doc-item" :style="docItemStyle" @click="openLink('faq')">
          <n-icon class="doc-icon" size="28" :style="{ color: isDarkTheme ? '#18a058' : '#2080f0' }"><HelpCircleOutline /></n-icon>
          <div class="doc-info">
            <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">{{ t('help.docs.faq') }}</h4>
            <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ t('help.docs.faqDesc') }}</p>
          </div>
          <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="doc-item" :style="docItemStyle" @click="openLink('github')">
          <n-icon class="doc-icon" size="28" :style="{ color: isDarkTheme ? '#18a058' : '#2080f0' }"><LogoGithub /></n-icon>
          <div class="doc-info">
            <h4 :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.85)' }">GitHub</h4>
            <p :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ t('help.docs.githubDesc') }}</p>
          </div>
          <n-icon class="doc-arrow" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }"><ChevronForwardOutline /></n-icon>
        </div>
      </div>
    </n-card>
  </n-modal>

  <!-- Report Bug Dialog -->
  <n-modal v-model:show="reportVisible" :mask-closable="false">
    <n-card
      class="report-card"
      :bordered="false"
      size="large"
      :title="t('help.report.title')"
      :content-style="{ padding: '0 24px 24px' }"
      :style="{ background: isDarkTheme ? cardBgDark : cardBgLight }"
    >
      <div class="report-form">
        <div class="report-tip" :style="tipStyle">
          <n-icon size="16" :style="{ color: isDarkTheme ? '#18a058' : '#2080f0' }"><InformationCircleOutline /></n-icon>
          {{ t('help.report.tip') }}
        </div>

        <div class="form-field">
          <label class="field-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }">{{ t('help.report.issueTitle') }} <span class="required">*</span></label>
          <n-input
            v-model:value="reportForm.title"
            :placeholder="t('help.report.titlePlaceholder')"
            :maxlength="100"
            show-count
          />
        </div>

        <div class="form-field">
          <label class="field-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }">{{ t('help.report.description') }} <span class="required">*</span></label>
          <n-input
            v-model:value="reportForm.description"
            type="textarea"
            :placeholder="t('help.report.descPlaceholder')"
            :rows="5"
            :maxlength="2000"
            show-count
          />
        </div>

        <div class="form-field">
          <label class="field-label" :style="{ color: isDarkTheme ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }">{{ t('help.report.email') }}</label>
          <n-input
            v-model:value="reportForm.email"
            :placeholder="t('help.report.emailPlaceholder')"
          />
        </div>

        <div class="report-version-info">
          <span class="version-tag" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">v{{ appVersion }}</span>
          <span class="version-tag" :style="{ background: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }">{{ platform }}</span>
        </div>

        <div class="report-actions">
          <n-button @click="reportVisible = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :disabled="!reportForm.title || !reportForm.description" @click="submitReport">
            {{ t('help.report.submit') }}
          </n-button>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NCard, NIcon, NInput, NButton } from 'naive-ui'
import {
  BookOutline, LogoGithub, BugOutline,
  ChevronForwardOutline, CodeSlashOutline, HelpCircleOutline,
  InformationCircleOutline, CheckmarkCircleOutline,
  CloudDoneOutline, CloudDownloadOutline, ReloadOutline
} from '@vicons/ionicons5'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const checkUpdateVisible = ref(false)
const aboutVisible = ref(false)
const docsVisible = ref(false)
const reportVisible = ref(false)

const isChecking = ref(false)
const hasUpdate = ref(false)
const latestVersion = ref('')

const appVersion = '0.1.0'
const currentYear = new Date().getFullYear()
const platform = window.electronAPI?.platform === 'darwin' ? 'macOS' : 'Windows'

const isDarkTheme = computed(() => settingsStore.settings.theme === 'dark')

const cardBgDark = '#1e1e26'
const cardBgLight = '#ffffff'

const accentColor = computed(() => isDarkTheme.value ? '#18a058' : '#2080f0')

const versionBadgeStyle = computed(() => ({
  color: accentColor.value,
  background: isDarkTheme.value ? 'rgba(24,160,88,0.12)' : 'rgba(32,128,240,0.1)',
}))

const linkBtnStyle = computed(() => ({
  background: isDarkTheme.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${isDarkTheme.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  color: isDarkTheme.value ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)',
}))

const docItemStyle = computed(() => ({
  background: isDarkTheme.value ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
  border: `1px solid ${isDarkTheme.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
}))

const tipStyle = computed(() => ({
  background: isDarkTheme.value ? 'rgba(24,160,88,0.08)' : 'rgba(32,128,240,0.07)',
  color: isDarkTheme.value ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
}))

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

const openLink = (type: string) => {
  const urls: Record<string, string> = {
    docs: 'https://unidb.com/docs',
    api: 'https://unidb.com/docs/api',
    faq: 'https://unidb.com/docs/faq',
    github: 'https://github.com/AndrewLiuZhangZong/UniDb',
    issues: 'https://github.com/AndrewLiuZhangZong/UniDb/issues'
  }
  window.open(urls[type], '_blank')
}

const submitReport = () => {
  const title = encodeURIComponent(reportForm.title)
  const body = encodeURIComponent(
    `${reportForm.description}\n\n---\n**Version:** v${appVersion}\n**Platform:** ${platform}\n**Electron:** ${electronVersions.value.electron}\n**Node:** ${electronVersions.value.node}\n${reportForm.email ? `\n**Email:** ${reportForm.email}` : ''}`
  )
  window.open(`https://github.com/AndrewLiuZhangZong/UniDb/issues/new?title=${title}&body=${body}&labels=bug`, '_blank')
  reportForm.title = ''
  reportForm.description = ''
  reportForm.email = ''
  reportVisible.value = false
}

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
  openLink('github')
  checkUpdateVisible.value = false
}

const showAbout = () => { aboutVisible.value = true }
const showDocs = () => { docsVisible.value = true }
const showReport = () => { reportVisible.value = true }
const showCheckUpdates = () => {
  checkUpdateVisible.value = true
  doCheckUpdate()
}

defineExpose({ showAbout, showDocs, showReport, showCheckUpdates })
</script>

<style scoped>
/* Check Update Dialog */
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
  background: rgba(24, 160, 88, 0.1);
  color: #18a058;
  margin-bottom: 4px;
}
.update-icon-wrap.checking {
  background: rgba(24, 160, 88, 0.08);
  color: #18a058;
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
  color: #18a058;
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

/* About Dialog */
.about-card {
  width: 420px;
  border-radius: 16px;
  transition: background 0.2s;
}

.about-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.about-logo svg {
  filter: drop-shadow(0 4px 16px rgba(24, 160, 88, 0.35));
  margin-bottom: 12px;
}

.about-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  transition: color 0.2s;
}

.about-tagline {
  font-size: 13px;
  margin: 0 0 20px;
  transition: color 0.2s;
}

.about-version-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.version-label {
  font-size: 13px;
  transition: color 0.2s;
}
.version-value {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}

.about-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.2s;
}
.meta-label { font-size: 11px; transition: color 0.2s; }
.meta-value {
  font-size: 13px;
  font-weight: 500;
  font-family: 'SF Mono','Monaco',monospace;
  transition: color 0.2s;
}

.about-links {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
}
.about-link-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.about-link-btn:hover {
  background: rgba(24,160,88,0.15) !important;
  border-color: rgba(24,160,88,0.4) !important;
  color: #18a058 !important;
}
.about-link-btn n-icon { font-size: 14px; }

.about-copyright {
  font-size: 11px;
  margin: 0;
  transition: color 0.2s;
}

/* Docs Dialog */
.docs-card {
  width: 500px;
  border-radius: 16px;
  transition: background 0.2s;
}

.docs-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.doc-item:hover {
  background: rgba(24,160,88,0.1) !important;
  border-color: rgba(24,160,88,0.2) !important;
}
.doc-icon { color: #18a058; flex-shrink: 0; transition: color 0.2s; }
.doc-info { flex: 1; }
.doc-info h4 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}
.doc-info p { margin: 0; font-size: 12px; transition: color 0.2s; }
.doc-arrow { opacity: 0.25; flex-shrink: 0; transition: color 0.2s; }

/* Report Bug Dialog */
.report-card {
  width: 520px;
  border-radius: 16px;
  transition: background 0.2s;
}

.report-form { display: flex; flex-direction: column; gap: 16px; }

.report-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.5;
  transition: background 0.2s, color 0.2s;
}
.report-tip n-icon { flex-shrink: 0; margin-top: 1px; transition: color 0.2s; }

.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 500; transition: color 0.2s; }
.required { color: #e05c5c; }

.report-version-info { display: flex; gap: 8px; }
.version-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'SF Mono','Monaco',monospace;
  transition: background 0.2s, color 0.2s;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}
</style>
