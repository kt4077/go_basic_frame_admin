<script setup lang="ts">
import { ref, watch } from 'vue'
import { dealTrend, rentTrend } from '../mock'
import { chartAxisColor, useChart } from '../useChart'
import echarts from '@/utils/echarts'

type TrendMode = 'rent' | 'deal'

const mode = ref<TrendMode>('rent')

const { el, redraw } = useChart((chart) => {
  const axisColor = chartAxisColor()
  const base = {
    tooltip: { trigger: 'axis' },
    grid: { left: 46, right: 14, top: 34, bottom: 26 },
    xAxis: {
      type: 'category',
      data: rentTrend.months,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(144,147,153,.4)' } },
      axisLabel: { color: axisColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: mode.value === 'rent' ? '单位/万元' : '单位/单',
      nameTextStyle: { color: axisColor, padding: [0, 20, 0, 0] },
      axisLabel: { color: axisColor },
      splitLine: { lineStyle: { color: 'rgba(144,147,153,.18)' } },
    },
  }
  if (mode.value === 'rent') {
    chart.setOption({
      ...base,
      legend: {
        right: 0,
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: axisColor, fontSize: 12 },
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 3 },
          itemStyle: { color: '#3b6ef6' },
          data: rentTrend.renew,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,110,246,.25)' },
              { offset: 1, color: 'rgba(59,110,246,0)' },
            ]),
          },
        },
        {
          name: '退款额',
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 3 },
          itemStyle: { color: '#14b8a6' },
          data: rentTrend.newRent,
        },
      ],
    })
    return
  }
  chart.setOption({
    ...base,
    series: [
      {
        name: '订单量',
        type: 'bar',
        barWidth: 24,
        data: dealTrend.values,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#7db5ff' },
            { offset: 1, color: 'rgba(59,110,246,.3)' },
          ]),
        },
      },
    ],
  })
})

watch(mode, () => redraw())
</script>

<template>
  <div class="page-card trend-card">
    <div class="trend-tabs">
      <span class="trend-tab" :class="{ 'is-active': mode === 'rent' }" @click="mode = 'rent'">
        近6个月销售额走势
      </span>
      <span class="trend-tab" :class="{ 'is-active': mode === 'deal' }" @click="mode = 'deal'">
        近6个月订单量走势
      </span>
    </div>
    <div ref="el" class="chart" />
  </div>
</template>

<style scoped>
.trend-card {
  display: flex;
  flex-direction: column;
}

.trend-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.trend-tab {
  padding-bottom: 6px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.trend-tab.is-active {
  color: var(--el-color-primary);
  font-weight: 600;
  border-bottom-color: var(--el-color-primary);
}

.chart {
  flex: 1;
  min-height: 236px;
}
</style>
