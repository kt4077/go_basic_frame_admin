<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DataLine,
  Discount,
  Document,
  Goods,
  Grid,
  Money,
  Odometer,
  SuccessFilled,
  User,
  Van,
  WarningFilled,
} from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { deviceStats, quickEntries } from '../mock'

const entryIcons = [Goods, Document, Money, Discount, User, Grid, Van, DataLine]

const deviceTypes = deviceStats.map((item) => item.type)
const activeDevice = ref(deviceTypes[0])
const activeStat = computed(
  () => deviceStats.find((item) => item.type === activeDevice.value) ?? deviceStats[0],
)
</script>

<template>
  <div class="quick-panel">
    <DashboardCard title="快捷入口" :icon="Grid" more>
      <div class="entry-grid">
        <div v-for="(item, index) in quickEntries" :key="item.label" class="entry-item">
          <span class="entry-icon" :style="{ background: item.color }">
            <el-icon :size="22"><component :is="entryIcons[index]" /></el-icon>
          </span>
          <span class="entry-label">{{ item.label }}</span>
        </div>
      </div>
    </DashboardCard>
    <DashboardCard title="支付渠道" :icon="Odometer" more>
      <div class="device-tabs">
        <span
          v-for="type in deviceTypes"
          :key="type"
          class="device-tab"
          :class="{ 'is-active': activeDevice === type }"
          @click="activeDevice = type"
        >
          {{ type }}
        </span>
      </div>
      <div class="device-stats">
        <div class="device-stat">
          <el-icon :size="18" color="#3b6ef6"><Odometer /></el-icon>
          <span class="device-stat__label">笔数</span>
          <span class="device-stat__value">{{ activeStat.count }}<small> 笔</small></span>
        </div>
        <div class="device-stat">
          <el-icon :size="18" color="#22c55e"><SuccessFilled /></el-icon>
          <span class="device-stat__label">成功</span>
          <span class="device-stat__value is-success">{{ activeStat.online }}<small> 笔</small></span>
        </div>
        <div class="device-stat">
          <el-icon :size="18" color="#f43f5e"><WarningFilled /></el-icon>
          <span class="device-stat__label">失败</span>
          <span class="device-stat__value is-danger">{{ activeStat.offline }}<small> 笔</small></span>
        </div>
      </div>
    </DashboardCard>
  </div>
</template>

<style scoped>
.quick-panel {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 14px;
}

.quick-panel > :deep(.dash-card) {
  flex: 1;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 8px;
}

.entry-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
}

.entry-icon {
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #ffffff;
  box-shadow: 0 6px 14px rgb(0 0 0 / 12%);
}

.entry-label {
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.device-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.device-tab {
  padding: 4px 14px;
  border-radius: 14px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.device-tab.is-active {
  background: var(--el-color-primary);
  color: #ffffff;
}

.device-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.device-stat {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

.device-stat__label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.device-stat__value {
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.device-stat__value small {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.device-stat__value.is-success {
  color: var(--el-color-success);
}

.device-stat__value.is-danger {
  color: var(--el-color-danger);
}
</style>
