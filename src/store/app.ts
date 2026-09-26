// 应用全局状态：主题、侧栏折叠、水印设置
import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

interface WatermarkConfig {
  enabled: boolean
  text: string
  opacity: number
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'light')
  const sidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === '1')
  const pageRefreshKey = ref(0)
  const pageRefreshing = ref(false)
  let pageRefreshPending = 0
  let pageRefreshStartedAt = 0
  let pageRefreshSettleTimer: ReturnType<typeof setTimeout> | undefined
  let pageRefreshFallbackTimer: ReturnType<typeof setTimeout> | undefined
  const watermark = ref<WatermarkConfig>(JSON.parse(localStorage.getItem('watermark') || 'null') || {
    enabled: true,
    text: '后台管理系统',
    opacity: 0.06,
  })

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode
    localStorage.setItem('theme', mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value ? '1' : '0')
  }

  const finishPageRefresh = () => {
    const remaining = Math.max(0, 280 - (Date.now() - pageRefreshStartedAt))
    if (pageRefreshSettleTimer) clearTimeout(pageRefreshSettleTimer)
    pageRefreshSettleTimer = setTimeout(() => {
      pageRefreshing.value = false
      if (pageRefreshFallbackTimer) clearTimeout(pageRefreshFallbackTimer)
    }, remaining + 80)
  }

  // 仅重新挂载当前业务页面，不刷新浏览器和整体布局。
  const refreshCurrentPage = () => {
    if (pageRefreshing.value) return
    pageRefreshing.value = true
    pageRefreshPending = 0
    pageRefreshStartedAt = Date.now()
    pageRefreshKey.value += 1
    // 给新页面的 onMounted 请求留出进入请求拦截器的时间。
    pageRefreshSettleTimer = setTimeout(() => {
      if (pageRefreshPending === 0) finishPageRefresh()
    }, 120)
    // 网络异常或页面逻辑未正确收尾时，旧页面最迟 8 秒后释放。
    pageRefreshFallbackTimer = setTimeout(() => {
      pageRefreshing.value = false
    }, 8000)
  }

  const beginPageRefreshRequest = () => {
    if (!pageRefreshing.value) return
    pageRefreshPending += 1
    if (pageRefreshSettleTimer) clearTimeout(pageRefreshSettleTimer)
  }

  const endPageRefreshRequest = () => {
    if (!pageRefreshing.value || pageRefreshPending === 0) return
    pageRefreshPending -= 1
    if (pageRefreshPending === 0) finishPageRefresh()
  }

  const setWatermark = (config: Partial<WatermarkConfig>) => {
    watermark.value = { ...watermark.value, ...config }
    localStorage.setItem('watermark', JSON.stringify(watermark.value))
  }

  return {
    theme, sidebarCollapsed, pageRefreshKey, pageRefreshing, watermark,
    setTheme, toggleSidebar, refreshCurrentPage, beginPageRefreshRequest, endPageRefreshRequest, setWatermark,
  }
})
