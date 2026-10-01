<script setup lang="ts">
import { CreditCard, Coin, DataLine, Money, Wallet } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { overviewStats } from '../mock'

const tileIcons = [
  Wallet,
  Coin,
  Money,
  CreditCard,
  Wallet,
  Coin,
  Money,
  CreditCard,
  Wallet,
  Coin,
  Money,
  CreditCard,
]
</script>

<template>
  <DashboardCard title="数字概览" :icon="DataLine" more>
    <div class="stat-grid">
      <div
        v-for="(item, index) in overviewStats"
        :key="item.label"
        class="stat-tile"
        :style="{ background: `linear-gradient(135deg, ${item.color}26, ${item.color}0f)` }"
      >
        <div class="stat-tile__label" :style="{ color: item.color }">
          {{ item.label }}
        </div>
        <div class="stat-tile__value">
          <span class="stat-tile__yen">¥</span>
          {{ item.value }}
        </div>
        <span class="stat-tile__more" :style="{ color: item.color }">详情 &gt;</span>
        <el-icon class="stat-tile__icon" :size="38" :style="{ color: item.color }">
          <component :is="tileIcons[index]" />
        </el-icon>
      </div>
    </div>
  </DashboardCard>
</template>

<style scoped>
.stat-grid {
  display: grid;
  flex: 1;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-tile {
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 10px;
}

.stat-tile__label {
  font-size: 12px;
  line-height: 1.4;
}

.stat-tile__value {
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.stat-tile__yen {
  font-size: 14px;
  font-weight: 600;
}

.stat-tile__more {
  display: inline-block;
  cursor: default;
  font-size: 12px;
}

.stat-tile__icon {
  position: absolute;
  right: 10px;
  bottom: 8px;
  opacity: 0.4;
}

@media (max-width: 1600px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
