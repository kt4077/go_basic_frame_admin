// 枚举值统一定义，按功能模块分文件。

/** 通用启用/禁用状态 */
export const Status = {
  Enabled: 1,
  Disabled: 2,
} as const

/** 状态标签文案 */
export const StatusLabels: Record<number, string> = {
  1: '启用',
  2: '禁用',
}

/** 超级管理员标志 */
export const IsSuper = {
  Yes: 1,
  No: 0,
}
