<script setup lang="ts">
// 第一列菜单：只渲染两级（一级 + 二级）；二级若还有子级，点击后进入第二列展示
// 支持折叠模式（仅显示图标，hover 弹出子菜单）
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import type { TreeNode } from '@/types/common'
import type { MenuItem } from '@/types/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

/** 点击菜单节点：跳到该分支的第一个叶子路由（有子级时由第二列承接更深层级） */
const onNodeClick = (node: TreeNode<MenuItem>) => {
  const firstLeaf = (n: TreeNode<MenuItem>): TreeNode<MenuItem> =>
    n.children && n.children.length > 0 ? firstLeaf(n.children[0]) : n
  const target = firstLeaf(node)
  if (target.data.path && target.data.path !== route.path) {
    router.push(target.data.path)
  }
}
</script>

<template>
  <el-menu
    :default-active="route.path"
    :collapse="appStore.sidebarCollapsed"
    :collapse-transition="false"
    unique-opened
  >
    <template v-for="top in userStore.routers" :key="top.data.id">
      <!-- 一级叶子 -->
      <el-menu-item
        v-if="!top.children || top.children.length === 0"
        :index="top.data.path || String(top.data.id)"
        @click="onNodeClick(top)"
      >
        <el-icon v-if="top.data.icon"><component :is="top.data.icon" /></el-icon>
        <template #title>{{ top.data.name }}</template>
      </el-menu-item>

      <!-- 一级目录：展开显示二级 -->
      <el-sub-menu v-else :index="String(top.data.id)">
        <template #title>
          <el-icon v-if="top.data.icon"><component :is="top.data.icon" /></el-icon>
          <span>{{ top.data.name }}</span>
        </template>
        <el-menu-item
          v-for="second in top.children"
          :key="second.data.id"
          :index="second.data.path || String(second.data.id)"
          @click="onNodeClick(second)"
        >
          <el-icon v-if="second.data.icon"><component :is="second.data.icon" /></el-icon>
          <template #title>{{ second.data.name }}</template>
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>
