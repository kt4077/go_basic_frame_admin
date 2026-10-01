<script setup lang="ts">
import { Tickets } from '@element-plus/icons-vue'
import DashboardCard from './DashboardCard.vue'
import { approvals } from '../mock'
</script>

<template>
  <DashboardCard title="进行中的审批" :icon="Tickets" more>
    <div class="approval-list">
      <div v-for="(item, index) in approvals" :key="index" class="approval-item">
        <div class="approval-head">
          <span class="approval-title">{{ item.title }}</span>
          <span class="approval-tag">{{ item.tag }}</span>
        </div>
        <div class="approval-desc">{{ item.desc }}</div>
        <div class="approval-meta">
          <span>成文人：{{ item.author }}</span>
          <span>{{ item.time }}</span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>

<style scoped>
.approval-list {
  display: flex;
  max-height: 246px;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.approval-item {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

.approval-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.approval-title {
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.approval-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 4px;
  color: var(--el-color-warning);
  font-size: 11px;
}

.approval-desc {
  display: -webkit-box;
  margin-top: 6px;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.approval-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
</style>
