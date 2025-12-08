import 'tdesign-vue-next/es/style/index.css'
import './assets/theme.css'
import './assets/responsive.css'
import './assets/styles/transition.css'
import './assets/main.css'
// 注释掉冲突的主题文件，统一使用 theme.css
// import './styles/light-theme.css'
// import './styles/dark-theme.less'
// import './styles/dark-theme-override.css'
// import './styles/dark-theme-final.css'
import './styles/common.less'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import TDesign from 'tdesign-vue-next'

import App from './App.vue'
import router from './router'
import { useAuthStore, usePermissionStore } from './stores'
import { setupGlobalErrorHandler } from './utils/error'

// 全局错误处理
setupGlobalErrorHandler()

// 创建应用
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)

// 标记初始化状态
let isInitialized = false
export const waitForInit = () => {
  return new Promise((resolve) => {
    if (isInitialized) {
      resolve()
    } else {
      const check = setInterval(() => {
        if (isInitialized) {
          clearInterval(check)
          resolve()
        }
      }, 10)
    }
  })
}

async function initializeApp() {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  try {
    await authStore.initializeAuth()

    if (authStore.isAuthenticated) {
      permissionStore.initializePermissions()
    }
  } catch (error) {
    console.warn('Failed to initialize app:', error)
  }

  isInitialized = true
  app.mount('#app')
}

initializeApp()
