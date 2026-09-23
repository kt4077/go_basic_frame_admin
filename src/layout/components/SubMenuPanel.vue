<script setup lang="ts">
// 第二列菜单：展示选中二级菜单下的第三级及以下层级（无限级，递归渲染）
import { useRoute, useRouter } from 'vue-router'
import type { TreeNode } from '@/types/common'
import type { MenuItem } from '@/types/menu'
import MenuNodeList from './MenuNodeList.vue'

defineProps<{
  title: string
  items: TreeNode<MenuItem>[]
}>()

const route = useRoute()
const router = useRouter()

const onLeafClick = (node: TreeNode<MenuItem>) => {
  if (node.data.path && node.data.path !== route.path) {
    router.push(node.data.path)
  }
}
</script>

<template>
  <aside class="sub-menu-panel">
    <div class="panel-title">{{ title }}</div>
    <el-menu :default-active="route.path">
      <MenuNodeList :items="items" @select="onLeafClick" />
    </el-menu>
  </aside>
</template>

<style scoped>
.sub-menu-panel {
  width: 160px;
  flex-shrink: 0;
  overflow-y: auto;
  background: var(--sidebar-bg); /* 与一级菜单同色 */
  border-left: 1px solid var(--sidebar-border);
}
.panel-title {
  padding: 16px 20px 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--el-text-color-secondary);
}
</style>
