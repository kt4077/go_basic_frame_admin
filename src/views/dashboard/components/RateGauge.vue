<script setup lang="ts">
import { DataLine } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { ratePrice } from '../mock'
import { useChart } from '../useChart'

const { el } = useChart((chart) => {
  chart.setOption({
    series: [
      {
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        radius: '92%',
        center: ['50%', '52%'],
        min: 0,
        max: 200,
        progress: {
          show: true,
          width: 12,
          roundCap: true,
          itemStyle: { color: '#3b6ef6' },
        },
        axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(59,110,246,.12)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-4%'],
          formatter: (value: number) => Number(value).toFixed(2),
          fontSize: 22,
          fontWeight: 700,
          color: '#3b6ef6',
        },
        data: [{ value: ratePrice.averagePrice }],
      },
    ],
  })
})
</script>

<template>
  <DashboardCard title="客单/转化" :icon="DataLine">
    <div ref="el" class="chart" />
    <div class="gauge-label">客单价（元）</div>
    <div class="rate-rows">
      <div v-for="item in ratePrice.rates" :key="item.name" class="rate-row">
        <span class="rate-row__name">{{ item.name }}</span>
        <el-progress
          class="rate-row__bar"
          :percentage="item.value"
          :stroke-width="10"
          :show-text="false"
          color="#3b6ef6"
        />
        <span class="rate-row__value">{{ item.value }}%</span>
      </div>
    </div>
  </DashboardCard>
</template>

<style scoped>
.chart {
  height: 150px;
}

.gauge-label {
  margin-top: -6px;
  color: var(--el-text-color-secondary);
  text-align: center;
  font-size: 12px;
}

.rate-rows {
  display: flex;
  margin-top: 14px;
  flex-direction: column;
  gap: 12px;
}

.rate-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rate-row__name {
  width: 56px;
  flex-shrink: 0;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.rate-row__bar {
  flex: 1;
}

.rate-row__value {
  width: 52px;
  flex-shrink: 0;
  color: var(--el-text-color-primary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
