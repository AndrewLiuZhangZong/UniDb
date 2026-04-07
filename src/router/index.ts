import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'
import About from '../views/About.vue'
import Docs from '../views/Docs.vue'
import Report from '../views/Report.vue'
import LogViewer from '../views/LogViewer.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/docs',
      name: 'docs',
      component: Docs
    },
    {
      path: '/report',
      name: 'report',
      component: Report
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogViewer
    }
  ]
})

export default router
