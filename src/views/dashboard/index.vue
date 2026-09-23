<script setup lang="ts">
// 系统总览：数据汇总统计报表
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { User, UserFilled, Menu, OfficeBuilding, Monitor } from '@element-plus/icons-vue'
import { getOverview } from '@/api/dashboard'
import { LoginStatusLabels, LoginStatus } from '@/enums/menu'
import { useAppStore } from '@/store/app'
import echarts, { type ChartInstance } from '@/utils/echarts'
import type { OverviewRes } from '@/types/dashboard'
import { formatDateTimeCell } from '@/utils/datetime'

const appStore = useAppStore()
const overview = ref<OverviewRes | null>(null)
const trendRef = ref<HTMLElement>()
const deptRef = ref<HTMLElement>()
let trendChart: ChartInstance | null = null
let deptChart: ChartInstance | null = null
let timer: number | undefined

const stats = [
  { key: 'user_count', label: '用户总数', icon: User, color: '#3b6ef6', tint: 'rgba(59,110,246,.1)' },
  { key: 'online_count', label: '在线用户', icon: Monitor, color: '#22c55e', tint: 'rgba(34,197,94,.12)' },
  { key: 'role_count', label: '角色数量', icon: UserFilled, color: '#f59e0b', tint: 'rgba(245,158,11,.12)' },
  { key: 'menu_count', label: '菜单/按钮', icon: Menu, color: '#ef4444', tint: 'rgba(239,68,68,.1)' },
  { key: 'dept_count', label: '部门数量', icon: OfficeBuilding, color: '#8b5cf6', tint: 'rgba(139,92,246,.1)' },
] as const

const chartTextColor = () => {
  return document.documentElement.classList.contains('dark') ? '#94a3b8' : '#6b7280'
}

const renderTrend = (data: { name: string; value: number }[]) => {
  if (!trendRef.value) return
  trendChart = trendChart || echarts.init(trendRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: data.map((d) => d.name), axisLine: { lineStyle: { color: 'rgba(144,147,153,.4)' } } },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: 'rgba(144,147,153,.18)' } } },
    series: [
      {
        type: 'line',
        name: '登录次数',
        data: data.map((d) => d.value),
        smooth: true,
        symbolSize: 7,
        lineStyle: { width: 3 },
        itemStyle: { color: '#3b6ef6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,110,246,.25)' },
            { offset: 1, color: 'rgba(59,110,246,0)' },
          ]),
        },
      },
    ],
  })
  trendChart.setOption({ textStyle: { color: chartTextColor() } })
}

const renderDept = (data: { name: string; total: number }[]) => {
  if (!deptRef.value) return
  deptChart = deptChart || echarts.init(deptRef.value)
  deptChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 70, right: 30, top: 30, bottom: 30 },
    xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: 'rgba(144,147,153,.18)' } } },
    yAxis: { type: 'category', data: data.map((d) => d.name), axisLine: { lineStyle: { color: 'rgba(144,147,153,.4)' } } },
    series: [
      {
        type: 'bar',
        name: '人数',
        data: data.map((d) => d.total),
        barMaxWidth: 20,
        itemStyle: { borderRadius: [0, 6, 6, 0], color: '#8b5cf6' },
      },
    ],
  })
  deptChart.setOption({ textStyle: { color: chartTextColor() } })
}

const onResize = () => {
  trendChart?.resize()
  deptChart?.resize()
}

// 主题切换时图表文字颜色同步刷新
watch(
  () => appStore.theme,
  () => {
    if (!overview.value) return
    renderTrend(overview.value.login_trend)
    renderDept(overview.value.dept_users)
  },
)

onMounted(async () => {
  overview.value = await getOverview()
  renderTrend(overview.value.login_trend)
  renderDept(overview.value.dept_users)
  window.addEventListener('resize', onResize)
  timer = window.setInterval(async () => {
    overview.value = await getOverview()
  }, 60000)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (timer) window.clearInterval(timer)
  trendChart?.dispose()
  deptChart?.dispose()
})
</script>

<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div v-for="item in stats" :key="item.key" class="stat-card page-card">
        <div class="stat-icon" :style="{ background: item.tint, color: item.color }">
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overview?.[item.key] ?? '-' }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="charts">
      <div class="page-card chart-card">
        <div class="section-title">近7天登录趋势</div>
        <div ref="trendRef" class="chart" />
      </div>
      <div class="page-card chart-card">
        <div class="section-title">各部门人数</div>
        <div ref="deptRef" class="chart" />
      </div>
    </div>

    <!-- 最近登录 -->
    <div class="page-card">
      <div class="section-title">最近登录记录</div>
      <el-table :data="overview?.recent_login ?? []" stripe>
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="client" label="客户端" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.client }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="login_ip" label="登录IP" width="160" />
        <el-table-column prop="login_at" label="登录时间" min-width="180" :formatter="formatDateTimeCell" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === LoginStatus.Online ? 'success' : 'info'" size="small" effect="light">
              {{ LoginStatusLabels[row.status] ?? '未知' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.08);
}
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}
.stat-label {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}
.chart {
  height: 280px;
}
@media (max-width: 960px) {
  .charts {
    grid-template-columns: 1fr;
  }
}
</style>
