<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{ title: string; icon: Component; more?: boolean }>()
</script>

<template>
  <div class="page-card dash-card">
    <div class="dash-card__head">
      <span class="dash-card__icon">
        <el-icon :size="15"><component :is="icon" /></el-icon>
      </span>
      <span class="dash-card__title">{{ title }}</span>
      <span v-if="more" class="dash-card__more">更多</span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.dash-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.dash-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.dash-card__icon {
  display: inline-flex;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.dash-card__title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.dash-card__more {
  margin-left: auto;
  color: var(--el-color-primary);
  cursor: default;
  font-size: 12px;
}
</style>
