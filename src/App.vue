<template>
  <n-config-provider
    :theme="currentTheme"
    :locale="currentLocale"
    :date-locale="currentDateLocale"
  >
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <router-view />
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  darkTheme,
  lightTheme,
  zhCN,
  enUS,
  dateZhCN,
  dateEnUS
} from 'naive-ui'
import { useSettingsStore } from './stores/settings'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

// Current theme
const currentTheme = computed(() => {
  return settingsStore.settings.theme === 'dark' ? darkTheme : lightTheme
})

// Current locale for Naive UI
const currentLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? zhCN : enUS
})

// Current date locale
const currentDateLocale = computed(() => {
  return settingsStore.settings.language === 'zh-CN' ? dateZhCN : dateEnUS
})

// Sync i18n locale with settings
watch(
  () => settingsStore.settings.language,
  (newLang) => {
    locale.value = newLang
  },
  { immediate: true }
)

// Apply saved language on mount
onMounted(() => {
  if (settingsStore.settings.language) {
    locale.value = settingsStore.settings.language
  }
})
</script>

<style>
/* Modern Reset & Base Styles */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  background: #0f0f12;
  color: rgba(255, 255, 255, 0.9);
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom Selection Color */
::selection {
  background: rgba(24, 160, 88, 0.3);
  color: #fff;
}

/* Custom Scrollbar - Webkit */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Focus Visible Styles */
:focus-visible {
  outline: 2px solid rgba(24, 160, 88, 0.6);
  outline-offset: 2px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid rgba(24, 160, 88, 0.6);
  outline-offset: 1px;
}

/* Disable text selection on interactive elements */
button,
[role="button"],
.clickable {
  user-select: none;
}

/* Transitions */
a,
button,
input,
select,
textarea {
  transition: all 0.15s ease;
}

/* Code / Monospace */
code,
pre,
.mono {
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Monaco', 'Inconsolata', monospace;
}

/* Naive UI Dark Theme Overrides */
.n-card {
  --n-border-radius: 12px !important;
}

.n-button {
  --n-border-radius: 8px !important;
}

.n-input {
  --n-border-radius: 8px !important;
}

.n-select {
  --n-border-radius: 8px !important;
}

.n-modal {
  --n-border-radius: 16px !important;
}

/* Glass Effect Helper Classes */
.glass {
  background: rgba(30, 30, 35, 0.8) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.glass-light {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Gradient Backgrounds */
.gradient-primary {
  background: linear-gradient(135deg, #18a058 0%, #36b374 100%);
}

.gradient-surface {
  background: linear-gradient(180deg, rgba(30, 30, 35, 0.95) 0%, rgba(25, 25, 30, 0.95) 100%);
}

.gradient-hero {
  background: linear-gradient(135deg, #1a1a1f 0%, #12121a 50%, #0f0f14 100%);
}

/* Glow Effects */
.glow-green {
  box-shadow: 0 0 20px rgba(24, 160, 88, 0.3);
}

.glow-green-soft {
  box-shadow: 0 0 40px rgba(24, 160, 88, 0.15);
}

/* Border Styles */
.border-subtle {
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.border-medium {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Text Utilities */
.text-gradient {
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animation Keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animation Utility Classes */
.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease;
}

.animate-slide-in-left {
  animation: slideInLeft 0.3s ease;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Layout Utilities */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Hover Effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.hover-scale {
  transition: transform 0.15s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(24, 160, 88, 0.2);
}
</style>
