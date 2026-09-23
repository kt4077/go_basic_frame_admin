// ECharts 图表通用初始化（按需注册，减小体积）
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

export default echarts

/** 图表容器类型约束 */
export type ChartInstance = ReturnType<typeof echarts.init>
