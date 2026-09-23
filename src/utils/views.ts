// 从 views 目录自动收集可用页面路由（Vite 构建期扫描，新增页面文件后自动出现在下拉里）
// 约定与动态路由一致：/x/y → src/views/x/y/index.vue 或 src/views/x/y.vue
const modules = import.meta.glob('/src/views/**/*.vue')

export interface ViewOption {
  path: string // 菜单路由，如 /system/user
  file: string // 对应组件文件，如 /src/views/system/user/index.vue
}

/** 非业务页面：登录页与错误页不作为菜单路由选项 */
const isExcluded = (path: string): boolean => {
  return path.startsWith('/login') || path.startsWith('/error')
}

export const getViewOptions = (): ViewOption[] => {
  const options: ViewOption[] = []
  for (const file of Object.keys(modules)) {
    const dirMatch = file.match(/^\/src\/views\/(.+)\/index\.vue$/)
    const fileMatch = file.match(/^\/src\/views\/(.+)\.vue$/)
    const path = dirMatch ? `/${dirMatch[1]}` : fileMatch ? `/${fileMatch[1]}` : null
    if (path && !isExcluded(path)) {
      options.push({ path, file })
    }
  }
  return options.sort((a, b) => a.path.localeCompare(b.path))
}
