// 登录用户状态：token、用户信息、菜单树、接口权限
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMe, getRouters, getPermissions, logout as logoutApi } from '@/api/auth'
import { clearToken } from '@/utils/auth'
import { registerDynamicRoutes, resetDynamicRoutes } from '@/router'
import { useTagsStore } from '@/store/tags'
import type { UserInfo } from '@/types/auth'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'

export const useUserStore = defineStore('user', () => {
  const tagsStore = useTagsStore()
  const userInfo = ref<UserInfo | null>(null)
  const routers = ref<TreeNode<MenuItem>[]>([])
  // 接口权限集合，如 ['POST:/admin/user', ...]；超级管理员为 ['*']
  const permissions = ref<string[]>([])
  const loaded = ref(false)

  /** 拉取用户信息 + 菜单 + 权限，并按菜单树注册动态路由（登录后或刷新页面时调用） */
  const loadProfile = async () => {
    const [me, rs, ps] = await Promise.all([getMe(), getRouters(), getPermissions()])
    userInfo.value = me
    routers.value = rs
    permissions.value = ps
    registerDynamicRoutes(rs)
    loaded.value = true
  }

  /** 是否拥有某接口权限；api 形如 'POST:/admin/user' */
  const hasPerm = (api: string): boolean => {
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(api)
  }

  const setUserInfo = (user: UserInfo) => {
    userInfo.value = user
  }

  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      clearToken()
      userInfo.value = null
      routers.value = []
      permissions.value = []
      loaded.value = false
      resetDynamicRoutes()
      tagsStore.clear()
    }
  }

  return { userInfo, routers, permissions, loaded, loadProfile, setUserInfo, hasPerm, logout }
})
