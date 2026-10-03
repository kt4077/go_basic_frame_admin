<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { DataLine, Money, Refresh, ShoppingCart, User } from '@element-plus/icons-vue'
import { getFinanceReportOverview } from '@/api/financeOrder'
import type { FinanceReportOverview } from '@/types/financeOrder'
import { useAppStore } from '@/store/app'
import echarts, { type ChartInstance } from '@/utils/echarts'

const appStore = useAppStore()
const loading = ref(false)
const data = ref<FinanceReportOverview | null>(null)
const trendEl = ref<HTMLElement>()
const statusEl = ref<HTMLElement>()
let trendChart: ChartInstance | null = null
let statusChart: ChartInstance | null = null

const money = (value?: string) => `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const stats = computed(() => [
  { label: '累计实付金额', value: money(data.value?.total_pay_amount), note: `今日 ${money(data.value?.today_pay_amount)}`, icon: Money, color: '#3b6ef6' },
  { label: '全部订单', value: String(data.value?.order_count || 0), note: `今日新增 ${data.value?.today_order_count || 0} 单`, icon: ShoppingCart, color: '#8b5cf6' },
  { label: '已支付订单', value: String(data.value?.paid_order_count || 0), note: `待支付 ${data.value?.pending_count || 0} 单`, icon: DataLine, color: '#14b8a6' },
  { label: '成交用户', value: String(data.value?.buyer_count || 0), note: `已退款 ${data.value?.refund_count || 0} 单`, icon: User, color: '#f59e0b' },
])

const axisColor = () => document.documentElement.classList.contains('dark') ? '#94a3b8' : '#6b7280'
const renderCharts = () => {
  if (!data.value) return
  const textColor = axisColor()
  if (trendEl.value) {
    trendChart = trendChart || echarts.init(trendEl.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { right: 0, top: 0, textStyle: { color: textColor } },
      grid: { left: 48, right: 48, top: 42, bottom: 26 },
      xAxis: { type: 'category', data: data.value.trend.map(item => item.date), axisTick: { show: false }, axisLabel: { color: textColor } },
      yAxis: [
        { type: 'value', name: '金额/元', axisLabel: { color: textColor }, splitLine: { lineStyle: { color: 'rgba(144,147,153,.16)' } } },
        { type: 'value', name: '订单/单', axisLabel: { color: textColor }, splitLine: { show: false } },
      ],
      series: [
        { name: '实付金额', type: 'line', smooth: true, symbolSize: 6, data: data.value.trend.map(item => Number(item.pay_amount)), itemStyle: { color: '#3b6ef6' }, areaStyle: { color: 'rgba(59,110,246,.12)' } },
        { name: '订单量', type: 'bar', yAxisIndex: 1, barWidth: 18, data: data.value.trend.map(item => item.order_count), itemStyle: { color: '#14b8a6', borderRadius: [5, 5, 0, 0] } },
      ],
    }, true)
  }
  if (statusEl.value) {
    statusChart = statusChart || echarts.init(statusEl.value)
    statusChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: textColor } },
      color: ['#f59e0b', '#14b8a6', '#ef4444'],
      series: [{ type: 'pie', radius: ['48%', '70%'], center: ['50%', '45%'], label: { formatter: '{b}\n{c} 单', color: textColor }, data: data.value.pay_statuses.map(item => ({ name: item.name, value: item.count })) }],
    }, true)
  }
}

const load = async () => {
  loading.value = true
  try {
    data.value = await getFinanceReportOverview()
    await nextTick()
    renderCharts()
  } finally {
    loading.value = false
  }
}
const resize = () => { trendChart?.resize(); statusChart?.resize() }
onMounted(() => { load(); window.addEventListener('resize', resize) })
watch(() => appStore.theme, () => nextTick(renderCharts))
onUnmounted(() => { window.removeEventListener('resize', resize); trendChart?.dispose(); statusChart?.dispose() })
</script>

<template>
  <div v-loading="loading" class="report-page">
    <div class="page-card report-head">
      <div>
        <h3>财务报表</h3>
        <p>统一汇总核心模块及已安装插件订单，展示成交、支付与业务贡献情况。</p>
      </div>
      <el-tooltip content="刷新报表" placement="top"><el-icon class="op-icon" @click="load"><Refresh /></el-icon></el-tooltip>
    </div>

    <div class="stat-grid">
      <div v-for="item in stats" :key="item.label" class="page-card stat-card">
        <div class="stat-icon" :style="{ color: item.color, backgroundColor: `${item.color}18` }"><el-icon><component :is="item.icon" /></el-icon></div>
        <div class="stat-content"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.note }}</small></div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="page-card chart-card"><div class="section-title">近7天订单与实付趋势</div><div ref="trendEl" class="chart" /></div>
      <div class="page-card chart-card"><div class="section-title">支付状态分布</div><div ref="statusEl" class="chart" /></div>
    </div>

    <div class="page-card">
      <div class="section-title">业务模块汇总</div>
      <el-table :data="data?.modules || []" empty-text="暂无业务订单">
        <el-table-column prop="plugin_name" label="业务模块" min-width="180"><template #default="{ row }"><div class="module-name"><span class="module-dot" />{{ row.plugin_name }}<small>{{ row.plugin_id }}</small></div></template></el-table-column>
        <el-table-column prop="order_count" label="订单量" min-width="120" align="center" />
        <el-table-column prop="paid_count" label="已支付" min-width="120" align="center" />
        <el-table-column prop="pay_amount" label="实付金额" min-width="150" align="right"><template #default="{ row }">{{ money(row.pay_amount) }}</template></el-table-column>
        <el-table-column prop="refund_count" label="退款订单" min-width="120" align="center" />
        <el-table-column prop="refund_amount" label="退款金额" min-width="150" align="right"><template #default="{ row }">{{ money(row.refund_amount) }}</template></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.report-page{display:flex;flex-direction:column;gap:14px}.report-head{display:flex;align-items:center;justify-content:space-between}.report-head h3{margin:0 0 6px;font-size:18px;color:var(--el-text-color-primary)}.report-head p{margin:0;color:var(--el-text-color-secondary);font-size:13px}.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stat-card{display:flex;align-items:center;gap:14px;min-width:0}.stat-icon{display:flex;width:48px;height:48px;flex:none;align-items:center;justify-content:center;border-radius:12px;font-size:24px}.stat-content{display:flex;min-width:0;flex-direction:column;gap:3px}.stat-content span,.stat-content small{color:var(--el-text-color-secondary);font-size:12px}.stat-content strong{color:var(--el-text-color-primary);font-size:24px;line-height:1.25;font-variant-numeric:tabular-nums}.chart-grid{display:grid;grid-template-columns:2fr 1fr;gap:14px}.chart-card{min-width:0}.chart{height:300px}.module-name{display:flex;align-items:center;gap:8px;color:var(--el-text-color-primary);font-weight:600}.module-name small{color:var(--el-text-color-secondary);font-weight:400}.module-dot{width:8px;height:8px;border-radius:50%;background:var(--el-color-primary)}@media(max-width:1200px){.stat-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.chart-grid{grid-template-columns:1fr}}@media(max-width:640px){.stat-grid{grid-template-columns:1fr}}
</style>
