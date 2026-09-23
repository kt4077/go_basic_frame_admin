<script setup lang="ts">
// 菜单节点递归渲染：叶子渲染 menu-item，目录渲染 sub-menu（支持无限级）
import type { TreeNode } from '@/types/common'
import type { MenuItem } from '@/types/menu'

defineProps<{
  items: TreeNode<MenuItem>[]
}>()

defineEmits<{
  (e: 'select', node: TreeNode<MenuItem>): void
}>()
</script>

<template>
  <template v-for="node in items" :key="node.data.id">
    <el-menu-item
      v-if="!node.children || node.children.length === 0"
      :index="node.data.path || String(node.data.id)"
      @click="$emit('select', node)"
    >
      <span>{{ node.data.name }}</span>
    </el-menu-item>
    <el-sub-menu v-else :index="String(node.data.id)">
      <template #title>
        <span>{{ node.data.name }}</span>
      </template>
      <MenuNodeList :items="node.children" @select="$emit('select', $event)" />
    </el-sub-menu>
  </template>
</template>
