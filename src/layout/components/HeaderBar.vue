<script setup lang="ts">
// 顶栏：品牌区、主题切换、水印设置、用户菜单（与侧栏共用同一表面色）
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Moon, Sunny, Setting, ArrowDown, ArrowRight, Fold, Expand, FullScreen, Location } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { usePlatformStore } from '@/store/platform'
import type { TreeNode } from '@/types/common'
import type { MenuItem } from '@/types/menu'

const appStore = useAppStore()
const userStore = useUserStore()
const platformStore = usePlatformStore()
const router = useRouter()
const route = useRoute()

const settingsVisible = ref(false)

// 全屏切换
const isFullscreen = ref(false)
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  platformStore.loadAdminConfig()
})
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreenChange))
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}
const watermarkText = ref(appStore.watermark.text)
const themeIcon = computed(() => (appStore.theme === 'light' ? Moon : Sunny))
const avatarChar = computed(() =>
  (userStore.userInfo?.nickname || userStore.userInfo?.username || '?').slice(0, 1),
)

/** 从权限菜单树中解析当前页面的完整层级路径。 */
const findMenuPath = (nodes: TreeNode<MenuItem>[], path: string, parents: string[] = []): string[] => {
  for (const node of nodes) {
    const current = [...parents, node.data.name]
    if (node.data.path === path) return current
    const matched = findMenuPath(node.children ?? [], path, current)
    if (matched.length > 0) return matched
  }
  return []
}

const currentPagePath = computed(() => {
  const menuPath = findMenuPath(userStore.routers, route.path)
  if (menuPath.length > 0) return menuPath
  const title = route.meta.title
  return typeof title === 'string' && title ? [title] : [route.path]
})

const toggleTheme = () => {
  appStore.setTheme(appStore.theme === 'light' ? 'dark' : 'light')
}

const saveWatermark = () => {
  appStore.setWatermark({ text: watermarkText.value })
  settingsVisible.value = false
  ElMessage.success('水印设置已保存')
}

const onLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const openProfile = () => router.push('/profile')
</script>

<template>
  <header class="header-bar">
    <div class="brand">
      <div class="brand-mark" :class="{ 'has-logo': platformStore.adminConfig.logo }">
        <img v-if="platformStore.adminConfig.logo" :src="platformStore.adminConfig.logo" alt="系统Logo" />
        <el-icon v-else :size="17"><Platform /></el-icon>
      </div>
      <span class="brand-name">{{ platformStore.adminConfig.system_name }}</span>
      <el-tooltip :content="appStore.sidebarCollapsed ? '展开菜单' : '收起菜单'" placement="bottom">
        <button class="header-action collapse-toggle" @click="appStore.toggleSidebar()">
          <el-icon :size="17"><component :is="appStore.sidebarCollapsed ? Expand : Fold" /></el-icon>
        </button>
      </el-tooltip>
    </div>

    <nav class="page-meta" aria-label="当前页面路径">
      <span class="page-meta-icon"><el-icon :size="14"><Location /></el-icon></span>
      <span class="page-meta-label">当前位置</span>
      <span v-for="(item, index) in currentPagePath" :key="`${item}-${index}`" class="page-meta-node">
        <el-icon v-if="index > 0" :size="11" class="page-meta-separator"><ArrowRight /></el-icon>
        <span :class="{ current: index === currentPagePath.length - 1 }">{{ item }}</span>
      </span>
    </nav>

    <div class="spacer" />

    <el-tooltip :content="appStore.theme === 'light' ? '切换暗色' : '切换亮色'" placement="bottom">
      <button class="header-action" @click="toggleTheme">
        <el-icon :size="17"><component :is="themeIcon" /></el-icon>
      </button>
    </el-tooltip>
    <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
      <button class="header-action" @click="toggleFullscreen">
        <el-icon :size="17"><FullScreen /></el-icon>
      </button>
    </el-tooltip>
    <el-tooltip content="水印设置" placement="bottom">
      <button class="header-action" @click="settingsVisible = true">
        <el-icon :size="17"><Setting /></el-icon>
      </button>
    </el-tooltip>

    <el-dropdown>
      <div class="user-chip">
        <el-avatar :size="30" :src="userStore.userInfo?.avatar" class="avatar">{{ avatarChar }}</el-avatar>
        <span class="user-name">
          {{ userStore.userInfo?.nickname || userStore.userInfo?.username }}
        </span>
        <el-icon :size="12" class="user-arrow"><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="openProfile">个人设置</el-dropdown-item>
          <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>

  <!-- 水印设置弹窗 -->
  <el-dialog v-model="settingsVisible" title="水印设置" width="420px">
    <el-form label-position="left" label-width="90px">
      <el-form-item label="启用水印">
        <el-switch
          v-model="appStore.watermark.enabled"
          @change="appStore.setWatermark({ enabled: appStore.watermark.enabled })"
        />
      </el-form-item>
      <el-form-item label="水印文字">
        <el-input v-model="watermarkText" placeholder="请输入水印文字" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="settingsVisible = false">取消</el-button>
      <el-button type="primary" @click="saveWatermark">保存</el-button>
    </template>
  </el-dialog>

</template>

<style scoped>
.header-bar {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  color: var(--el-text-color-primary);
  position: relative;
  z-index: 5;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--el-color-primary), #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(59, 110, 246, 0.35);
  overflow: hidden;
}
.brand-mark img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: inherit;
}
.brand-mark.has-logo {
  background: transparent;
  box-shadow: none;
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.collapse-toggle {
  margin-left: 12px;
}
.page-meta {
  min-width: 0;
  max-width: min(42vw, 560px);
  height: 32px;
  margin-left: 6px;
  padding: 0 11px 0 7px;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border: 1px solid var(--topbar-border);
  border-radius: 9px;
  background: color-mix(in srgb, var(--sidebar-hover-bg) 65%, transparent);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}
.page-meta-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  color: var(--el-color-primary);
}
.page-meta-label {
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
.page-meta-node {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}
.page-meta-node span {
  overflow: hidden;
  text-overflow: ellipsis;
}
.page-meta-node span.current {
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.page-meta-separator {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}
.spacer {
  flex: 1;
}
.header-action {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--el-text-color-regular);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.header-action:hover {
  background: var(--sidebar-hover-bg);
  color: var(--el-color-primary);
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  margin-left: 6px;
  border-radius: 10px;
  outline: none;
  transition: background-color 0.2s;
}
.user-chip:hover {
  background: var(--sidebar-hover-bg);
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--el-color-primary), #8b5cf6);
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
}
.user-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.user-arrow {
  color: var(--el-text-color-secondary);
}
@media (max-width: 900px) {
  .page-meta-label,
  .page-meta-node:not(:last-child) {
    display: none;
  }
  .page-meta {
    max-width: 180px;
  }
}
@media (max-width: 640px) {
  .brand-name,
  .page-meta {
    display: none;
  }
  .collapse-toggle {
    margin-left: 2px;
  }
  .user-name {
    display: none;
  }
}
</style>
