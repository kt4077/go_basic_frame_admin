// 入口：注册 Element Plus、Pinia、Router、指令与主题
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import AppPagination from '@/components/AppPagination.vue'
import { useAppStore } from '@/store/app'
import permission from '@/directives/permission'
import watermark from '@/directives/watermark'
import '@/styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 全局通用分页组件
app.component('AppPagination', AppPagination)

for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

app.directive('perm', permission)
app.directive('watermark', watermark)

// 初始化主题
const appStore = useAppStore()
appStore.setTheme(appStore.theme)

app.mount('#app')
