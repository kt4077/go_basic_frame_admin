<script setup lang="ts">
import { ChatDotRound } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { noticeTenants } from '../mock'
</script>

<template>
  <DashboardCard title="待发货订单" :icon="ChatDotRound" more>
    <div class="notice-list">
      <div v-for="(item, index) in noticeTenants" :key="index" class="notice-item">
        <span class="notice-name">{{ item.name }}</span>
        <span class="notice-amount">{{ item.amount }}</span>
      </div>
    </div>
  </DashboardCard>
</template>

<style scoped>
.notice-list {
  display: flex;
  max-height: 246px;
  flex-direction: column;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-name {
  overflow: hidden;
  color: var(--el-color-primary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-amount {
  flex-shrink: 0;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}
</style>
