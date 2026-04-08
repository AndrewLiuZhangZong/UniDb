import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

import './styles/variables.css'
import './styles/accent-orange.css'
import './styles/accent-purple.css'

// 新增主题色只需三步：
// 1. 新建 accent-*.css（复制现有文件替换颜色值）
// 2. 在 main.ts 添加 import
// 3. 在 theme-config.ts 的 ACCENT_COLORS 添加定义

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

app.mount('#app')
