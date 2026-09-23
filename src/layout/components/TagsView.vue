<script setup lang="ts">
// 页面标签栏：进入页面自动添加标签，点击切换、可关闭单个，右键支持关闭其他/所有
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, Grid, Refresh } from '@element-plus/icons-vue'
import { useTagsStore, type TagItem } from '@/store/tags'
import { useUserStore } from '@/store/user'
import { firstLeafPath } from '@/router'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsStore()
const userStore = useUserStore()

/** 默认首页：固定标签，不可关闭 */
const affixPath = computed(() => firstLeafPath(userStore.routers) || '/')

const titleOf = (path: string): string => {
  const find = (nodes: TreeNode<MenuItem>[]): string => {
    for (const node of nodes) {
      if (node.data.path === path) return node.data.name
      if (node.children) {
        const t = find(node.children)
        if (t) return t
      }
    }
    return ''
  }
  return find(userStore.routers)
}

// 保证固定标签存在
if (affixPath.value && !tagsStore.tags.some((t) => t.path === affixPath.value)) {
  tagsStore.add({ path: affixPath.value, title: titleOf(affixPath.value) || '首页', affix: true })
}

// ---------- 右键菜单：关闭其他 / 关闭所有 ----------
const menu = ref({ visible: false, x: 0, y: 0, path: '' })

const closeMenu = () => {
  menu.value.visible = false
}

// 路由变化时记录新标签（404 等无名称页面不记录）
watch(
  () => route.path,
  () => {
    if (!route.name || route.path === '/' || route.path.startsWith('/redirect/')) return
    tagsStore.add({
      path: route.path,
      title: (route.meta.title as string) || titleOf(route.path) || route.path,
      affix: false,
    })
    closeMenu()
  },
  { immediate: true },
)

const onClose = (tag: TagItem) => {
  if (tag.affix) return
  const index = tagsStore.tags.findIndex((t) => t.path === tag.path)
  tagsStore.remove(tag.path)
  // 关闭的是当前页时，跳到相邻标签
  if (route.path === tag.path) {
    const next = tagsStore.tags[index] ?? tagsStore.tags[tagsStore.tags.length - 1]
    router.push(next ? next.path : affixPath.value)
  }
}

/** 当前激活标签 */
const activeTag = computed(() => tagsStore.tags.find((t) => t.path === route.path))
const activeIsAffix = computed(() => activeTag.value?.affix ?? false)

const onCloseCurrent = () => {
  if (activeTag.value) onClose(activeTag.value)
}

/** 标签栏右上角操作 */
const onCommand = (cmd: string) => {
  if (cmd === 'refresh') {
    router.replace('/redirect' + route.fullPath)
  } else if (cmd === 'closeCurrent') {
    onCloseCurrent()
  } else if (cmd === 'closeOthers') {
    tagsStore.closeOthers(route.path)
  } else if (cmd === 'closeAll') {
    onCloseAll()
  }
}

const onContextMenu = (e: MouseEvent, tag: TagItem) => {
  menu.value = { visible: true, x: e.clientX, y: e.clientY, path: tag.path }
}

const onCloseOthers = () => {
  tagsStore.closeOthers(menu.value.path)
  if (route.path !== menu.value.path) router.push(menu.value.path)
  closeMenu()
}

const onCloseAll = () => {
  tagsStore.closeAll()
  if (!tagsStore.tags.some((t) => t.path === route.path)) {
    router.push(affixPath.value)
  }
  closeMenu()
}

onMounted(() => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))
</script>

<template>
  <div class="tags-view">
    <div class="tags-scroll">
      <span
        v-for="tag in tagsStore.tags"
        :key="tag.path"
        class="tag-item"
        :class="{ active: tag.path === route.path }"
        @click="router.push(tag.path)"
        @contextmenu.prevent="onContextMenu($event, tag)"
      >
        <span class="tag-dot" />
        {{ tag.title }}
        <el-icon v-if="!tag.affix" class="tag-close" @click.stop="onClose(tag)"><Close /></el-icon>
      </span>
    </div>

    <el-dropdown trigger="click" placement="bottom-end" @command="onCommand">
      <button class="tags-op" title="标签操作">
        <el-icon :size="14"><Grid /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon>刷新当前页
          </el-dropdown-item>
          <el-dropdown-item command="closeCurrent" :disabled="activeIsAffix">
            <el-icon><Close /></el-icon>关闭当前标签
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers">
            <el-icon><CircleClose /></el-icon>关闭其它
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <el-icon><RemoveFilled /></el-icon>全部关闭
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div
      v-if="menu.visible"
      class="ctx-menu"
      :style="{ left: menu.x + 'px', top: menu.y + 'px' }"
    >
      <div class="ctx-item" @click="onCloseOthers">关闭其他</div>
      <div class="ctx-item" @click="onCloseAll">关闭所有</div>
    </div>
  </div>
</template>

<style scoped>
.tags-view {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--card-border);
  padding: 5px 12px;
}
.tags-scroll {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tags-op {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  margin-right: 8px; /* 与浏览器右侧边框保持间距（弹层对齐按钮右缘） */
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.2s, border-color 0.2s;
}
.tags-op:hover {
  filter: brightness(0.95);
  border-color: var(--el-color-primary-light-5);
}
.tags-scroll::-webkit-scrollbar {
  display: none;
}
.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--card-border);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.tag-item:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-7);
}
.tag-item.active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}
.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-text-color-secondary);
  opacity: 0.5;
}
.tag-item.active .tag-dot {
  background: var(--el-color-primary);
  opacity: 1;
}
.tag-close {
  font-size: 12px;
  border-radius: 2px;
  color: var(--el-text-color-secondary);
  transition: background-color 0.2s, color 0.2s;
}
.tag-close:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--el-text-color-primary);
}
.ctx-menu {
  position: fixed;
  z-index: 3000;
  min-width: 100px;
  padding: 4px 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.12);
}
.ctx-item {
  padding: 7px 16px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
}
.ctx-item:hover {
  background: var(--sidebar-hover-bg);
  color: var(--el-color-primary);
}
</style>
