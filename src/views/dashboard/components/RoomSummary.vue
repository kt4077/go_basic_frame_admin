<script setup lang="ts">
import { Goods } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { roomSummary } from '../mock'
import { useChart } from '../useChart'

const { el } = useChart((chart) => {
  chart.setOption({
    title: {
      text: String(roomSummary.total),
      subtext: '商品总数',
      left: 'center',
      top: '33%',
      textStyle: { fontSize: 28, fontWeight: 700 },
      subtextStyle: { fontSize: 12 },
    },
    tooltip: { trigger: 'item', formatter: '{b}：{c}（{d}%）' },
    series: [
      {
        type: 'pie',
        radius: ['60%', '84%'],
        center: ['50%', '46%'],
        // 分段之间留出间隙并做圆角，与设计稿一致
        padAngle: 2,
        itemStyle: { borderRadius: 12 },
        label: { show: false },
        labelLine: { show: false },
        data: roomSummary.items.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  })
})

const percent = (value: number) => `${((value / roomSummary.total) * 100).toFixed(2)}%`
</script>

<template>
  <DashboardCard title="商品概况" :icon="Goods">
    <div ref="el" class="chart" />
    <div class="legend-grid">
      <div v-for="item in roomSummary.items" :key="item.name" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }" />
        <span class="legend-name">{{ item.name }}</span>
        <span class="legend-count">{{ item.value }}</span>
        <span class="legend-percent">{{ percent(item.value) }}</span>
      </div>
    </div>
  </DashboardCard>
</template>

<style scoped>
.chart {
  height: 216px;
}

.legend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  margin-top: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.legend-name {
  color: var(--el-text-color-regular);
}

.legend-count {
  margin-left: auto;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.legend-percent {
  width: 52px;
  color: var(--el-text-color-secondary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
