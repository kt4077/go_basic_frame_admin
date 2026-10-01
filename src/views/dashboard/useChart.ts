// 看板图表生命周期：初始化、窗口缩放与明暗主题联动重绘。
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAppStore } from '@/store/app'
import echarts, { type ChartInstance } from '@/utils/echarts'

/** 图表坐标轴文字在明暗主题下的颜色 */
export const chartAxisColor = (): string =>
  document.documentElement.classList.contains('dark') ? '#94a3b8' : '#6b7280'

export const useChart = (render: (chart: ChartInstance) => void) => {
  const appStore = useAppStore()
  const el = ref<HTMLElement>()
  let chart: ChartInstance | null = null

  const draw = () => {
    if (!el.value) return
    chart = chart || echarts.init(el.value)
    render(chart)
  }

  const onResize = () => chart?.resize()

  onMounted(() => {
    draw()
    window.addEventListener('resize', onResize)
  })

  watch(
    () => appStore.theme,
    () => draw(),
  )

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    chart?.dispose()
    chart = null
  })

  return { el, redraw: draw }
}
