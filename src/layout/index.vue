<script setup lang="ts">
// 整体布局：顶栏（logo/名称/菜单缩进按钮）+ 左侧两列菜单 + 右侧内容区（顶部为标签栏）
import HeaderBar from './components/HeaderBar.vue'
import SideMenu from './components/SideMenu.vue'
import SubMenuPanel from './components/SubMenuPanel.vue'
import TagsView from './components/TagsView.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import type { TreeNode } from '@/types/common'
import type { MenuItem } from '@/types/menu'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const containsPath = (node: TreeNode<MenuItem>, p: string): boolean => {
  if (node.data.path === p) return true
  return (node.children ?? []).some((c) => containsPath(c, p))
}

/** 当前路由命中的二级节点（其三级及以下层级展示到第二列） */
const activeSecondLevel = computed<TreeNode<MenuItem> | null>(() => {
  const path = route.path
  for (const top of userStore.routers) {
    if (top.data.path === path) return null // 一级叶子直接命中，无第二列
    for (const second of top.children ?? []) {
      if (containsPath(second, path)) return second
    }
  }
  return null
})

/** 第二列展示：命中的二级节点整体作为可展开节点（带箭头，与第一列交互一致） */
const subTree = computed(() => (activeSecondLevel.value ? [activeSecondLevel.value] : []))
const panelTitle = computed(() => activeSecondLevel.value?.data.name ?? '')
const panelVisible = computed(() => subTree.value.length > 0)
</script>

<template>
  <div class="layout">
    <HeaderBar />
    <div class="layout-body">
      <SideMenu class="side-menu" :class="{ collapsed: appStore.sidebarCollapsed }" />
      <SubMenuPanel v-if="panelVisible && !appStore.sidebarCollapsed" :title="panelTitle" :items="subTree" />
      <div class="layout-main">
        <TagsView />
        <main class="layout-content">
          <router-view v-slot="{ Component }">
            <transition name="page">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.side-menu {
  width: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  transition: width 0.2s ease;
}
.side-menu.collapsed {
  width: 64px;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px; /* 内容与左侧菜单/顶部标签栏的间距 */
  background: var(--page-bg);
}
@media (max-width: 768px) {
  .side-menu {
    width: 64px;
  }
  .side-menu :deep(span) {
    display: none;
  }
}
</style>
