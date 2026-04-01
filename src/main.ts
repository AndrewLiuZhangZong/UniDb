import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'
import darkTheme from './styles/theme-dark.css?inline'
import lightTheme from './styles/theme-light.css?inline'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Theme management
const themeStyleId = 'app-theme-styles'

function applyTheme(isDark: boolean) {
  let styleEl = document.getElementById(themeStyleId) as HTMLStyleElement

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = themeStyleId
    document.head.appendChild(styleEl)
  }

  // Add or remove light-theme class on body
  if (isDark) {
    document.body.classList.remove('light-theme')
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
    document.body.classList.add('light-theme')
  }

  // Inject the appropriate theme CSS
  styleEl.textContent = isDark ? darkTheme : lightTheme
}

// Watch for theme changes from settings store
// This will be called when store is ready
function initTheme() {
  const storedTheme = localStorage.getItem('unidb-theme')
  const isDark = storedTheme !== 'light'
  applyTheme(isDark)
}

// Initialize theme on load
initTheme()

// Export for use in components
export { applyTheme }

app.mount('#app')
