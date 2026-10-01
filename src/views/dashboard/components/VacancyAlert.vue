<script setup lang="ts">
import { Box } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { vacancyAlert } from '../mock'
import { chartAxisColor, useChart } from '../useChart'
import echarts from '@/utils/echarts'

const { el } = useChart((chart) => {
  const axisColor = chartAxisColor()
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: {
      right: 0,
      top: 0,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: axisColor, fontSize: 12 },
    },
    grid: { left: 44, right: 12, top: 36, bottom: 26 },
    xAxis: {
      type: 'category',
      data: vacancyAlert.items.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'rgba(144,147,153,.4)' } },
      axisLabel: { color: axisColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '单位/件',
      nameTextStyle: { color: axisColor, padding: [0, 24, 0, 0] },
      axisLabel: { color: axisColor },
      splitLine: { lineStyle: { color: 'rgba(144,147,153,.18)' } },
    },
    series: [
      {
        name: vacancyAlert.legend,
        type: 'bar',
        barWidth: 24,
        data: vacancyAlert.items.map((item) => item.value),
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
</script>

<template>
  <DashboardCard title="库存预警" :icon="Box">
    <div ref="el" class="chart" />
  </DashboardCard>
</template>

<style scoped>
.chart {
  height: 268px;
}
</style>
