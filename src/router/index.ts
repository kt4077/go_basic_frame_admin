// 路由：静态部分只保留 登录 / 布局壳 / 404 兜底。
// 业务页面路由由数据库菜单（/admin/routers，按用户权限返回）驱动，
// 登录后调用 registerDynamicRoutes 动态注册，菜单权限即路由权限。
import { createRouter, createWebHistory } from 'vue-router'
import { getToken, clearToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import Layout from '@/layout/index.vue'
import { MenuType } from '@/enums/menu'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'
import { resolvePluginView } from '@/plugins/registry'

// 页面组件按约定自动收集：菜单 /x/y → src/views/x/y/index.vue（或 x/y.vue）
const viewModules = import.meta.glob('/src/views/**/*.vue')
const notFound = () => import('@/views/error/404.vue')

// 已动态注册的路由名（= 菜单 path），用于切换账号时重置
const addedRouteNames = new Set<string>()

const resolveView = (menuPath: string) => {
  return (
    resolvePluginView(menuPath) ??
    viewModules[`/src/views${menuPath}/index.vue`] ??
    viewModules[`/src/views${menuPath}.vue`] ??
    notFound // 数据库里配了菜单但前端没有对应页面时，兜底到 404
  )
}

/** 根据后端菜单树注册业务页面路由（仅“菜单”类型节点生成路由，目录只是分组） */
export const registerDynamicRoutes = (menus: TreeNode<MenuItem>[]) => {
  const walk = (nodes: TreeNode<MenuItem>[]) => {
    for (const node of nodes) {
      if (node.data.type === MenuType.Page && node.data.path) {
        const name = node.data.path
        if (!addedRouteNames.has(name)) {
          router.addRoute('layout', {
            path: name,
            name,
            component: resolveView(name),
            meta: { title: node.data.name },
          })
          addedRouteNames.add(name)
        }
      }
      if (node.children) walk(node.children)
    }
  }
  walk(menus)
}

/** 清除动态路由（退出登录/切换账号时调用） */
export const resetDynamicRoutes = () => {
  for (const name of addedRouteNames) {
    if (router.hasRoute(name)) router.removeRoute(name)
  }
  addedRouteNames.clear()
}

/** 菜单树中第一个叶子页面的路径，作为登录后的默认首页 */
export const firstLeafPath = (menus: TreeNode<MenuItem>[]): string => {
  for (const node of menus) {
    if (node.data.type === MenuType.Page && node.data.path) return node.data.path
    if (node.children) {
      const childPath = firstLeafPath(node.children)
      if (childPath) return childPath
    }
  }
  return ''
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/login/index.vue'), meta: { title: '登录' } },
    // 刷新中转页：标签栏“刷新当前页”先跳到这里，再 replace 回原路径
    { path: '/redirect/:path(.*)', name: 'redirect', component: () => import('@/views/redirect/index.vue') },
    {
      path: '/',
      name: 'layout',
      component: Layout,
      children: [
        { path: 'profile', name: 'profile', component: () => import('@/views/profile/index.vue'), meta: { title: '个人设置' } },
      ],
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/error/404.vue') },
  ],
})

// 全局守卫：未登录跳登录页；已登录但未加载用户信息时先加载并注册动态路由
router.beforeEach(async (to) => {
  const token = getToken()
  if (!token) {
    resetDynamicRoutes()
    return to.path === '/login' ? true : { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login') return { path: '/' }

  const userStore = useUserStore()
  if (!userStore.loaded) {
    try {
      await userStore.loadProfile()
    } catch {
      // 加载用户信息失败（登录失效/账号被删等）：清 token 回登录页，避免死循环提示
      clearToken()
      return { path: '/login' }
    }
    // 动态路由注册完成后重新解析目标地址，否则首次直达会命中 404 兜底
    return { path: to.fullPath, replace: true }
  }
  if (to.path === '/') {
    // 默认首页 = 当前用户有权限的第一个菜单页面
    const target = firstLeafPath(userStore.routers)
    return target ? { path: target } : { path: '/404' }
  }
  return true
})

export default router
