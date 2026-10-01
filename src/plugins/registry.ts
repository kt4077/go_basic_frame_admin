// 源码级插件页面注册中心。
// 插件菜单路径统一使用 /plugin/{plugin_id}/{view_path}，页面放在
// src/plugins/{plugin_id}/views/{view_path}/index.vue（或 {view_path}.vue）。
import type { RouteComponent } from 'vue-router'
import type { Component } from 'vue'
import { registerPluginIcons } from '@/utils/iconRegistry'

type ViewModule = { default: RouteComponent }
type ViewLoader = () => Promise<ViewModule>

const pluginViewModules = import.meta.glob<ViewModule>('/src/plugins/*/views/**/*.vue')
const pluginIconModules = import.meta.glob<{ default: Record<string, Component> }>('/src/plugins/*/icons.ts', { eager: true })
const pluginPathPattern = /^\/plugin\/([a-z][a-z0-9_]{1,63})\/(.+)$/

for (const [path, module] of Object.entries(pluginIconModules)) {
  const pluginId = path.match(/^\/src\/plugins\/([^/]+)\/icons\.ts$/)?.[1]
  if (pluginId) registerPluginIcons(pluginId, module.default)
}

/** 根据插件菜单路径解析编译进管理端的页面组件。 */
export const resolvePluginView = (menuPath: string): ViewLoader | undefined => {
  const matched = menuPath.match(pluginPathPattern)
  if (!matched) return undefined

  const [, pluginID, viewPath] = matched
  return pluginViewModules[`/src/plugins/${pluginID}/views/${viewPath}/index.vue`]
    ?? pluginViewModules[`/src/plugins/${pluginID}/views/${viewPath}.vue`]
}
