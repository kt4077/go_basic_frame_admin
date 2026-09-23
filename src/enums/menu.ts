// 菜单模块枚举

/** 菜单/按钮类型 */
export const MenuType = {
  Dir: 1,
  Page: 2,
  Button: 3,
} as const

export const MenuTypeLabels: Record<number, string> = {
  1: '目录',
  2: '菜单',
  3: '按钮',
}

/** 菜单状态 */
export const MenuStatus = {
  Show: 1,
  Hidden: 2,
} as const

export const MenuStatusLabels: Record<number, string> = {
  1: '显示',
  2: '隐藏',
}

/** 登录流水状态 */
export const LoginStatus = {
  Online: 1,
  Logout: 2,
  Kicked: 3,
} as const

export const LoginStatusLabels: Record<number, string> = {
  1: '在线',
  2: '已退出',
  3: '被踢下线',
}
