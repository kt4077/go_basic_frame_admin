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

  const setWatermark = (config: Partial<WatermarkConfig>) => {
    watermark.value = { ...watermark.value, ...config }
    localStorage.setItem('watermark', JSON.stringify(watermark.value))
  }

  return { theme, sidebarCollapsed, watermark, setTheme, toggleSidebar, setWatermark }
})
