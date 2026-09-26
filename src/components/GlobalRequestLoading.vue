<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Loading } from '@element-plus/icons-vue'
import { useRequestStore } from '@/store/request'

const requestStore = useRequestStore()
const { queryLoading, actionLoading } = storeToRefs(requestStore)
</script>

<template>
  <Teleport to="body">
    <Transition name="query-loading">
      <div v-if="queryLoading && !actionLoading" class="query-loading" role="status" aria-live="polite">
        <span class="query-loading-track"><span class="query-loading-progress" /></span>
        <span class="query-loading-label">
          <el-icon class="is-loading" :size="14"><Loading /></el-icon>
          数据加载中
        </span>
      </div>
    </Transition>

    <Transition name="action-loading">
      <div v-if="actionLoading" class="action-loading" role="status" aria-live="assertive">
        <div class="action-loading-card">
          <span class="action-loading-icon"><el-icon class="is-loading" :size="23"><Loading /></el-icon></span>
          <span class="action-loading-copy">
            <strong>操作处理中</strong>
            <small>请稍候，请勿重复提交</small>
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.query-loading {
  position: fixed;
  top: 64px;
  left: 50%;
  z-index: 3000;
  min-width: 138px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 22%, var(--card-border));
  border-radius: 10px;
  background: color-mix(in srgb, var(--card-bg) 94%, transparent);
  color: var(--el-text-color-regular);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(10px);
  transform: translateX(-50%);
  pointer-events: none;
}
.query-loading-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  overflow: hidden;
  background: var(--el-color-primary-light-9);
}
.query-loading-progress {
  display: block;
  width: 45%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent, var(--el-color-primary), transparent);
  animation: query-progress 1.1s ease-in-out infinite;
}
.query-loading-label {
  height: 38px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13px;
  white-space: nowrap;
}
.query-loading-label .el-icon {
  color: var(--el-color-primary);
}
.action-loading {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(1.5px);
}
.action-loading-card {
  min-width: 228px;
  padding: 17px 20px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  background: var(--card-bg);
  color: var(--el-text-color-primary);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.2);
}
.action-loading-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.action-loading-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.action-loading-copy strong {
  font-size: 14px;
  font-weight: 600;
}
.action-loading-copy small {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.query-loading-enter-active,
.query-loading-leave-active,
.action-loading-enter-active,
.action-loading-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.query-loading-enter-from,
.query-loading-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}
.action-loading-enter-from,
.action-loading-leave-to {
  opacity: 0;
}
.action-loading-enter-from .action-loading-card,
.action-loading-leave-to .action-loading-card {
  transform: translateY(5px) scale(0.98);
}
.action-loading-card {
  transition: transform 0.18s ease;
}
@keyframes query-progress {
  from { transform: translateX(-110%); }
  to { transform: translateX(260%); }
}
</style>
