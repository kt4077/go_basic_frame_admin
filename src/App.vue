<script setup lang="ts">
// 根组件：路由出口 + 全局水印容器
// 注意：router-view 不能用 route.fullPath 做 key，否则每次导航整个布局都会重建（白屏闪烁）
import { computed } from 'vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const watermarkOptions = computed(() => ({
  enabled: appStore.watermark.enabled,
  text: appStore.watermark.text,
  opacity: appStore.watermark.opacity,
}))
</script>

<template>
  <div v-watermark="watermarkOptions" class="app-root">
    <router-view />
  </div>
</template>

<style scoped>
.app-root {
  height: 100%;
}
</style>
