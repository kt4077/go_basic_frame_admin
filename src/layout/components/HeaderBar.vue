<script setup lang="ts">
// 顶栏：品牌区、主题切换、水印设置、用户菜单（与侧栏共用同一表面色）
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Moon, Sunny, Setting, ArrowDown, Fold, Expand, FullScreen } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const settingsVisible = ref(false)

// 全屏切换
const isFullscreen = ref(false)
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}
onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
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
      <div class="brand-mark">
        <el-icon :size="17"><Platform /></el-icon>
      </div>
      <span class="brand-name">后台管理系统</span>
      <el-tooltip :content="appStore.sidebarCollapsed ? '展开菜单' : '收起菜单'" placement="bottom">
        <button class="header-action collapse-toggle" @click="appStore.toggleSidebar()">
          <el-icon :size="17"><component :is="appStore.sidebarCollapsed ? Expand : Fold" /></el-icon>
        </button>
      </el-tooltip>
    </div>

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
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.collapse-toggle {
  margin-left: 12px;
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
</style>
