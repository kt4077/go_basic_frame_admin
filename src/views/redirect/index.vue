<script setup lang="ts">
// 刷新中转页：跳到 /redirect/xxx 后立即 replace 回原路径，实现当前页无感刷新
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  await router.replace({
    path: '/' + (route.params.path as string),
    query: route.query,
  })
})
</script>

<template>
  <div class="redirect-loading">
    <el-icon class="is-loading" :size="24" color="var(--el-color-primary)"><Loading /></el-icon>
  </div>
</template>

<style scoped>
.redirect-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
