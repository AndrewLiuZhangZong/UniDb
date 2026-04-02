<template>
  <!-- About Dialog -->
  <n-modal v-model:show="aboutVisible" :mask-closable="true">
    <n-card
      class="about-card"
      :bordered="false"
      size="large"
      :content-style="{ padding: '0' }"
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
        <h2 class="about-name">UniDb</h2>
        <p class="about-tagline">{{ t('help.about.tagline') }}</p>

        <div class="about-version-row">
          <span class="version-label">{{ t('help.about.version') }}</span>
          <span class="version-value">v{{ appVersion }}</span>
        </div>

        <div class="about-meta-grid">
          <div class="meta-item">
            <span class="meta-label">{{ t('help.about.electron') }}</span>
            <span class="meta-value">{{ electronVersions.electron }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('help.about.node') }}</span>
            <span class="meta-value">{{ electronVersions.node }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('help.about.chrome') }}</span>
            <span class="meta-value">{{ electronVersions.chrome }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('help.about.platform') }}</span>
            <span class="meta-value">{{ platform }}</span>
          </div>
        </div>

        <div class="about-links">
          <button class="about-link-btn" @click="openLink('docs')">
            <n-icon><BookOutline /></n-icon>
            {{ t('help.about.viewDocs') }}
          </button>
          <button class="about-link-btn" @click="openLink('github')">
            <n-icon><LogoGithub /></n-icon>
            GitHub
          </button>
          <button class="about-link-btn" @click="openLink('issues')">
            <n-icon><BugOutline /></n-icon>
            {{ t('help.about.reportIssue') }}
          </button>
        </div>

        <p class="about-copyright">© 2024–{{ currentYear }} UniDb</p>
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
    >
      <div class="docs-grid">
        <div class="doc-item" @click="openLink('docs')">
          <n-icon class="doc-icon" size="28"><BookOutline /></n-icon>
          <div class="doc-info">
            <h4>{{ t('help.docs.userGuide') }}</h4>
            <p>{{ t('help.docs.userGuideDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="doc-item" @click="openLink('api')">
          <n-icon class="doc-icon" size="28"><CodeSlashOutline /></n-icon>
          <div class="doc-info">
            <h4>{{ t('help.docs.apiRef') }}</h4>
            <p>{{ t('help.docs.apiRefDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="doc-item" @click="openLink('faq')">
          <n-icon class="doc-icon" size="28"><HelpCircleOutline /></n-icon>
          <div class="doc-info">
            <h4>{{ t('help.docs.faq') }}</h4>
            <p>{{ t('help.docs.faqDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
        </div>
        <div class="doc-item" @click="openLink('github')">
          <n-icon class="doc-icon" size="28"><LogoGithub /></n-icon>
          <div class="doc-info">
            <h4>GitHub</h4>
            <p>{{ t('help.docs.githubDesc') }}</p>
          </div>
          <n-icon class="doc-arrow"><ChevronForwardOutline /></n-icon>
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
    >
      <div class="report-form">
        <div class="report-tip">
          <n-icon size="16"><InformationCircleOutline /></n-icon>
          {{ t('help.report.tip') }}
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('help.report.issueTitle') }} <span class="required">*</span></label>
          <n-input
            v-model:value="reportForm.title"
            :placeholder="t('help.report.titlePlaceholder')"
            :maxlength="100"
            show-count
          />
        </div>

        <div class="form-field">
          <label class="field-label">{{ t('help.report.description') }} <span class="required">*</span></label>
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
          <label class="field-label">{{ t('help.report.email') }}</label>
          <n-input
            v-model:value="reportForm.email"
            :placeholder="t('help.report.emailPlaceholder')"
          />
        </div>

        <div class="report-version-info">
          <span class="version-tag">v{{ appVersion }}</span>
          <span class="version-tag">{{ platform }}</span>
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
  InformationCircleOutline
} from '@vicons/ionicons5'

const { t } = useI18n()

const aboutVisible = ref(false)
const docsVisible = ref(false)
const reportVisible = ref(false)

const appVersion = '0.1.0'
const currentYear = new Date().getFullYear()
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

const showAbout = () => { aboutVisible.value = true }
const showDocs = () => { docsVisible.value = true }
const showReport = () => { reportVisible.value = true }

defineExpose({ showAbout, showDocs, showReport })
</script>

<style scoped>
/* About Dialog */
.about-card {
  width: 420px;
  border-radius: 16px;
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
}

.about-tagline {
  font-size: 13px;
  opacity: 0.5;
  margin: 0 0 20px;
}

.about-version-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.version-label { font-size: 13px; opacity: 0.45; }
.version-value {
  font-size: 13px;
  font-weight: 600;
  color: #18a058;
  background: rgba(24,160,88,0.12);
  padding: 2px 8px;
  border-radius: 6px;
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
}
.meta-label { font-size: 11px; opacity: 0.4; }
.meta-value {
  font-size: 13px;
  font-weight: 500;
  font-family: 'SF Mono','Monaco',monospace;
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
}
.about-link-btn:hover {
  background: rgba(24,160,88,0.15);
  border-color: rgba(24,160,88,0.4);
  color: #18a058;
}
.about-link-btn n-icon { font-size: 14px; }

.about-copyright {
  font-size: 11px;
  opacity: 0.3;
  margin: 0;
}

/* Docs Dialog */
.docs-card {
  width: 500px;
  border-radius: 16px;
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
  background: rgba(24,160,88,0.1);
  border: 1px solid rgba(24,160,88,0.2);
}
.doc-icon { color: #18a058; flex-shrink: 0; }
.doc-info { flex: 1; }
.doc-info h4 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
}
.doc-info p { margin: 0; font-size: 12px; opacity: 0.45; }
.doc-arrow { opacity: 0.25; flex-shrink: 0; }

/* Report Bug Dialog */
.report-card {
  width: 520px;
  border-radius: 16px;
}

.report-form { display: flex; flex-direction: column; gap: 16px; }

.report-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(24,160,88,0.08);
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.5;
}
.report-tip n-icon { color: #18a058; flex-shrink: 0; margin-top: 1px; }

.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 500; }
.required { color: #e05c5c; }

.report-version-info { display: flex; gap: 8px; }
.version-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'SF Mono','Monaco',monospace;
  opacity: 0.5;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}
</style>
