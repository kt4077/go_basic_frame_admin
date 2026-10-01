<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { investmentReminders } from '../mock'
</script>

<template>
  <DashboardCard title="售后提醒" :icon="Bell" more>
    <div class="remind-list">
      <div v-for="(item, index) in investmentReminders" :key="index" class="remind-item">
        <span class="remind-name">{{ item.name }}</span>
        <span class="remind-tag">{{ item.tag }}</span>
        <span class="remind-time">{{ item.time }}</span>
      </div>
    </div>
  </DashboardCard>
</template>

<style scoped>
.remind-list {
  display: flex;
  max-height: 246px;
  flex-direction: column;
  overflow-y: auto;
}

.remind-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.remind-item:last-child {
  border-bottom: none;
}

.remind-name {
  overflow: hidden;
  min-width: 0;
  flex: 1;
  color: var(--el-color-primary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remind-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  font-size: 11px;
}

.remind-time {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
